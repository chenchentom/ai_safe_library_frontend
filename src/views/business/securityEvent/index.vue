<template>
  <div class="security-event-page" :class="{ 'has-drawer': drawerVisible }">
    <div v-if="drawerVisible" class="page-backdrop" @click="drawerVisible = false" />

    <div class="sec-layout">
      <section class="sec-query" aria-label="筛选条件">
        <div class="sec-query__shell">
          <header class="sec-query__header">
            <div class="sec-query__brand">
              <h1 class="sec-query__title">安全事件库</h1>
              <span class="sec-query__desc">已审核且已入库</span>
            </div>
            <div v-if="!loading" class="sec-query__stat" aria-live="polite">
              <span class="sec-query__stat-value">{{ statsTotal }}</span>
              <span class="sec-query__stat-label">事件</span>
            </div>
          </header>

          <div class="sec-query__track">
            <div class="sec-query__zone sec-query__zone--search">
              <el-input
                v-model="filters.keyword"
                placeholder="检索事件名称、风险描述…"
                clearable
                class="sec-query__search"
                aria-label="关键词搜索"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon class="sec-query__search-icon"><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <span class="sec-query__sep" aria-hidden="true" />

            <div class="sec-query__zone sec-query__zone--filters">
              <div class="sec-query__field">
                <el-icon class="sec-query__field-icon" aria-hidden="true"><Grid /></el-icon>
                <el-cascader
                  v-model="filters.auditRiskCategory"
                  :options="tagTree"
                  :props="categoryCascaderProps"
                  placeholder="风险类别"
                  clearable
                  filterable
                  class="sec-query__control sec-query__control--category"
                  aria-label="风险类别"
                  @change="handleSearch"
                />
              </div>

              <div class="sec-query__field sec-query__field--date">
                <el-icon class="sec-query__field-icon" aria-hidden="true"><Calendar /></el-icon>
                <el-date-picker
                  v-model="filters.auditDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="审核开始"
                  end-placeholder="审核结束"
                  value-format="YYYY-MM-DD"
                  :editable="false"
                  clearable
                  class="sec-query__control sec-query__control--date"
                  popper-class="sec-query-date-popper"
                  aria-label="审核时间范围"
                  @change="handleSearch"
                />
              </div>

              <el-popover
                v-model:visible="filterPopoverVisible"
                placement="bottom-end"
                :width="380"
                trigger="click"
                popper-class="sec-query-panel-popper"
              >
                <template #reference>
                  <button
                    type="button"
                    class="sec-query__more"
                    :class="{ 'is-active': filterPopoverVisible || moreFilterCount > 0 }"
                    aria-label="更多筛选条件"
                  >
                    <el-icon><Operation /></el-icon>
                    <span>高级</span>
                    <em v-if="moreFilterCount" class="sec-query__more-count">{{ moreFilterCount }}</em>
                  </button>
                </template>

                <div class="sec-query-panel">
                  <header class="sec-query-panel__head">
                    <div>
                      <h3 class="sec-query-panel__title">高级筛选</h3>
                      <p class="sec-query-panel__desc">组合次要维度精确检索</p>
                    </div>
                  </header>
                  <div class="sec-query-panel__grid">
                    <div class="sec-query-panel__item">
                      <label class="sec-query-panel__label" for="filter-source">
                        <el-icon><Link /></el-icon>
                        来源网站
                      </label>
                      <el-input
                        id="filter-source"
                        v-model="filters.sourceWebsite"
                        placeholder="如 cnvd.org.cn"
                        clearable
                        class="sec-query-panel__input"
                        @keyup.enter="applyMoreFilters"
                      />
                    </div>
                    <div class="sec-query-panel__item">
                      <label class="sec-query-panel__label" for="filter-entity">
                        <el-icon><OfficeBuilding /></el-icon>
                        运营主体
                      </label>
                      <el-input
                        id="filter-entity"
                        v-model="filters.operatingEntityHuman"
                        placeholder="主体名称"
                        clearable
                        class="sec-query-panel__input"
                        @keyup.enter="applyMoreFilters"
                      />
                    </div>
                    <div class="sec-query-panel__item">
                      <label class="sec-query-panel__label" for="filter-product">
                        <el-icon><Box /></el-icon>
                        产品 / 服务
                      </label>
                      <el-input
                        id="filter-product"
                        v-model="filters.productsComponentsServices"
                        placeholder="产品或组件"
                        clearable
                        class="sec-query-panel__input"
                        @keyup.enter="applyMoreFilters"
                      />
                    </div>
                  </div>
                  <footer class="sec-query-panel__foot">
                    <button type="button" class="sec-query-panel__btn sec-query-panel__btn--ghost" @click="clearMoreFilters">
                      清空
                    </button>
                    <button type="button" class="sec-query-panel__btn sec-query-panel__btn--primary" @click="applyMoreFilters">
                      应用筛选
                    </button>
                  </footer>
                </div>
              </el-popover>
            </div>

            <span class="sec-query__sep" aria-hidden="true" />

            <div class="sec-query__zone sec-query__zone--actions">
              <button type="button" class="sec-query__btn sec-query__btn--primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查询
              </button>
              <button type="button" class="sec-query__btn sec-query__btn--ghost" aria-label="重置筛选" @click="handleReset">
                <el-icon><RefreshLeft /></el-icon>
              </button>
            </div>
          </div>

          <transition name="sec-query-chips">
            <div v-if="activeFilterChips.length" class="sec-query__chips">
              <span class="sec-query__chips-label">已应用</span>
              <button
                v-for="chip in activeFilterChips"
                :key="chip.key"
                type="button"
                class="sec-query-chip"
                :aria-label="`移除筛选：${chip.shortLabel}`"
                @click="removeFilterChip(chip.key)"
              >
                <span class="sec-query-chip__text">{{ chip.shortLabel }}</span>
                <el-icon class="sec-query-chip__close"><Close /></el-icon>
              </button>
              <button type="button" class="sec-query__chips-reset" @click="handleReset">全部清除</button>
            </div>
          </transition>
        </div>
      </section>

      <main class="sec-main">
        <div class="sec-list-head">
          <span v-if="!loading" class="sec-list-head__meta">
            当前页 <strong>{{ eventList.length }}</strong> 条
            <template v-if="pagination.total"> / 共 {{ pagination.total }} 条</template>
          </span>
        </div>

        <div v-loading="loading" class="event-list-wrap">
          <div class="event-list">
            <article
              v-for="(item, index) in eventList"
              :key="item.id"
              class="event-card"
              :class="{ 'is-selected': currentEvent?.id === item.id && drawerVisible }"
              :style="{ '--card-i': index }"
              role="button"
              tabindex="0"
              :aria-label="`查看事件：${getEventName(item)}`"
              @click="openDetail(item)"
              @keydown.enter.prevent="openDetail(item)"
            >
              <div class="event-card__body">
                <div class="event-card__title-row">
                  <span
                    v-if="getCardCategory(item).label"
                    class="event-card__category"
                    :class="`event-card__category--c${getCardCategory(item).colorIndex}`"
                    :title="getHumanReportCategory(item)"
                  >
                    {{ getCardCategory(item).label }}
                  </span>
                  <h2 class="event-card__title">{{ getEventName(item) }}</h2>
                </div>

                <p class="event-card__desc">{{ getCardRiskDescription(item) }}</p>

                <div class="event-card__meta">
                  <span v-if="getCardSubmissionTime(item)" class="event-card__meta-item">
                    <span class="event-card__meta-key">报送时间</span>
                    <span class="event-card__meta-val">{{ getCardSubmissionTime(item) }}</span>
                  </span>
                  <span v-if="getSourceWebsite(item)" class="event-card__meta-item">
                    <span class="event-card__meta-key">来源</span>
                    <span class="event-card__meta-val">{{ getSourceWebsite(item) }}</span>
                  </span>
                  <span v-if="getCardOperatingEntity(item)" class="event-card__meta-item">
                    <span class="event-card__meta-key">运营主体</span>
                    <span class="event-card__meta-val">{{ getCardOperatingEntity(item) }}</span>
                  </span>
                  <span v-if="getCardProducts(item)" class="event-card__meta-item">
                    <span class="event-card__meta-key">产品/组件/服务</span>
                    <span class="event-card__meta-val">{{ getCardProducts(item) }}</span>
                  </span>
                  <span class="event-card__meta-item">
                    <span class="event-card__meta-key">审核时间</span>
                    <span class="event-card__meta-val">{{ formatCardDateTime(getCardDisplayTime(item)) }}</span>
                  </span>
                  <span v-if="getCardAuditor(item)" class="event-card__meta-item">
                    <span class="event-card__meta-key">审核人</span>
                    <span class="event-card__meta-val">{{ getCardAuditor(item) }}</span>
                  </span>
                </div>
              </div>
            </article>

            <div v-if="!loading && eventList.length === 0" class="empty-state">
              <div class="empty-icon-wrap">
                <el-icon :size="40"><Document /></el-icon>
              </div>
              <p class="empty-title">无匹配事件</p>
              <p class="empty-hint">尝试调整顶部筛选条件或清空关键词</p>
              <el-button type="primary" plain size="small" @click="handleReset">清空筛选</el-button>
            </div>
          </div>
        </div>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[12, 16, 24, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="fetchData"
            @current-change="fetchData"
          />
        </div>
      </main>
    </div>

    <div
      v-if="drawerVisible"
      class="detail-panel"
      :style="{ width: drawerWidth + 'px' }"
    >
      <div class="panel-header">
        <div class="panel-header__left">
          <span class="panel-title">事件详情</span>
          <span class="panel-kbd-hint">↑↓ 切换 · Esc 关闭</span>
        </div>
        <button type="button" class="panel-close" aria-label="关闭详情" @click="drawerVisible = false">
          <el-icon><Close /></el-icon>
        </button>
      </div>
      <div class="panel-resize-handle" @mousedown="startResize"></div>
      <div class="panel-content">
        <div v-if="currentEvent" class="detail-content">
          <div class="detail-hero">
            <h3 class="detail-title">{{ getEventName(currentEvent) }}</h3>
          </div>

          <section class="detail-block detail-block--highlight">
            <h4 class="section-title">报送风险描述</h4>
            <p class="detail-prose">{{ getOriginalRiskDescription(currentEvent) || '—' }}</p>
          </section>

          <section v-if="getEventContent(currentEvent)" class="detail-block">
            <h4 class="section-title">全文内容</h4>
            <div class="detail-content-scroll">{{ getEventContent(currentEvent) }}</div>
          </section>

          <section class="detail-block">
            <h4 class="section-title">来源信息</h4>
            <dl class="detail-dl">
              <div v-if="getSourceWebsite(currentEvent)" class="detail-dl__row">
                <dt>来源网站</dt>
                <dd>{{ getSourceWebsite(currentEvent) }}</dd>
              </div>
              <div v-if="getSourceUrl(currentEvent)" class="detail-dl__row">
                <dt>来源 URL</dt>
                <dd>
                  <a
                    :href="getSourceUrl(currentEvent)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="detail-link"
                  >
                    {{ getSourceUrl(currentEvent) }}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section class="detail-block">
            <h4 class="section-title">报送信息</h4>
            <div class="detail-key-grid">
              <div class="detail-key-card detail-key-card--category">
                <span class="detail-key-card__label">报送类别</span>
                <span class="detail-key-card__value">{{ getReportCategory(currentEvent) }}</span>
              </div>
              <div class="detail-key-card detail-key-card--entity">
                <span class="detail-key-card__label">运营主体</span>
                <span class="detail-key-card__value">
                  {{ currentEvent.operating_entity || currentEvent.operatingEntity || '—' }}
                </span>
              </div>
            </div>
            <dl class="detail-dl detail-dl--grid">
              <div class="detail-dl__row">
                <dt>报送时间</dt>
                <dd>{{ formatDateOnly(currentEvent.submission_time || currentEvent.submissionTime) }}</dd>
              </div>
              <div class="detail-dl__row">
                <dt>报送渠道</dt>
                <dd>{{ sourceLabel(getSubmissionChannel(currentEvent)) || '—' }}</dd>
              </div>
              <div class="detail-dl__row">
                <dt>报送人</dt>
                <dd>{{ currentEvent.submit_user_name || currentEvent.submitUserName || '—' }}</dd>
              </div>
              <div class="detail-dl__row">
                <dt>报送单位</dt>
                <dd>{{ getSubmitOrg(currentEvent) || '—' }}</dd>
              </div>
              <div class="detail-dl__row detail-dl__row--full">
                <dt>产品/组件/服务</dt>
                <dd>{{ currentEvent.products_components_services || currentEvent.productsComponentsServices || '—' }}</dd>
              </div>
            </dl>
          </section>

          <section class="detail-block detail-block--audit">
            <header class="detail-block__header">
              <h4 class="section-title">审核结论</h4>
            </header>
            <div class="detail-key-grid">
              <div class="detail-key-card detail-key-card--category">
                <span class="detail-key-card__label">风险类别</span>
                <span class="detail-key-card__value">{{ getHumanReportCategory(currentEvent) }}</span>
              </div>
              <div class="detail-key-card detail-key-card--entity">
                <span class="detail-key-card__label">运营主体</span>
                <span class="detail-key-card__value">
                  {{ currentEvent.operating_entity_human || currentEvent.operatingEntityHuman || '—' }}
                </span>
              </div>
            </div>
            <dl class="detail-dl detail-dl--grid">
              <div class="detail-dl__row">
                <dt>审核人</dt>
                <dd>{{ currentEvent.audit_user_name || currentEvent.auditUserName || '—' }}</dd>
              </div>
              <div class="detail-dl__row">
                <dt>审核部门</dt>
                <dd>{{ currentEvent.audit_dept_name || currentEvent.auditDeptName || '—' }}</dd>
              </div>
              <div class="detail-dl__row">
                <dt>审核时间</dt>
                <dd>{{ formatDateTime(currentEvent.audit_time || currentEvent.auditTime) }}</dd>
              </div>
              <div class="detail-dl__row detail-dl__row--full">
                <dt>产品/组件/服务</dt>
                <dd>{{ currentEvent.products_components_services || currentEvent.productsComponentsServices || '—' }}</dd>
              </div>
              <div class="detail-dl__row detail-dl__row--full">
                <dt>风险描述</dt>
                <dd class="detail-dl__prose">
                  {{ currentEvent.risk_description_human || currentEvent.riskDescriptionHuman || '—' }}
                </dd>
              </div>
              <div
                v-if="currentEvent.audit_reason || currentEvent.auditReason"
                class="detail-dl__row detail-dl__row--full"
              >
                <dt>审核备注</dt>
                <dd>{{ currentEvent.audit_reason || currentEvent.auditReason }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import {
  Close,
  Search,
  Document,
  Link,
  OfficeBuilding,
  Grid,
  Calendar,
  Operation,
  RefreshLeft,
  Box,
} from '@element-plus/icons-vue'
import { getTagTree, type TagCategory } from '@/api/riskClue'
import {
  searchEvents,
  getEventById,
  getEventStats,
  type SecurityEvent,
} from '@/api/securityEvent'

const loading = ref(false)
const drawerVisible = ref(false)
const drawerWidth = ref(960)
const filterPopoverVisible = ref(false)
const DRAWER_MIN = 720
const DRAWER_MAX = 1400
const eventList = ref<SecurityEvent[]>([])
const currentEvent = ref<SecurityEvent | null>(null)
const tagTree = ref<TagCategory[]>([])
const statsTotal = ref(0)

const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

function startResize(e: MouseEvent) {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = drawerWidth.value
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!isResizing.value) return
  const deltaX = startX.value - e.clientX
  drawerWidth.value = Math.max(DRAWER_MIN, Math.min(DRAWER_MAX, startWidth.value + deltaX))
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const categoryCascaderProps = {
  value: 'label',
  label: 'label',
  children: 'children',
  checkStrictly: true,
  emitPath: true,
}

const filters = reactive({
  keyword: '',
  auditRiskCategory: [] as string[],
  sourceWebsite: '',
  operatingEntityHuman: '',
  productsComponentsServices: '',
  auditDateRange: [] as string[],
})

const pagination = reactive({
  page: 1,
  size: 16,
  total: 0,
})

async function fetchTagTree() {
  try {
    tagTree.value = (await getTagTree('risk_clue')) || []
  } catch {
    tagTree.value = []
  }
}

function getEventName(item: SecurityEvent): string {
  return item.event_name || item.eventName || '暂无事件名'
}

function getSourceWebsite(item: SecurityEvent): string {
  return item.source_website || item.sourceWebsite || ''
}

function getSourceUrl(item: SecurityEvent): string {
  return item.source_url || item.sourceUrl || ''
}

function getEventContent(item: SecurityEvent): string {
  const raw = item.content || item.summary
  return raw ? String(raw).trim() : ''
}

function getSubmissionChannel(item: SecurityEvent): string {
  return item.submission_channel || item.submissionChannel || ''
}

function getSubmitOrg(item: SecurityEvent): string {
  return item.submit_org_name || item.submitOrgName || ''
}

function sourceLabel(source?: string): string {
  if (!source) return ''
  const map: Record<string, string> = { crawl: '开源网站', report: '报送' }
  return map[source] || source
}

function getOriginalRiskDescription(item: SecurityEvent): string {
  const raw =
    item.risk_description ||
    item.riskDescription ||
    item.summary ||
    item.content
  return formatSummary(raw)
}

function getReportCategoryLabels(item: SecurityEvent): string[] {
  const seen = new Set<string>()
  const labels: string[] = []
  const push = (label: string) => {
    const text = label.trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    labels.push(text)
  }
  toTagArray(item.class_report_list || item.classReportList).forEach(push)
  const path = buildCategoryPath(item.class_report_1 || item.classReport1, item.class_report_2 || item.classReport2)
  if (path) push(path)
  return labels
}

function getReportCategory(item: SecurityEvent): string {
  const path = buildCategoryPath(item.class_report_1 || item.classReport1, item.class_report_2 || item.classReport2)
  if (path) return path.replace('/', ' / ')
  const list = toTagArray(item.class_report_list || item.classReportList)
  return list[0]?.replace('/', ' / ') || '—'
}

function hashCategoryColorIndex(key: string): number {
  if (!key) return 0
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 8
}

function getCardCategoryLabel(item: SecurityEvent): string {
  const c1 = String(item.class_human_1 || item.classHuman1 || '').trim()
  const c2 = String(item.class_human_2 || item.classHuman2 || '').trim()
  if (c1 && c2) return `${c1} / ${c2}`
  if (c1) return c1
  if (c2) return c2
  const labels = getHumanCategoryLabels(item)
  if (labels[0]) return labels[0].replace('/', ' / ')
  return ''
}

function getCardCategory(item: SecurityEvent): { label: string; colorIndex: number } {
  if (item._cardPrimaryCategory !== undefined && item._cardCategoryColorIndex !== undefined) {
    return { label: item._cardPrimaryCategory, colorIndex: item._cardCategoryColorIndex }
  }
  const c1 = String(item.class_human_1 || item.classHuman1 || '').trim()
  const label = getCardCategoryLabel(item)
  const colorKey = c1 || label
  return { label, colorIndex: hashCategoryColorIndex(colorKey) }
}

function formatDateOnly(raw?: string): string {
  if (!raw) return '—'
  let s = String(raw).trim().replace('T', ' ').replace('Z', '')
  if (s.includes('.')) s = s.split('.')[0]
  const datePart = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart
  return datePart || '—'
}

function formatSummary(raw?: string): string {
  if (!raw) return ''
  let text = String(raw).trim()
  text = text.replace(/^\s*#{1,6}\s*/g, '')
  text = text.replace(/^(摘要|summary)\s*[:：]?\s*/i, '')
  text = text.replace(/\s+/g, ' ')
  return text
}

function getCardRiskDescription(item: SecurityEvent): string {
  const raw = item.risk_description_human || item.riskDescriptionHuman
  const text = formatSummary(raw)
  return text || '暂无风险描述'
}

function getCardDisplayTime(item: SecurityEvent): string | undefined {
  return item._cardTime || item.audit_time || item.auditTime
}

function getCardOperatingEntity(item: SecurityEvent): string {
  const raw = item.operating_entity_human || item.operatingEntityHuman
  return raw ? String(raw).trim() : ''
}

function getCardProducts(item: SecurityEvent): string {
  const raw = item.products_components_services || item.productsComponentsServices
  return raw ? String(raw).trim() : ''
}

function getCardSubmissionTime(item: SecurityEvent): string {
  const raw = item.submission_time || item.submissionTime
  if (!raw) return ''
  const formatted = formatDateOnly(raw)
  return formatted === '—' ? '' : formatted
}

function getCardAuditor(item: SecurityEvent): string {
  const raw = item.audit_user_name || item.auditUserName
  return raw ? String(raw).trim() : ''
}

function toTagArray(raw: unknown): string[] {
  if (raw === undefined || raw === null) return []
  if (Array.isArray(raw)) return raw.flatMap((v) => toTagArray(v))
  const s = String(raw).trim()
  return s ? [s] : []
}

function buildCategoryPath(c1?: unknown, c2?: unknown): string {
  const a = String(c1 ?? '').trim()
  const b = String(c2 ?? '').trim()
  if (!a) return ''
  return b ? `${a}/${b}` : a
}

function getHumanCategoryLabels(item: SecurityEvent): string[] {
  const seen = new Set<string>()
  const labels: string[] = []
  const push = (label: string) => {
    const text = label.trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    labels.push(text)
  }
  toTagArray(item.class_human_list || item.classHumanList).forEach(push)
  const path = buildCategoryPath(item.class_human_1 || item.classHuman1, item.class_human_2 || item.classHuman2)
  if (path) push(path)
  return labels
}

function getHumanReportCategory(item: SecurityEvent): string {
  const path = buildCategoryPath(item.class_human_1 || item.classHuman1, item.class_human_2 || item.classHuman2)
  if (path) return path.replace('/', ' / ')
  const list = toTagArray(item.class_human_list || item.classHumanList)
  return list[0]?.replace('/', ' / ') || '—'
}

function normalizeEvent(item: SecurityEvent): SecurityEvent {
  const category = getCardCategory(item)
  return {
    ...item,
    event_name: getEventName(item),
    eventName: getEventName(item),
    _cardCategories: getHumanCategoryLabels(item),
    _cardPrimaryCategory: category.label,
    _cardCategoryColorIndex: category.colorIndex,
    _cardTime: item.audit_time || item.auditTime,
  }
}

function formatRiskCategoryPath(path?: string[] | string): string {
  if (!path) return ''
  if (Array.isArray(path)) return path.filter(Boolean).join(' / ')
  return String(path).trim()
}

function buildRiskCategoryParam(path?: string[]): string | undefined {
  if (!path?.length) return undefined
  const value = path.filter(Boolean).join('/')
  return value || undefined
}

const activeFilterChips = computed(() => {
  const chips: { key: string; shortLabel: string }[] = []
  if (filters.keyword) chips.push({ key: 'keyword', shortLabel: `关键词 · ${filters.keyword}` })
  if (filters.auditRiskCategory?.length) {
    chips.push({
      key: 'auditRiskCategory',
      shortLabel: `类别 · ${formatRiskCategoryPath(filters.auditRiskCategory)}`,
    })
  }
  if (filters.sourceWebsite) chips.push({ key: 'sourceWebsite', shortLabel: `来源 · ${filters.sourceWebsite}` })
  if (filters.operatingEntityHuman) {
    chips.push({ key: 'operatingEntityHuman', shortLabel: `主体 · ${filters.operatingEntityHuman}` })
  }
  if (filters.productsComponentsServices) {
    chips.push({ key: 'productsComponentsServices', shortLabel: `产品 · ${filters.productsComponentsServices}` })
  }
  if (filters.auditDateRange?.length === 2) {
    chips.push({
      key: 'auditDateRange',
      shortLabel: `时间 · ${filters.auditDateRange[0]} ~ ${filters.auditDateRange[1]}`,
    })
  }
  return chips
})

const moreFilterCount = computed(() => {
  let n = 0
  if (filters.sourceWebsite) n++
  if (filters.operatingEntityHuman) n++
  if (filters.productsComponentsServices) n++
  return n
})

function applyMoreFilters() {
  filterPopoverVisible.value = false
  handleSearch()
}

function clearMoreFilters() {
  filters.sourceWebsite = ''
  filters.operatingEntityHuman = ''
  filters.productsComponentsServices = ''
}

function removeFilterChip(key: string) {
  if (key === 'keyword') filters.keyword = ''
  if (key === 'auditRiskCategory') filters.auditRiskCategory = []
  if (key === 'sourceWebsite') filters.sourceWebsite = ''
  if (key === 'operatingEntityHuman') filters.operatingEntityHuman = ''
  if (key === 'productsComponentsServices') filters.productsComponentsServices = ''
  if (key === 'auditDateRange') filters.auditDateRange = []
  handleSearch()
}

function formatDateTime(raw?: string): string {
  if (!raw) return '—'
  let dateStr = String(raw).trim().replace('T', ' ').replace('Z', '')
  if (dateStr.includes('.')) dateStr = dateStr.split('.')[0]
  return dateStr
}

function formatCardDateTime(raw?: string): string {
  if (!raw) return '—'
  let s = String(raw).trim().replace('T', ' ').replace('Z', '')
  if (s.includes('.')) s = s.split('.')[0]
  if (s.length >= 16) return s.slice(0, 16)
  if (s.length >= 10) return s.slice(0, 10)
  return s || '—'
}

function navigateEvent(direction: 1 | -1) {
  if (!eventList.value.length) return
  const currentIndex = eventList.value.findIndex((e) => e.id === currentEvent.value?.id)
  let nextIndex = currentIndex < 0 ? 0 : currentIndex + direction
  if (nextIndex < 0) nextIndex = eventList.value.length - 1
  if (nextIndex >= eventList.value.length) nextIndex = 0
  openDetail(eventList.value[nextIndex])
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
  if (e.key === 'Escape' && drawerVisible.value) {
    drawerVisible.value = false
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (drawerVisible.value) navigateEvent(1)
    else if (eventList.value[0]) openDetail(eventList.value[0])
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (drawerVisible.value) navigateEvent(-1)
    else if (eventList.value[0]) openDetail(eventList.value[0])
  }
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      size: pagination.size,
    }
    if (filters.keyword) params.keyword = filters.keyword
    const auditRiskCategory = buildRiskCategoryParam(filters.auditRiskCategory)
    if (auditRiskCategory) params.auditRiskCategory = auditRiskCategory
    if (filters.sourceWebsite) params.sourceWebsite = filters.sourceWebsite.trim()
    if (filters.operatingEntityHuman) params.operatingEntityHuman = filters.operatingEntityHuman.trim()
    if (filters.productsComponentsServices) {
      params.productsComponentsServices = filters.productsComponentsServices.trim()
    }
    if (filters.auditDateRange?.length === 2) {
      params.auditStartTime = filters.auditDateRange[0]
      params.auditEndTime = filters.auditDateRange[1]
    }
    const res = await searchEvents(params as never)
    const data = res as {
      rows?: SecurityEvent[]
      records?: SecurityEvent[]
      list?: SecurityEvent[]
      data?: SecurityEvent[]
      total?: number
    }
    const rawList = data?.rows || data?.records || data?.list || data?.data || []
    eventList.value = rawList.map(normalizeEvent)
    pagination.total = data?.total || 0
  } catch {
    eventList.value = []
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await getEventStats()
    const data = res as { total?: number }
    statsTotal.value = data?.total ?? pagination.total
  } catch {
    statsTotal.value = pagination.total
  }
}

async function openDetail(item: SecurityEvent) {
  try {
    const res = await getEventById(item.id)
    currentEvent.value = normalizeEvent(res as SecurityEvent)
  } catch {
    currentEvent.value = normalizeEvent(item)
  }
  drawerVisible.value = true
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  filters.keyword = ''
  filters.auditRiskCategory = []
  filters.sourceWebsite = ''
  filters.operatingEntityHuman = ''
  filters.productsComponentsServices = ''
  filters.auditDateRange = []
  pagination.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchStats()
  fetchTagTree()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopResize()
})
</script>

<style lang="scss" scoped src="../riskClue/risk-clue.scss"></style>
<style lang="scss" scoped src="./security-event.scss"></style>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;

.sec-query-panel-popper.el-popover.el-popper {
  padding: 0 !important;
  overflow: hidden;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.sec-query-panel-popper .el-popper__arrow {
  display: none;
}

.sec-query-panel-popper .sec-query-panel {
  border-radius: $border-radius-xl;
  background:
    linear-gradient(165deg, rgba(18, 32, 58, 0.98) 0%, rgba(8, 14, 26, 0.99) 100%);
  border: 1px solid rgba(79, 124, 255, 0.22);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 20px 50px rgba(0, 0, 0, 0.55),
    0 0 40px rgba(79, 124, 255, 0.08);
}

.sec-query-panel-popper .sec-query-panel__head {
  padding: 16px 18px 12px;
  border-bottom: 1px solid rgba(79, 124, 255, 0.12);
  background: linear-gradient(90deg, rgba(79, 124, 255, 0.1), transparent 70%);
}

.sec-query-panel-popper .sec-query-panel__title {
  margin: 0;
  font-family: $font-family-display;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.sec-query-panel-popper .sec-query-panel__desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(180, 195, 220, 0.65);
}

.sec-query-panel-popper .sec-query-panel__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  padding: 16px 18px;
}

.sec-query-panel-popper .sec-query-panel__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(160, 180, 215, 0.75);

  .el-icon {
    font-size: 12px;
    color: rgba(99, 140, 255, 0.75);
  }
}

.sec-query-panel-popper .sec-query-panel__input .el-input__wrapper {
  min-height: 38px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(79, 124, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sec-query-panel-popper .sec-query-panel__input .el-input__wrapper:hover {
  border-color: rgba(99, 140, 255, 0.28);
}

.sec-query-panel-popper .sec-query-panel__input .el-input__wrapper.is-focus {
  border-color: rgba(99, 140, 255, 0.45);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 3px rgba(79, 124, 255, 0.12);
}

.sec-query-panel-popper .sec-query-panel__input .el-input__inner {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.sec-query-panel-popper .sec-query-panel__foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px 16px;
  border-top: 1px solid rgba(79, 124, 255, 0.1);
  background: rgba(0, 0, 0, 0.15);
}

.sec-query-panel-popper .sec-query-panel__btn {
  min-height: 34px;
  padding: 0 14px;
  border-radius: $border-radius-md;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.sec-query-panel-popper .sec-query-panel__btn--ghost {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(200, 210, 230, 0.85);
}

.sec-query-panel-popper .sec-query-panel__btn--ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.95);
}

.sec-query-panel-popper .sec-query-panel__btn--primary {
  border: 1px solid rgba(79, 124, 255, 0.45);
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.95), rgba(61, 103, 230, 0.95));
  color: #fff;
  font-weight: 500;
}

.sec-query-panel-popper .sec-query-panel__btn--primary:hover {
  filter: brightness(1.06);
}

@media (max-width: 420px) {
  .sec-query-panel-popper .sec-query-panel__grid {
    grid-template-columns: 1fr;
  }
}

/* 安全事件库专用日期面板（勿与全局 app-date-range-popper 混用） */
.sec-query-date-popper.el-picker__popper {
  background: linear-gradient(180deg, rgba(14, 24, 44, 0.98), rgba(8, 14, 26, 0.99)) !important;
  border: 1px solid rgba(79, 124, 255, 0.22) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;
}

.sec-query-date-popper .el-picker-panel {
  background: transparent;
  color: rgba(230, 237, 247, 0.9);
}

.sec-query-date-popper .el-date-range-picker__header,
.sec-query-date-popper .el-date-table th {
  color: rgba(180, 195, 220, 0.75);
}

.sec-query-date-popper .el-date-table td.available .el-date-table-cell__text {
  color: rgba(220, 228, 245, 0.88);
}

.sec-query-date-popper .el-date-table td.in-range .el-date-table-cell {
  background: rgba(79, 124, 255, 0.12);
}

.sec-query-date-popper .el-date-table td.start-date .el-date-table-cell__text,
.sec-query-date-popper .el-date-table td.end-date .el-date-table-cell__text {
  background: rgba(79, 124, 255, 0.85);
  color: #fff;
}

.sec-query-date-popper .el-picker-panel__icon-btn {
  color: rgba(180, 195, 220, 0.75);
}

.sec-query-date-popper .el-picker-panel__icon-btn:hover {
  color: rgba(255, 255, 255, 0.95);
}
</style>
