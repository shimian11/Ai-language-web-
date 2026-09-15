<template>
  <div class="editor-page">
    <header class="topbar">
      <div class="topbar-in">
        <div class="crumb">
          <RouterLink to="/admin/entries">管理后台</RouterLink>
          <span>/</span>
          <b>{{ isEdit ? '编辑案例' : '发布新提示词' }}</b>
        </div>
        <div class="spacer"></div>
        <span class="state-chip">样式 <b id="styleChip">{{ pages.length }}</b> 个 · 编辑中·未保存</span>
        <button class="btn" @click="onCancel">取消</button>
        <button class="btn" :disabled="saving" @click="save('DRAFT')">存为草稿</button>
        <button class="btn primary" :disabled="saving" @click="save('PUBLISHED')">发布</button>
      </div>
    </header>

    <main class="wrap">
      <!-- 左列 -->
      <div>
        <div class="panel">
          <div class="panel-title">
            基本发布信息 <span class="no">共享 · 对本案例所有样式生效</span>
            <span class="shared-badge">已共享</span>
          </div>
          <div class="panel-body">
            <div class="field">
              <label>案例标题 <span class="req">*</span></label>
              <input v-model="form.title" class="input" type="text" placeholder="例如：对齐类型布局集" />
            </div>
            <div class="field">
              <label>简介说明 <span class="tip">一句话讲清这组样式想表达什么</span></label>
              <textarea v-model="form.summary" class="textarea" rows="2"></textarea>
            </div>
            <div class="row2">
              <div class="field">
                <label>设计大类 <span class="req">*</span></label>
                <select class="select" :value="categoryKey" @change="onCategoryChange">
                  <option value="" disabled>请选择</option>
                  <option v-for="c in categoryStore.list" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
                  <option value="__new">＋ 新建大类…</option>
                </select>
                <div v-if="showNewCategory" class="new-inline">
                  <input
                    ref="newCategoryInputRef"
                    v-model="newCategoryName"
                    class="input"
                    placeholder="输入新大类名称，如：登录页"
                    @keydown.enter="confirmNewCategory"
                  />
                  <button class="btn" type="button" @click="confirmNewCategory">确认</button>
                </div>
              </div>
              <div class="field">
                <label>适用平台</label>
                <select v-model="form.platform" class="select">
                  <option value="web">Web 网页端</option>
                  <option value="app">App 应用端</option>
                  <option value="general">通用</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>标签</label>
              <input
                v-model="tagInput"
                class="input"
                type="text"
                placeholder="回车确认，多个用逗号分隔"
                @keydown.enter.prevent="addTag"
              />
              <div v-if="form.tags.length" class="tagbox">
                <span v-for="tag in form.tags" :key="tag" class="tag">{{ tag }}<button @click="removeTag(tag)">✕</button></span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">案例列表 <span class="no">每页 = 一个独立案例 · 共享标题 / 简介 / 大类</span></div>
          <div class="style-head">
            <div class="cap">
              同一大类下可同时录入多个独立案例：案例 1「左对齐」、案例 2「右对齐」……每个案例各自编辑 HTML、图片与提示词；切换分页或点「＋」新增案例，顶部共享信息（标题 / 简介 / 大类）保持不变。
            </div>
            <div class="pager">
              <button
                v-for="(p, i) in pages"
                :key="p.key"
                class="page"
                :class="{ on: i === activeIndex }"
                type="button"
                @click="switchPage(i)"
              >
                {{ i + 1 }}
                <span v-if="pages.length > 1" class="del" @click.stop="removePage(i)">✕</span>
              </button>
              <button class="page add" type="button" @click="addPage">＋</button>
              <span class="pager-sep"></span>
              <span class="pager-count">案例 <b id="count">{{ pages.length }}</b> / {{ pages.length }}</span>
            </div>
          </div>

          <div v-for="(p, i) in pages" :key="p.key" class="style-pane" :class="{ active: i === activeIndex }">
            <div class="row2">
              <div class="field">
                <label>样式名称 <span class="req">*</span></label>
                <input v-model="p.style" class="input" placeholder="例如：左对齐" />
              </div>
              <div class="field">
                <label>推荐场景 <span class="tip">何时选用该样式</span></label>
                <input v-model="p.scene" class="input" placeholder="例如：适合文字居多的正文排版" />
              </div>
            </div>
            <div class="field">
              <label>提示词 <span class="tip">该样式的生成提示词</span></label>
              <textarea v-model="p.prompt" class="textarea mono" rows="5"></textarea>
            </div>
            <div class="field">
              <label>效果图（可选）</label>
              <div class="dropzone" @click="picker(i)">
                <div class="icon">⬆️</div>
                <div class="t1">拖拽图片到这里，或点击上传</div>
                <div class="t2">支持 jpg / png / webp，单张 ≤ 5MB</div>
              </div>
              <input
                ref="fileInputs"
                class="hidden-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                @change="onFiles(i, $event)"
              />
              <div v-if="p.images.length" class="uploads">
                <div v-for="(img, k) in p.images" :key="img.id" class="upload">
                  <img :src="img.url" alt="效果图" />
                  <span v-if="img.isMain" class="main-flag">主图</span>
                  <div class="ops">
                    <button type="button" @click="setMain(i, k)">设为主图</button>
                    <button type="button" @click="removeImage(i, k)">删除</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <label>HTML 源码（推荐）</label>
              <div class="tabbar">
                <button :class="{ on: p.tab === 'code' }" type="button" @click="p.tab = 'code'">源码</button>
                <button :class="{ on: p.tab === 'preview' }" type="button" @click="p.tab = 'preview'">实时预览</button>
              </div>
              <textarea
                v-show="p.tab === 'code'"
                v-model="p.htmlSource"
                class="textarea mono html-src"
                rows="6"
                placeholder="<div>粘贴 AI 生成的 HTML 代码…</div>"
              ></textarea>
              <iframe
                v-show="p.tab === 'preview'"
                class="preview"
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
                :srcdoc="p.htmlSource || FALLBACK_HTML"
              ></iframe>
            </div>
            <div class="pane-foot">
              <button class="dels" type="button" @click="removePage(i)">删除此样式</button>
              <span class="pane-note">HTML 源码与效果图至少填一项</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右列 -->
      <aside>
        <div class="panel">
          <div class="panel-title">发布设置 <span class="no">共享</span></div>
          <div class="panel-body">
            <div class="publish-row">
              <span class="k">发布后首页可见</span>
              <div
                class="switch"
                :class="{ on: status === 'PUBLISHED' }"
                :title="status === 'PUBLISHED' ? '已发布' : '草稿'"
                @click="toggleStatus"
              ></div>
            </div>
            <div class="publish-row"><span class="k">样式版本数</span><span class="v">{{ pages.length }}（分页）</span></div>
            <div class="publish-row">
              <span class="k">当前样式校验</span>
              <span class="v" :style="{ color: displayValid ? 'var(--ok)' : 'var(--accent)' }">
                {{ displayValid ? '✓ HTML 已填写' : '⚠ 效果图与 HTML 至少一项' }}
              </span>
            </div>
            <div class="actions">
              <button class="btn" style="height: 42px" :disabled="saving" @click="save('DRAFT')">存为草稿</button>
              <button class="btn primary" style="height: 42px" :disabled="saving" @click="save('PUBLISHED')">发布</button>
              <button v-if="isEdit && status === 'PUBLISHED'" class="btn" style="height: 42px" @click="unpublish">
                转为草稿（下架）
              </button>
            </div>
          </div>
        </div>

        <div class="help">
          <b>多案例说明（本组）</b><br />
          · 顶部<b>共享信息</b>（标题 / 简介 / 大类 / 平台 / 标签）填一次<br />
          · 下方<b>每个分页 = 一个独立案例</b>，各自编辑<i>样式名 / 推荐场景 / 提示词 / 效果图 / HTML</i><br />
          · 「＋」新增案例，分页切换即切换到对该案例的编辑<br />
          · 保存时每个案例各创建一条记录（共享标题 / 简介 / 大类）<br /><br />
          <b>状态（仅两态）</b><br />
          <i>草稿</i> → 编辑中，仅自己可见<br />
          <i>已发布</i> → 首页与详情页可展示
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createEntry, getEntry, updateEntry } from '@/api/entry'
import { useCategoryStore } from '@/stores/category'
import type { Entry, EntryStatus, EntryImage, Platform } from '@/types'

const FALLBACK_HTML =
  "<body style='color:#7C8CA0;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0'>暂无 HTML 源码</body>"
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

let seq = 0
const nextKey = () => `k${++seq}`

interface CasePage {
  key: string
  id?: number
  /** 该分页在库中的现有状态；仅用于判断“已发布分页不应被‘存为草稿’误降级” */
  status: EntryStatus
  style: string
  scene: string
  prompt: string
  htmlSource: string
  images: EntryImage[]
  tab: 'code' | 'preview'
}

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()

const entryId = computed(() => (route.params.id ? Number(route.params.id) : undefined))
const isEdit = computed(() => entryId.value !== undefined)

const status = ref<EntryStatus>('DRAFT')
const saving = ref(false)

const form = reactive({
  title: '',
  summary: '',
  categoryId: undefined as number | undefined,
  platform: 'general' as Platform,
  tags: [] as string[],
})

const pages = ref<CasePage[]>([newPage()])
const activeIndex = ref(0)

const categoryKey = ref('')
const tagInput = ref('')
const showNewCategory = ref(false)
const newCategoryName = ref('')
const newCategoryInputRef = ref()
const fileInputs = ref<HTMLInputElement[]>([])

const displayValid = computed(() => {
  const p = pages.value[activeIndex.value]
  return p ? p.images.length > 0 || p.htmlSource.trim() !== '' : false
})

function newPage(): CasePage {
  return { key: nextKey(), status: 'DRAFT', style: '', scene: '', prompt: '', htmlSource: '', images: [], tab: 'code' }
}

function addPage(): void {
  pages.value.push(newPage())
  activeIndex.value = pages.value.length - 1
}

function switchPage(i: number): void {
  activeIndex.value = i
}

function removePage(i: number): void {
  if (pages.value.length <= 1) {
    ElMessage.info('至少保留 1 个案例')
    return
  }
  pages.value.splice(i, 1)
  if (activeIndex.value >= pages.value.length) activeIndex.value = pages.value.length - 1
}

function addTag(): void {
  const tag = tagInput.value.trim()
  if (!tag) return
  if (!form.tags.includes(tag)) form.tags.push(tag)
  tagInput.value = ''
}

function removeTag(tag: string): void {
  form.tags = form.tags.filter((t) => t !== tag)
}

function onCategoryChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  if (value === '__new') {
    form.categoryId = undefined
    showNewCategory.value = true
    nextTick(() => newCategoryInputRef.value?.focus?.())
  } else {
    form.categoryId = Number(value)
    showNewCategory.value = false
  }
}

async function confirmNewCategory(): Promise<void> {
  const name = newCategoryName.value.trim()
  if (!name) return
  const created = await categoryStore.addCategory(name)
  form.categoryId = created.id
  categoryKey.value = String(created.id)
  showNewCategory.value = false
  newCategoryName.value = ''
  ElMessage.success(`已创建大类「${name}」`)
}

function toggleStatus(): void {
  status.value = status.value === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
}

// ===== 图片上传（原生 dropzone，对齐原型）=====
function picker(i: number): void {
  fileInputs.value[i]?.click()
}

function onFiles(i: number, event: Event): void {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  ;(event.target as HTMLInputElement).value = ''
  for (const file of files) addFile(i, file)
}

async function addFile(i: number, file: File): Promise<void> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    ElMessage.error(`不支持的图片格式：${file.name}`)
    return
  }
  if (file.size > MAX_SIZE) {
    ElMessage.error(`图片超过 5MB 限制：${file.name}`)
    return
  }
  const url = URL.createObjectURL(file)
  const list = pages.value[i].images
  const next = [...list, { id: -Date.now() - list.length, url, isMain: list.length === 0 }]
  pages.value[i].images = next
}

function setMain(i: number, k: number): void {
  pages.value[i].images = pages.value[i].images.map((img, idx) => ({ ...img, isMain: idx === k }))
}

function removeImage(i: number, k: number): void {
  const list = pages.value[i].images
  const next = list.filter((_, idx) => idx !== k)
  if (list[k]?.isMain && next.length) next[0] = { ...next[0], isMain: true }
  pages.value[i].images = next
}

function validate(): boolean {
  if (!form.title.trim()) {
    ElMessage.warning('请填写案例标题')
    return false
  }
  if (form.categoryId === undefined) {
    ElMessage.warning('请选择设计大类')
    return false
  }
  if (pages.value.length === 0) {
    ElMessage.warning('请至少添加一个案例')
    return false
  }
  for (const [i, p] of pages.value.entries()) {
    if (!p.style.trim()) {
      ElMessage.warning(`请填写第 ${i + 1} 个样式的名称`)
      return false
    }
    if (!(p.images.length > 0 || p.htmlSource.trim() !== '')) {
      ElMessage.warning(`第 ${i + 1} 个样式：效果图与 HTML 源码至少填一项`)
      return false
    }
  }
  return true
}

function onCancel(): void {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'admin-entry-list' })
  }
}

async function save(targetStatus: EntryStatus): Promise<void> {
  if (!validate()) return
  saving.value = true
  let changedCount = 0
  try {
    for (const p of pages.value) {
      // 已发布的分页不因“存为草稿”而降级（下架请用专属按钮 unpublish）；
      // 其余情况（新分页 / 草稿分页）按本次按钮意图设置状态。
      const keepPublished = p.id !== undefined && p.status === 'PUBLISHED' && targetStatus === 'DRAFT'
      const appliedStatus = keepPublished ? 'PUBLISHED' : targetStatus
      const summary = p.scene.trim() ? `${form.summary.trim()}\n适用场景：${p.scene.trim()}` : form.summary.trim()
      const payload: Partial<Entry> = {
        title: form.title.trim(),
        summary,
        categoryId: form.categoryId,
        platform: form.platform,
        style: p.style.trim(),
        prompt: p.prompt,
        htmlSource: p.htmlSource.trim() || undefined,
        images: p.images,
        tags: form.tags,
        status: appliedStatus,
      }
      if (p.id) await updateEntry(p.id, payload)
      else await createEntry(payload)
      if (appliedStatus === targetStatus) changedCount++
      p.status = appliedStatus
    }
    status.value = targetStatus
    ElMessage.success(
      targetStatus === 'PUBLISHED'
        ? `已发布 ${changedCount} 个案例`
        : changedCount > 0
          ? `已存为草稿 ${changedCount} 个案例${pages.value.length > changedCount ? `，另有 ${pages.value.length - changedCount} 个已发布案例保持不变` : ''}`
          : '无新内容待存为草稿',
    )
    router.push({ name: 'admin-entry-list' })
  } finally {
    saving.value = false
  }
}

async function unpublish(): Promise<void> {
  if (!isEdit.value) return
  await updateEntry(entryId.value as number, { status: 'DRAFT' })
  status.value = 'DRAFT'
  ElMessage.success('已转为草稿（下架）')
  router.push({ name: 'admin-entry-list' })
}

onMounted(async () => {
  if (!categoryStore.list.length) await categoryStore.fetchCategories()
  if (isEdit.value) {
    const entry = await getEntry(entryId.value as number)
    form.title = entry.title
    form.categoryId = entry.categoryId
    categoryKey.value = String(entry.categoryId)
    form.platform = entry.platform || 'general'
    form.tags = [...entry.tags]
    status.value = entry.status
    const sceneLine = entry.summary.split('\n').find((l) => l.startsWith('适用场景：'))
    const scene = sceneLine ? sceneLine.replace(/^适用场景：/, '') : ''
    form.summary = entry.summary
      .split('\n')
      .filter((l) => !l.startsWith('适用场景：'))
      .join('\n')
      .trimEnd()
    pages.value = [
      {
        key: nextKey(),
        id: entry.id,
        status: entry.status,
        style: entry.style,
        scene,
        prompt: entry.prompt,
        htmlSource: entry.htmlSource ?? '',
        images: entry.images ?? [],
        tab: 'code',
      },
    ]
    activeIndex.value = 0
  }
})
</script>

<style scoped>
/* ===== 顶部横条 ===== */
.topbar {
  background: var(--card);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-in {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.crumb {
  font-size: 13.5px;
  color: var(--ink-2);
  display: flex;
  gap: 8px;
  align-items: center;
}

.crumb b {
  color: var(--ink);
  font-weight: 600;
}

.crumb a {
  color: inherit;
  text-decoration: none;
}

.crumb a:hover {
  color: var(--accent-ink);
}

.spacer {
  flex: 1;
}

.state-chip {
  font-size: 12px;
  color: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 12px;
  background: var(--bg);
}

.state-chip b {
  color: var(--accent-ink);
}

.btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13.5px;
  cursor: pointer;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  transition: 0.15s;
  font-family: inherit;
}

.btn:hover {
  border-color: var(--ink);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
  font-weight: 600;
}

.btn.primary:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

/* ===== 主体布局 ===== */
.wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 28px 80px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 22px;
  align-items: start;
}

@media (max-width: 1020px) {
  .wrap {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}

.panel + .panel {
  margin-top: 18px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  font-weight: 650;
}

.panel-title .no {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--ink-2);
  font-weight: 400;
}

.panel-title .shared-badge {
  margin-left: auto;
  font-size: 11px;
  color: var(--accent-ink);
  background: var(--accent-soft);
  border-radius: 5px;
  padding: 2px 8px;
}

.panel-body {
  padding: 20px;
}

/* ===== 表单 ===== */
.field {
  margin-bottom: 18px;
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 7px;
}

.field .req {
  color: var(--accent);
}

.field .tip {
  font-weight: 400;
  color: var(--ink-2);
  font-size: 12px;
  margin-left: 6px;
}

.input,
.select,
.textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 9px;
  font-size: 14px;
  color: var(--ink);
  background: var(--card);
  outline: none;
  transition: border 0.15s;
  font-family: inherit;
  padding: 0 12px;
}

.input {
  height: 40px;
}

.select {
  height: 40px;
  appearance: auto;
}

.textarea {
  padding: 10px 12px;
  line-height: 1.7;
  resize: vertical;
}

.input:focus,
.select:focus,
.textarea:focus {
  border-color: var(--accent);
}

.textarea.mono {
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  line-height: 1.8;
}

.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.new-inline {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.new-inline .input {
  flex: 1;
}

.new-inline .btn {
  height: 40px;
  border-radius: 9px;
  flex-shrink: 0;
}

.tagbox {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  font-size: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 3px 9px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.tag button {
  border: none;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.tag button:hover {
  color: var(--accent);
}

/* ===== 分页导航 ===== */
.style-head {
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}

.style-head .cap {
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.6;
  margin-bottom: 10px;
}

.pager {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.page {
  min-width: 34px;
  height: 34px;
  padding: 0 9px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--card);
  font-size: 13.5px;
  color: var(--ink-2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: 0.15s;
  position: relative;
  font-family: inherit;
}

.page:hover {
  border-color: var(--accent);
  color: var(--ink);
}

.page.on {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
  font-weight: 600;
}

.page .del {
  font-size: 11px;
  color: inherit;
  opacity: 0.55;
}

.page .del:hover {
  opacity: 1;
}

.page.add {
  font-weight: 600;
  color: var(--accent-ink);
  border-style: dashed;
  width: 38px;
  padding: 0;
}

.page.add:hover {
  background: var(--accent-soft);
}

.pager-sep {
  width: 1px;
  height: 22px;
  background: var(--line);
}

.pager-count {
  font-size: 12px;
  color: var(--ink-2);
  margin-left: 4px;
  white-space: nowrap;
}

.pager-count b {
  color: var(--ink);
}

/* ===== 每个样式分页内容 ===== */
.style-pane {
  display: none;
  padding: 20px;
}

.style-pane.active {
  display: block;
}

/* 图片上传 */
.dropzone {
  border: 1.5px dashed #cfc9bd;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: 0.15s;
  background: var(--bg);
}

.dropzone:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.dropzone .icon {
  font-size: 24px;
}

.dropzone .t1 {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.dropzone .t2 {
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-2);
}

.hidden-input {
  display: none;
}

.uploads {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.upload {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.upload img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
}

.main-flag {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 10.5px;
  background: var(--accent);
  color: #fff;
  border-radius: 5px;
  padding: 2px 7px;
  font-weight: 600;
}

.ops {
  display: flex;
  border-top: 1px solid var(--line);
}

.ops button {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 11.5px;
  color: var(--ink-2);
  padding: 6px 0;
  cursor: pointer;
}

.ops button:first-child {
  border-right: 1px solid var(--line);
}

.ops button:hover {
  color: var(--accent-ink);
  background: var(--bg);
}

/* HTML 源码 + 实时预览 */
.tabbar {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.tabbar button {
  height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 13px;
  color: var(--ink-2);
  cursor: pointer;
  font-family: inherit;
}

.tabbar button.on {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
  font-weight: 600;
}

.preview {
  width: 100%;
  height: 280px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #0b1220;
  display: block;
}

.pane-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
}

.dels {
  color: #e5484d;
  font-size: 12.5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-family: inherit;
}

.dels:hover {
  text-decoration: underline;
}

.pane-note {
  color: var(--ink-2);
  font-size: 12px;
}

/* ===== 右侧发布面板 ===== */
.publish-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 13.5px;
}

.publish-row:last-of-type {
  border-bottom: none;
}

.publish-row .k {
  color: var(--ink-2);
}

.publish-row .v {
  font-weight: 600;
}

.switch {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: #cfc9bd;
  position: relative;
  cursor: pointer;
  transition: 0.15s;
}

.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: 0.15s;
}

.switch.on {
  background: var(--accent);
}

.switch.on::after {
  left: 18px;
}

.actions {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.help {
  margin-top: 16px;
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.8;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px 14px;
}

.help b {
  color: var(--ink);
}

.help i {
  font-style: normal;
  color: var(--accent-ink);
}
</style>