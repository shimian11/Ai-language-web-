<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>仪表盘</h1>
        <p>站点内容概览与快捷操作</p>
      </div>
      <el-button type="primary" round size="large" @click="router.push({ name: 'admin-entry-new' })">
        ＋ 发布新提示词
      </el-button>
    </div>

    <section v-if="overview" class="stats">
      <div class="stat hl">
        <div class="k">提示词</div>
        <div class="v">{{ overview.published }}<em>个</em></div>
      </div>
      <div class="stat">
        <div class="k">文章</div>
        <div class="v">{{ overview.articleTotal }}<em>篇</em></div>
      </div>
      <div class="stat">
        <div class="k">草稿</div>
        <div class="v">{{ overview.drafts + overview.articleDrafts }}<em>项</em></div>
      </div>
      <div class="stat">
        <div class="k">累计浏览</div>
        <div class="v">{{ formatViews(overview.totalViews) }}</div>
      </div>
    </section>

    <div class="panel-wrap">
      <div class="panel">
        <div class="panel-head">
          <h2>最近案例</h2>
          <RouterLink to="/admin/entries">查看全部 →</RouterLink>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 42%">案例</th>
              <th>状态</th>
              <th class="hide-sm">浏览</th>
              <th class="hide-sm">复制</th>
              <th class="hide-sm">收录日期</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in overview?.recent ?? []" :key="item.id">
              <td>
                <div class="e-title">
                  <Thumb :src="item.images[0]?.url ?? ''" :text="item.title" class="e-thumb" />
                  <span>
                    <b>{{ item.title }}</b>
                    <span class="cat">{{ (item.tags ?? []).join(' / ') }} · {{ item.style }}</span>
                  </span>
                </div>
              </td>
              <td>
                <span class="st pub"><i></i>已发布</span>
              </td>
              <td class="num hide-sm">{{ item.viewCount ?? 0 }}</td>
              <td class="num hide-sm">{{ item.copyCount ?? 0 }}</td>
              <td class="date hide-sm">{{ item.publishedAt ?? item.createdAt }}</td>
              <td>
                <div class="ops">
                  <RouterLink class="op" :to="{ name: 'admin-entry-edit', params: { id: String(item.id) } }">
                    编辑
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel" style="margin-top: 20px">
        <div class="panel-head">
          <h2>最近文章</h2>
          <span class="hint-line">心得 / 实习 / 面试</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 52%">文章</th>
              <th>栏目</th>
              <th>状态</th>
              <th class="hide-sm">日期</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in overview?.recentArticles ?? []" :key="`a${a.id}`">
              <td><b>{{ a.title }}</b></td>
              <td>{{ a.sub || typeLabel(a.type) }}</td>
              <td>
                <span class="st" :class="a.status === 'PUBLISHED' ? 'pub' : 'draft'">
                  <i></i>{{ a.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                </span>
              </td>
              <td class="date hide-sm">{{ a.date || '—' }}</td>
              <td>
                <div class="ops">
                  <RouterLink
                    class="op"
                    :to="{ name: 'admin-article-edit', params: { id: String(a.id) }, query: { type: a.type } }"
                  >
                    编辑
                  </RouterLink>
                </div>
              </td>
            </tr>
            <tr v-if="!(overview?.recentArticles ?? []).length">
              <td colspan="5" class="empty-cell">还没有文章</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Thumb from '@/components/common/Thumb.vue'
import { ARTICLE_TYPE_META } from '@/config/article'
import { getOverview } from '@/api/entry'

import type { AdminOverview } from '@/api/entry'
import type { ArticleType } from '@/types'

const router = useRouter()
const overview = ref<AdminOverview | null>(null)

/** 文章类型显示名（栏目为空时回退） */
function typeLabel(type: ArticleType): string {
  return ARTICLE_TYPE_META[type].label
}

function formatViews(value: number): string {
  return value >= 10000 ? `${Math.round(value / 1000) / 10}万` : String(value)
}

onMounted(async () => {
  overview.value = await getOverview()
})
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-head {
  padding: 40px 32px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
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

.stats {
  padding: 0 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1000px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 20px;
}

.stat .k {
  font-size: 12.5px;
  color: var(--ink-2);
}

.stat .v {
  margin-top: 8px;
  font-size: 26px;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: -0.5px;
}

.stat .v em {
  font-style: normal;
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 400;
  margin-left: 6px;
}

.stat.hl .v {
  color: var(--accent);
}

.panel-wrap {
  padding: 24px 32px 0;
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 650;
}

.panel-head a {
  font-size: 13px;
  color: var(--accent-ink);
  font-weight: 500;
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
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  background: #fcfbf8;
}

td {
  padding: 12px 20px;
  border-bottom: 1px dashed var(--line);
  font-size: 13.5px;
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: #fcfaf6;
}

.e-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.e-title .e-thumb {
  width: 52px;
  height: 39px;
  border-radius: 6px;
  border: 1px solid var(--line);
}

.e-title b {
  font-weight: 600;
  display: block;
  line-height: 1.4;
}

.e-title .cat {
  font-size: 11.5px;
  color: var(--ink-2);
  margin-top: 2px;
  display: block;
}

.st {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
  color: #2f9e44;
  background: rgba(47, 158, 68, 0.1);
}

.st i {
  font-style: normal;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2f9e44;
}

/* 草稿态徽标（最近文章表用） */
.st.draft {
  color: var(--ink-2);
  background: var(--bg);
  border: 1px solid var(--line);
}

.st.draft i {
  background: #cfc9bd;
}

/* 面板头说明文字 */
.hint-line {
  font-size: 12px;
  color: var(--ink-2);
}

.empty-cell {
  text-align: center;
  color: var(--ink-2);
  padding: 40px 0;
}

.num {
  font-family: var(--font-mono);
  font-size: 12.5px;
}

.date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-2);
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

@media (max-width: 900px) {
  .hide-sm {
    display: none;
  }
}
</style>
