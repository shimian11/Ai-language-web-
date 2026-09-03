<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>分类管理</h1>
        <p>设计大类的维护与排序（拖拽行调整顺序，决定首页胶囊墙的默认展示顺序）</p>
      </div>
    </div>

    <div class="panel-wrap">
      <div class="panel">
        <div class="add-bar">
          <el-input
            v-model="newName"
            placeholder="输入新分类名称，如：登录页"
            style="max-width: 320px"
            @keydown.enter="onAdd"
          />
          <el-button type="primary" round @click="onAdd">＋ 添加分类</el-button>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>分类名称</th>
              <th class="hide-sm">案例数</th>
              <th style="width: 60px">排序</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(category, index) in categoryStore.list"
              :key="category.id"
              draggable="true"
              class="draggable"
              :class="{ dragging: dragIndex === index }"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @dragend="onDragEnd"
            >
              <td class="drag-handle">⠿</td>
              <td>
                <template v-if="editingId === category.id">
                  <el-input
                    v-model="editingName"
                    size="small"
                    style="max-width: 240px"
                    @keydown.enter="confirmRename(category.id)"
                  />
                </template>
                <template v-else>{{ category.name }}</template>
              </td>
              <td class="num hide-sm">{{ category.entryCount ?? 0 }}</td>
              <td class="num">{{ category.sort }}</td>
              <td>
                <div class="ops">
                  <template v-if="editingId === category.id">
                    <button class="op pub" type="button" @click="confirmRename(category.id)">
                      保存
                    </button>
                    <button class="op" type="button" @click="cancelRename">取消</button>
                  </template>
                  <template v-else>
                    <button class="op" type="button" @click="startRename(category)">重命名</button>
                    <button class="op warn" type="button" @click="onRemove(category)">删除</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="tip-bar">拖拽行可调整顺序；顺序保存后，首页胶囊墙将按此顺序展示前 7 个大类</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { removeCategory, sortCategories, updateCategory } from '@/api/category'
import { useCategoryStore } from '@/stores/category'

import type { Category } from '@/types'

const categoryStore = useCategoryStore()

const newName = ref('')
const editingId = ref<number | null>(null)
const editingName = ref('')

const dragIndex = ref<number | null>(null)
const dragging = ref(false)

async function onAdd(): Promise<void> {
  const name = newName.value.trim()
  if (!name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  await categoryStore.addCategory(name)
  newName.value = ''
  ElMessage.success(`已添加分类「${name}」`)
}

function startRename(category: Category): void {
  editingId.value = category.id
  editingName.value = category.name
}

function cancelRename(): void {
  editingId.value = null
  editingName.value = ''
}

async function confirmRename(id: number): Promise<void> {
  const name = editingName.value.trim()
  if (!name) {
    ElMessage.warning('名称不能为空')
    return
  }
  await updateCategory(id, { name })
  await categoryStore.fetchCategories()
  editingId.value = null
  ElMessage.success('已重命名')
}

async function onRemove(category: Category): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除分类「${category.name}」？（关联案例的分类无法删除）`,
      '删除分类',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await removeCategory(category.id)
    await categoryStore.fetchCategories()
    ElMessage.success('已删除')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

function onDragStart(index: number): void {
  dragIndex.value = index
  dragging.value = true
}

function onDragOver(index: number): void {
  if (dragIndex.value === null || dragIndex.value === index) return
  const list = [...categoryStore.list]
  const [moved] = list.splice(dragIndex.value, 1)
  list.splice(index, 0, moved)
  categoryStore.list = list
  dragIndex.value = index
}

async function onDragEnd(): Promise<void> {
  dragging.value = false
  if (dragIndex.value === null) return
  dragIndex.value = null
  await sortCategories(categoryStore.list.map((category) => category.id))
  ElMessage.success('排序已保存')
}

categoryStore.fetchCategories()
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-head {
  padding: 40px 32px 20px;
}

.page-head h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-head p {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--ink-2);
}

.panel-wrap {
  padding: 0 32px;
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

.add-bar {
  display: flex;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
  background: #fcfbf8;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 500;
  padding: 12px 18px;
  border-bottom: 1px solid var(--line);
  background: #fcfbf8;
}

td {
  padding: 12px 18px;
  border-bottom: 1px dashed var(--line);
  font-size: 13.5px;
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: none;
}

.draggable {
  cursor: grab;
}

.draggable.dragging {
  opacity: 0.5;
}

.drag-handle {
  color: var(--ink-2);
  font-size: 15px;
  user-select: none;
}

.num {
  font-family: var(--font-mono);
  font-size: 12.5px;
}

.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.op {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.15s;
  display: inline-flex;
  align-items: center;
}

.op:hover {
  color: var(--accent-ink);
  border-color: var(--accent);
}

.op.pub {
  color: var(--accent-ink);
  border-color: var(--accent);
}

.op.warn:hover {
  color: #c0392b;
  border-color: #c0392b;
}

.tip-bar {
  padding: 12px 18px;
  font-size: 12px;
  color: var(--ink-2);
  background: var(--bg);
}

@media (max-width: 900px) {
  .hide-sm {
    display: none;
  }
}
</style>
