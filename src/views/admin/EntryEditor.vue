<template>
  <div class="page">
    <div class="page-head">
      <div class="crumb">
        <RouterLink to="/admin/entries">管理后台</RouterLink>
        <span>/</span>
        <b>{{ isEdit ? '编辑案例' : '发布新提示词' }}</b>
      </div>
      <div class="spacer"></div>
      <span class="state-chip">
        当前状态：
        <b :style="{ color: status === 'PUBLISHED' ? 'var(--ok)' : 'var(--accent-ink)' }">
          {{ status === 'PUBLISHED' ? '已发布' : '草稿' }}
        </b>
      </span>
    </div>

    <div class="editor-layout">
      <!-- 左列：四步表单 -->
      <div>
        <div class="panel">
          <div class="panel-title">基本信息 <span class="no">STEP 1</span></div>
          <div class="panel-body">
            <div class="field">
              <label>案例标题 <span class="req">*</span></label>
              <el-input v-model="form.title" placeholder="例如：指挥中心主视觉大屏：环形数据围绕核心指标" />
            </div>
            <div class="field">
              <label>简介说明 <span class="tip">一句话讲清这个设计的看点</span></label>
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="2"
                placeholder="例如：中央放核心 KPI 大数字，四周环绕趋势图与环形占比，一眼锁定重点。"
              />
            </div>
            <div class="row2">
              <div class="field">
                <label>设计大类 <span class="req">*</span> <span class="tip">可直接新建</span></label>
                <el-select v-model="form.categoryId" style="width: 100%" @change="onCategoryChange">
                  <el-option
                    v-for="category in categoryStore.list"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                  <el-option label="＋ 新建大类…" :value="NEW_CATEGORY" />
                </el-select>
                <div v-if="showNewCategory" class="new-inline">
                  <el-input
                    ref="newCategoryInputRef"
                    v-model="newCategoryName"
                    placeholder="输入新大类名称，如：登录页"
                    @keydown.enter="confirmNewCategory"
                  />
                  <el-button type="primary" @click="confirmNewCategory">确认</el-button>
                </div>
              </div>
              <div class="field">
                <label>具体样式 <span class="req">*</span> <span class="tip">自由填写，如：中心聚焦型</span></label>
                <el-input v-model="form.style" placeholder="例如：中心聚焦型" />
              </div>
            </div>
            <div class="field">
              <label>标签 <span class="tip">回车添加</span></label>
              <el-input
                v-model="tagInput"
                placeholder="输入标签后回车确认"
                @keydown.enter.prevent="addTag"
              />
              <div v-if="form.tags.length" class="tagbox">
                <span v-for="tag in form.tags" :key="tag" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)">✕</button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">提示词 <span class="no">STEP 2 · 单份，支持 Markdown</span></div>
          <div class="panel-body">
            <PromptEditor v-model="form.prompt" :height="320" />
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">效果图（可选） <span class="no">STEP 3 · 未上传时仅以 HTML 演示作为展示</span></div>
          <div class="panel-body">
            <ImageUploader v-model="form.images" :upload="mockUpload" />
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">HTML 源码（推荐） <span class="no">STEP 4 · 动态效果首选 · 与效果图至少填一项</span></div>
          <div class="panel-body">
            <div class="tabbar">
              <button :class="{ on: htmlTab === 'code' }" type="button" @click="htmlTab = 'code'">
                源码
              </button>
              <button
                :class="{ on: htmlTab === 'preview' }"
                type="button"
                @click="htmlTab = 'preview'"
              >
                实时预览
              </button>
            </div>
            <el-input
              v-show="htmlTab === 'code'"
              v-model="form.htmlSource"
              type="textarea"
              :rows="10"
              class="mono"
              placeholder="<div>粘贴 AI 生成的 HTML 代码…</div>"
            />
            <HtmlPreview
              v-if="htmlTab === 'preview'"
              :source="form.htmlSource || '<body style=\'color:#7C8CA0;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0\'>暂无 HTML 源码</body>'"
              height="300px"
              :lazy="false"
            />
          </div>
        </div>
      </div>

      <!-- 右列：发布设置 -->
      <aside>
        <div class="panel">
          <div class="panel-title">发布设置</div>
          <div class="panel-body">
            <div class="publish-row">
              <span class="k">发布后首页可见</span>
              <span class="v">{{ status === 'PUBLISHED' ? '是' : '否（草稿）' }}</span>
            </div>
            <div class="publish-row">
              <span class="k">发布日期</span>
              <span class="v">{{ form.publishedAt || '发布时自动记录' }}</span>
            </div>
            <div class="publish-row">
              <span class="k">展示方式校验</span>
              <span class="v" :style="{ color: displayValid ? 'var(--ok)' : 'var(--accent)' }">
                {{ displayValid ? '✓ 已满足' : '⚠ 效果图与 HTML 至少一项' }}
              </span>
            </div>
            <div class="actions">
              <el-button style="width: 100%" round @click="onCancel">取消</el-button>
              <el-button style="width: 100%" round :loading="saving" @click="save('DRAFT')">
                存为草稿
              </el-button>
              <el-button
                style="width: 100%"
                type="primary"
                round
                :loading="saving"
                @click="save('PUBLISHED')"
              >
                发布
              </el-button>
              <el-button
                v-if="isEdit && status === 'PUBLISHED'"
                style="width: 100%"
                round
                @click="unpublish"
              >
                转为草稿（下架）
              </el-button>
            </div>
          </div>
        </div>

        <div class="help">
          <b>展示方式说明</b><br />
          效果图与 HTML 源码<b>至少填一项</b>（保存时自动校验）：<br />
          · 纯 HTML → 详情页以动态渲染为主展示，卡片缩略图亦实时渲染<br />
          · 纯图片 → 静态展示，适合位图类生成结果<br />
          · 组合 → HTML 演示在前，效果图作为补充截图
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import HtmlPreview from '@/components/business/HtmlPreview.vue'
import ImageUploader from '@/components/business/ImageUploader.vue'
import PromptEditor from '@/components/business/PromptEditor.vue'
import { createEntry, getEntry, updateEntry } from '@/api/entry'
import { useCategoryStore } from '@/stores/category'

import type { Entry, EntryStatus } from '@/types'

const NEW_CATEGORY = -1

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()

const entryId = computed(() => (route.params.id ? Number(route.params.id) : undefined))
const isEdit = computed(() => entryId.value !== undefined)

const status = ref<EntryStatus>('DRAFT')
const saving = ref(false)
const htmlTab = ref<'code' | 'preview'>('code')

const form = reactive({
  title: '',
  summary: '',
  categoryId: undefined as number | undefined,
  style: '',
  prompt: '',
  htmlSource: '',
  images: [] as Entry['images'],
  tags: [] as string[],
  publishedAt: undefined as string | undefined,
})

const tagInput = ref('')
const showNewCategory = ref(false)
const newCategoryName = ref('')
const newCategoryInputRef = ref()

const displayValid = computed(() => form.images.length > 0 || form.htmlSource.trim() !== '')

const mockUpload = async (file: File): Promise<{ url: string }> => {
  return { url: URL.createObjectURL(file) }
}

function addTag(): void {
  const tag = tagInput.value.trim()
  if (!tag) return
  if (!form.tags.includes(tag)) form.tags.push(tag)
  tagInput.value = ''
}

function removeTag(tag: string): void {
  form.tags = form.tags.filter((item) => item !== tag)
}

function onCategoryChange(value: number): void {
  if (value === NEW_CATEGORY) {
    showNewCategory.value = true
    nextTick(() => newCategoryInputRef.value?.focus?.())
  } else {
    showNewCategory.value = false
  }
}

async function confirmNewCategory(): Promise<void> {
  const name = newCategoryName.value.trim()
  if (!name) return
  const created = await categoryStore.addCategory(name)
  form.categoryId = created.id
  showNewCategory.value = false
  newCategoryName.value = ''
  ElMessage.success(`已创建大类「${name}」`)
}

function validate(): boolean {
  if (!form.title.trim()) {
    ElMessage.warning('请填写案例标题')
    return false
  }
  if (form.categoryId === undefined || form.categoryId === NEW_CATEGORY) {
    ElMessage.warning('请选择设计大类')
    return false
  }
  if (!form.style.trim()) {
    ElMessage.warning('请填写具体样式')
    return false
  }
  if (!displayValid.value) {
    ElMessage.warning('效果图与 HTML 源码至少填一项')
    return false
  }
  return true
}

// 智能返回：有站内历史则回退（保留来源页），直接输入 URL 进入时回落到案例列表
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
  try {
    const payload: Partial<Entry> = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      categoryId: form.categoryId,
      style: form.style.trim(),
      prompt: form.prompt,
      htmlSource: form.htmlSource.trim() || undefined,
      images: form.images,
      tags: form.tags,
      status: targetStatus,
    }
    if (isEdit.value) {
      await updateEntry(entryId.value as number, payload)
      status.value = targetStatus
    } else {
      await createEntry(payload)
      status.value = targetStatus
    }
    ElMessage.success(targetStatus === 'PUBLISHED' ? '已发布' : '已存为草稿')
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
  if (!categoryStore.list.length) {
    await categoryStore.fetchCategories()
  }
  if (isEdit.value) {
    const entry = await getEntry(entryId.value as number)
    form.title = entry.title
    form.summary = entry.summary
    form.categoryId = entry.categoryId
    form.style = entry.style
    form.prompt = entry.prompt
    form.htmlSource = entry.htmlSource ?? ''
    form.images = entry.images
    form.tags = [...entry.tags]
    form.publishedAt = entry.publishedAt
    status.value = entry.status
  }
})
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-head {
  padding: 32px 32px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.crumb {
  font-size: 13.5px;
  color: var(--ink-2);
  display: flex;
  gap: 8px;
  align-items: center;
}

.crumb a:hover {
  color: var(--accent-ink);
}

.crumb b {
  color: var(--ink);
  font-weight: 600;
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
  background: var(--card);
}

.editor-layout {
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 22px;
  align-items: start;
}

@media (max-width: 1020px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
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
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-2);
  font-weight: 400;
}

.panel-body {
  padding: 20px;
}

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

.req {
  color: var(--accent);
}

.tip {
  font-weight: 400;
  color: var(--ink-2);
  font-size: 12px;
  margin-left: 6px;
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

.new-inline .el-button {
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
}

.tabbar button.on {
  background: var(--ink);
  color: var(--card);
  border-color: var(--ink);
  font-weight: 600;
}

.mono :deep(textarea) {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
}

.publish-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 13.5px;
}

.publish-row .k {
  color: var(--ink-2);
}

.publish-row .v {
  font-weight: 600;
}

.actions {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.actions .el-button {
  width: 100%;
  margin-left: 0;
}

.help {
  margin-top: 16px;
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.8;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px 14px;
}

.help b {
  color: var(--ink);
}
</style>
