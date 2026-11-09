<template>
  <!-- 后台文章编辑器：心得 / 实习 / 面试 共用，字段按类型自适应 -->
  <div class="ae">
    <header class="ae-bar">
      <div class="ae-bar-left">
        <RouterLink class="ae-back" :to="meta.adminPath">← 返回{{ meta.label }}管理</RouterLink>
        <div class="ae-bar-title">
          <span>{{ isEdit ? '编辑' : meta.editorTitle }}</span>
          <span class="kicker">{{ meta.kicker }}</span>
        </div>
      </div>
      <div class="ae-bar-actions">
        <el-button round :loading="saving" @click="save('DRAFT')">存为草稿</el-button>
        <el-button type="primary" round :loading="saving" @click="save('PUBLISHED')">
          发布
        </el-button>
      </div>
    </header>

    <main class="ae-wrap">
      <h1 class="ae-title">{{ isEdit ? '编辑' : meta.editorTitle }}</h1>

      <div v-if="loading" class="ae-empty">正在加载…</div>

      <div v-else class="ae-grid">
        <div>
          <!-- 基本信息 -->
          <section class="ae-panel">
            <div class="ae-panel-head">
              <span class="ae-panel-title">基本信息</span>
              <span class="ae-hint">字段随内容类型自适应</span>
            </div>
            <div class="ae-panel-body">
              <div class="ae-field">
                <label for="title">标题<b>*</b></label>
                <input id="title" v-model="form.title" class="ae-input" type="text" placeholder="一句话说清这篇文章讲什么" />
              </div>

              <div class="ae-field">
                <label for="summary">摘要</label>
                <textarea
                  id="summary"
                  v-model="form.summary"
                  class="ae-textarea"
                  style="min-height: 72px"
                  placeholder="显示在列表与卡片上的一段简介"
                ></textarea>
              </div>

              <div class="ae-row">
                <!-- 心得 / 面试：栏目 -->
                <div v-if="topics.length" class="ae-field">
                  <label for="topic">栏目<b>*</b></label>
                  <select id="topic" v-model="form.topic" class="ae-select">
                    <option v-for="t in topics" :key="t.key" :value="t.key">{{ t.label }}</option>
                  </select>
                </div>

                <!-- 面经分享：结果 -->
                <div v-if="form.type === 'interview' && form.topic === 'exp'" class="ae-field">
                  <label for="result">结果</label>
                  <select id="result" v-model="form.result" class="ae-select" @change="syncResultClass">
                    <option value="">不标注</option>
                    <option v-for="r in INTERVIEW_RESULTS" :key="r.label" :value="r.label">
                      {{ r.label }}
                    </option>
                  </select>
                </div>

                <!-- 八股 / 算法：保留难度或频次标注（种子数据已有值，不能丢） -->
                <div
                  v-if="form.type === 'interview' && form.topic !== 'exp'"
                  class="ae-field"
                >
                  <label for="mark">标注</label>
                  <input id="mark" v-model="form.result" class="ae-input" type="text" placeholder="如：高频 / 手写 / 中等" />
                </div>
              </div>

              <!-- 实习：公司 + 时间点 -->
              <div v-if="form.type === 'internship'" class="ae-row ae-row-top">
                <div class="ae-field">
                  <label for="company">所属公司</label>
                  <select id="company" v-model="form.companyKey" class="ae-select" @change="onCompanyChange">
                    <option value="">不挂公司（阶段总结）</option>
                    <option v-for="c in companies" :key="c.key" :value="c.key">{{ c.name }}</option>
                    <option value="__new">＋ 新建公司（别名）…</option>
                  </select>
                </div>
                <div class="ae-field">
                  <label for="date">时间点<b>*</b></label>
                  <input id="date" v-model="form.displayDate" class="ae-input" type="text" placeholder="如：2026-08" />
                </div>
              </div>
              <div v-if="form.type === 'internship'" class="ae-hint" style="margin-top: 10px">
                记录将挂到该公司的时间线上；阶段总结类可不选公司。
              </div>

              <div v-if="form.type !== 'note'" class="ae-mask-hint">
                <b>脱敏提醒：</b>公司名请使用脱敏别名（如「某大厂」「某独角兽」）；正文中不要出现真实公司、内部系统与人名。
              </div>

              <!-- 非实习：展示日期 / 阅读时长 -->
              <div v-if="form.type !== 'internship'" class="ae-row">
                <div class="ae-field">
                  <label for="date2">展示日期</label>
                  <input id="date2" v-model="form.displayDate" class="ae-input" type="text" placeholder="如：2026-10-18" />
                </div>
                <div class="ae-field">
                  <label for="read">阅读时长</label>
                  <input id="read" v-model="form.readLabel" class="ae-input" type="text" placeholder="如：6 分钟" />
                </div>
              </div>

              <div class="ae-field" style="margin-bottom: 0">
                <label for="tag">标签</label>
                <input
                  id="tag"
                  v-model="tagInput"
                  class="ae-input"
                  type="text"
                  placeholder="输入中文标签后按回车（如：复盘、AI）"
                  @keydown.enter.prevent="addTag"
                />
                <div v-if="form.tags.length" class="ae-tags">
                  <button v-for="t in form.tags" :key="t" type="button" class="ae-tag" @click="removeTag(t)">
                    {{ t }} ×
                  </button>
                </div>
                <div class="ae-hint">标签仅用于检索与关联，不作为前台栏目</div>
              </div>
            </div>
          </section>

          <!-- 正文 -->
          <section class="ae-panel">
            <div class="ae-panel-head">
              <span class="ae-panel-title">正文（Markdown）</span>
              <div class="ae-tabs">
                <button type="button" class="ae-tab" :class="{ on: mdTab === 'edit' }" @click="mdTab = 'edit'">
                  源码
                </button>
                <button type="button" class="ae-tab" :class="{ on: mdTab === 'preview' }" @click="mdTab = 'preview'">
                  预览
                </button>
              </div>
            </div>
            <div class="ae-panel-body">
              <textarea
                v-if="mdTab === 'edit'"
                v-model="form.body"
                class="ae-textarea ae-md"
                placeholder="支持 # 标题、- 列表、> 引用、**加粗**、`行内代码`"
              ></textarea>
              <!-- eslint-disable-next-line vue/no-v-html -- 预览内容来自本人录入 -->
              <div v-else class="ae-md-preview" v-html="previewHtml"></div>
              <div class="ae-hint" style="margin-top: 10px">
                支持 # / ## 标题、- 列表、&gt; 引用、**加粗**、`行内代码`；发布后按纸感样式渲染
              </div>
            </div>
          </section>
        </div>

        <!-- 右侧：发布设置 -->
        <aside class="ae-aside">
          <section class="ae-panel">
            <div class="ae-panel-head"><span class="ae-panel-title">发布设置</span></div>
            <div class="ae-panel-body">
              <div class="ae-pub-row">
                <button
                  class="ae-switch"
                  :class="{ on: publishOn }"
                  type="button"
                  :aria-pressed="publishOn ? 'true' : 'false'"
                  @click="publishOn = !publishOn"
                >
                  <i></i>
                </button>
                <div>
                  <div class="ae-pub-state">{{ publishOn ? '发布' : '草稿' }}</div>
                  <div class="ae-hint">
                    {{ publishOn ? '保存后立即出现在前台对应栏目。' : '当前为草稿：仅自己可见。' }}
                  </div>
                </div>
              </div>
              <div class="ae-pub-actions">
                <el-button round :loading="saving" @click="save('DRAFT')">存为草稿</el-button>
                <el-button type="primary" round :loading="saving" @click="save('PUBLISHED')">
                  发布
                </el-button>
              </div>
              <div class="ae-hint" style="margin-top: 14px">
                草稿仅自己可见；下架请在对应管理页操作。
              </div>
            </div>
          </section>

          <section class="ae-panel">
            <div class="ae-panel-head"><span class="ae-panel-title">本文将展示在</span></div>
            <div class="ae-panel-body">
              <div class="ae-hint">{{ meta.destination }}</div>
              <div class="ae-hint" style="margin-top: 10px">
                当前状态：{{ form.status === 'PUBLISHED' ? '已发布' : '草稿' }}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  createArticle,
  createCompany,
  getArticleDetail,
  listCompanies,
  updateArticle,
  updateArticleStatus,
} from '@/api/article'
import type { ArticleSavePayload, CompanyItem } from '@/api/article'
import { ARTICLE_TOPICS, ARTICLE_TYPE_META, INTERVIEW_RESULTS, topicLabel } from '@/config/article'
import { renderMarkdown } from '@/utils/markdown'

import type { ArticleType, EntryStatus } from '@/types'

const route = useRoute()
const router = useRouter()

/** 编辑态：路由带 id */
const articleId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => articleId.value !== null)

/** 表单状态 */
const form = reactive({
  type: 'note' as ArticleType,
  topic: '',
  title: '',
  summary: '',
  body: '',
  tags: [] as string[],
  companyKey: '',
  displayDate: '',
  result: '',
  resultClass: '',
  readLabel: '',
  status: 'DRAFT' as EntryStatus,
})

/** 当前内容类型对应的元信息与栏目 */
const meta = computed(() => ARTICLE_TYPE_META[form.type])
const topics = computed(() => ARTICLE_TOPICS[form.type])

const companies = ref<CompanyItem[]>([])
const tagInput = ref('')
const mdTab = ref<'edit' | 'preview'>('edit')
const publishOn = ref(true)
const loading = ref(true)
const saving = ref(false)

/** 表单回填期间跳过栏目联动清空 */
let hydrating = false

/** 正文预览 HTML */
const previewHtml = computed(() => renderMarkdown(form.body))

/** 本地日期 yyyy-MM-dd（避免 toISOString 的时区偏移） */
function today(): string {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 面经结果 → 徽标样式 */
function syncResultClass(): void {
  const hit = INTERVIEW_RESULTS.find((r) => r.label === form.result)
  form.resultClass = hit ? hit.className : ''
}

/** 标签增删 */
function addTag(): void {
  const v = tagInput.value.trim()
  if (!v) return
  if (!form.tags.includes(v)) form.tags.push(v)
  tagInput.value = ''
}
function removeTag(t: string): void {
  form.tags = form.tags.filter((x) => x !== t)
}

/** 实习：选择「新建公司」时弹窗录入别名 */
async function onCompanyChange(): Promise<void> {
  if (form.companyKey !== '__new') return
  form.companyKey = ''
  try {
    const { value } = await ElMessageBox.prompt('新公司别名（脱敏，如「某大厂」）', '新建公司', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入公司别名',
    })
    const created = await createCompany({ name: value.trim() })
    companies.value = await listCompanies()
    form.companyKey = created.key
    ElMessage.success(`已新增公司「${created.name}」`)
  } catch {
    // 取消不做任何事
  }
}

/** 栏目切换：清空上一个栏目的结果标注（首次回填时 old 为空，不触发） */
watch(
  () => form.topic,
  (_val, old) => {
    if (hydrating || !old) return
    form.result = ''
    form.resultClass = ''
  },
)

/** 初始化：编辑拉详情，新建按 query.type 准备空表单 */
async function init(): Promise<void> {
  loading.value = true
  try {
    const co = await listCompanies()
    companies.value = co

    if (isEdit.value && articleId.value !== null) {
      hydrating = true
      const a = await getArticleDetail(articleId.value)
      form.type = a.type
      form.topic = a.topic || ARTICLE_TOPICS[a.type][0]?.key || ''
      form.title = a.title
      form.summary = a.summary
      form.body = a.body
      form.tags = [...a.tags]
      form.companyKey = a.company ?? ''
      form.displayDate = a.date
      form.result = a.result ?? ''
      form.resultClass = a.resultClass ?? ''
      form.readLabel = a.read
      form.status = a.status
      publishOn.value = a.status === 'PUBLISHED'
      hydrating = false
    } else {
      const q = String(route.query.type ?? '')
      form.type = q === 'internship' || q === 'interview' ? q : 'note'
      form.topic = ARTICLE_TOPICS[form.type][0]?.key ?? ''
      form.displayDate = form.type === 'internship' ? '' : today()
      form.status = 'DRAFT'
      publishOn.value = true
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '加载失败')
  } finally {
    loading.value = false
  }
}

/** 组装提交数据 */
function buildPayload(): ArticleSavePayload {
  const company = companies.value.find((c) => c.key === form.companyKey)
  return {
    type: form.type,
    topic: form.type === 'internship' ? '' : form.topic,
    // 实习的 sub 存公司别名，其余存栏目显示名
    sub: form.type === 'internship' ? (company?.name ?? '') : topicLabel(form.type, form.topic),
    title: form.title.trim(),
    summary: form.summary.trim(),
    body: form.body,
    tags: form.tags,
    companyKey: form.type === 'internship' ? form.companyKey || undefined : undefined,
    displayDate: form.displayDate.trim(),
    result: form.result.trim(),
    resultClass: form.resultClass,
    readLabel: form.readLabel.trim(),
  }
}

/** 保存：draft = 存草稿，published = 发布 */
async function save(target: EntryStatus): Promise<void> {
  if (!form.title.trim()) {
    ElMessage.warning('请先填写标题')
    return
  }
  if (form.type === 'internship' && !form.displayDate.trim()) {
    ElMessage.warning('实习记录需要填写时间点')
    return
  }

  saving.value = true
  try {
    const payload = buildPayload()
    if (articleId.value === null) {
      await createArticle({ ...payload, status: target })
    } else {
      await updateArticle(articleId.value, payload)
      // 更新接口不改状态，状态变化需单独调用（首次发布会由后端补 published_at）
      if (form.status !== target) {
        await updateArticleStatus(articleId.value, target)
      }
    }
    ElMessage.success(target === 'PUBLISHED' ? '已发布' : '已存为草稿')
    router.push(meta.value.adminPath)
  } catch {
    // 错误提示已由 request.ts 统一弹出
  } finally {
    saving.value = false
  }
}

onMounted(init)
</script>

<style scoped>
.ae {
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
}

/* 顶栏 */
.ae-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 26px;
  background: color-mix(in srgb, var(--paper-2) 88%, transparent);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
}

.ae-bar-left {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.ae-back {
  font-size: 12px;
  color: var(--ink-2);
  white-space: nowrap;
  text-decoration: none;
}

.ae-back:hover {
  color: var(--red);
}

.ae-bar-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.ae-bar-title .kicker {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  margin-top: 3px;
  text-transform: uppercase;
}

.ae-bar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 主体 */
.ae-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 26px 26px 64px;
}

.ae-title {
  font-family: var(--serif);
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 22px;
}

.ae-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 22px;
  align-items: start;
}

.ae-aside {
  position: sticky;
  top: 82px;
}

.ae-panel {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.ae-panel + .ae-panel {
  margin-top: 20px;
}

.ae-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
}

.ae-panel-title {
  font-weight: 650;
  font-size: 14px;
}

.ae-panel-body {
  padding: 18px;
}

.ae-field {
  margin-bottom: 16px;
}

.ae-field label {
  display: block;
  font-size: 12.5px;
  color: var(--ink-2);
  margin-bottom: 7px;
}

.ae-field label b {
  color: var(--red);
  margin-left: 3px;
}

.ae-input,
.ae-select,
.ae-textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--paper-2);
  color: var(--ink);
  font-size: 13.5px;
  padding: 9px 12px;
  outline: none;
  transition: border 0.15s;
  font-family: inherit;
}

.ae-input:focus,
.ae-select:focus,
.ae-textarea:focus {
  border-color: var(--ink);
}

.ae-textarea {
  resize: vertical;
  line-height: 1.8;
}

.ae-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.ae-row-top {
  margin-top: 16px;
}

.ae-hint {
  font-size: 10.5px;
  color: var(--ink-3);
  margin-top: 6px;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  line-height: 1.7;
}

.ae-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.ae-tag {
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink-2);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11.5px;
  cursor: pointer;
  transition: 0.2s;
}

.ae-tag:hover {
  color: var(--red);
  border-color: var(--red);
}

.ae-mask-hint {
  margin: 0 0 16px;
  padding: 10px 14px;
  border: 1px dashed var(--gold);
  border-radius: 10px;
  background: color-mix(in srgb, var(--gold) 10%, transparent);
  color: #8a6423;
  font-size: 11.5px;
  line-height: 1.7;
}

/* 正文 */
.ae-tabs {
  display: flex;
  gap: 6px;
}

.ae-tab {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
}

.ae-tab.on {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper-2);
}

.ae-md {
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.9;
  min-height: 360px;
}

.ae-md-preview {
  min-height: 360px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--paper-2);
  font-size: 14px;
  line-height: 2;
}

.ae-md-preview :deep(h1),
.ae-md-preview :deep(h2),
.ae-md-preview :deep(h3) {
  font-family: var(--serif);
  font-size: 19px;
  margin: 18px 0 10px;
}

.ae-md-preview :deep(blockquote) {
  margin: 14px 0;
  padding: 12px 16px;
  border-left: 3px solid var(--red);
  background: var(--paper);
  color: var(--ink-2);
  font-size: 13px;
}

.ae-md-preview :deep(code) {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--paper-3);
  padding: 2px 6px;
  border-radius: 5px;
}

/* 发布设置 */
.ae-pub-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.ae-switch {
  flex: 0 0 auto;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--paper-3);
  position: relative;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 2px;
}

.ae-switch i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--paper-2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
  transition: 0.2s;
}

.ae-switch.on {
  background: var(--green);
  border-color: var(--green);
}

.ae-switch.on i {
  left: 22px;
}

.ae-pub-state {
  font-size: 13.5px;
  font-weight: 600;
}

.ae-pub-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ae-empty {
  padding: 60px 0;
  text-align: center;
  color: var(--ink-2);
}

@media (max-width: 1020px) {
  .ae-grid {
    grid-template-columns: 1fr;
  }

  .ae-aside {
    position: static;
  }
}
</style>
