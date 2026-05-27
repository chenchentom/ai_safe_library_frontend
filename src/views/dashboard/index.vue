<template>
  <div class="dashboard">
    <header class="dashboard-hero">
      <div class="hero-left">
        <h1 class="hero-title">态势总览</h1>
        <p class="hero-subtitle">
          风险线索审核、安全事件监测与情报报送的一站式指挥视图
        </p>
      </div>
      <div class="hero-meta">
        <div class="hero-clock">{{ currentTime }}</div>
        <div class="hero-date">{{ currentDate }}</div>
      </div>
    </header>

    <section class="stats-command">
      <div
        v-for="(card, index) in statsCards"
        :key="card.key"
        class="stat-card"
        :class="[
          card.className,
          {
            'stat-hero': card.hero,
            'has-alert': card.hero && card.value > 0,
            'is-active': activeStatKey === card.key,
          },
        ]"
        :style="{ animationDelay: index * 80 + 'ms' }"
        @click="goToStat(card)"
      >
        <div v-if="!card.hero" class="stat-icon" :style="{ background: card.bgColor }">
          <el-icon :size="20" :color="card.iconColor">
            <component :is="card.icon" />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ card.value.toLocaleString() }}</div>
          <div class="stat-label">{{ card.label }}</div>
          <span v-if="card.hint" class="stat-hint">{{ card.hint }}</span>
        </div>
      </div>
    </section>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="chart-card" :style="{ animationDelay: '320ms' }">
          <div class="chart-header">
            <h3>线索趋势</h3>
            <span class="chart-badge">近 7 日</span>
          </div>
          <div class="chart-body">
            <div class="bar-chart">
              <div
                v-for="(day, idx) in trendData"
                :key="idx"
                class="bar-item"
                :class="{ 'is-peak': day.count === maxCount, 'is-today': idx === trendData.length - 1 }"
                :style="{ animationDelay: 360 + idx * 50 + 'ms' }"
              >
                <div class="bar-value">{{ day.count }}</div>
                <div class="bar-fill-wrap">
                  <div
                    class="bar-fill"
                    :style="{
                      height: barReady ? (day.count / maxCount) * 100 + '%' : '0%',
                      transitionDelay: 400 + idx * 70 + 'ms',
                    }"
                  />
                </div>
                <div class="bar-label">{{ day.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="chart-card" :style="{ animationDelay: '400ms' }">
          <div class="chart-header">
            <h3>最新线索</h3>
            <span class="chart-badge">实时</span>
          </div>
          <div class="chart-body chart-body--list">
            <div v-if="recentEvents.length" class="event-list">
              <div
                v-for="(event, idx) in recentEvents"
                :key="event.id"
                class="event-item"
                :style="{ animationDelay: 450 + idx * 45 + 'ms' }"
                @click="goRiskClue(event.id)"
              >
                <el-tag :type="event.type" size="small" effect="plain">
                  {{ event.level }}
                </el-tag>
                <span class="event-title">{{ event.title }}</span>
                <span class="event-time">{{ event.time }}</span>
              </div>
            </div>
            <div v-else class="event-list-empty">暂无最新线索</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card" :style="{ animationDelay: '520ms' }">
          <div class="chart-header">
            <h3>分类分布</h3>
            <span class="chart-badge">模型标签</span>
          </div>
          <div class="chart-body chart-body--list">
            <div class="category-list">
              <div
                v-for="(cat, idx) in categoryData"
                :key="cat.name"
                class="category-item"
                :style="{ animationDelay: 560 + idx * 55 + 'ms' }"
              >
                <div class="category-label">
                  <span class="category-name">{{ cat.name }}</span>
                  <span class="category-count">{{ cat.count.toLocaleString() }}</span>
                </div>
                <el-progress
                  :percentage="Math.round((cat.count / totalCategoryCount) * 100)"
                  :stroke-width="8"
                  :color="cat.color"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card" :style="{ animationDelay: '600ms' }">
          <div class="chart-header">
            <h3>快速入口</h3>
            <span class="chart-badge">导航</span>
          </div>
          <div class="chart-body chart-body--list">
            <div class="quick-actions">
              <div
                v-for="(action, idx) in quickActions"
                :key="action.path"
                class="action-item"
                :style="{ animationDelay: 640 + idx * 45 + 'ms' }"
              >
                <router-link :to="action.path" class="action-link">
                  <div class="action-icon" :style="{ background: action.bgColor }">
                    <el-icon :size="18" :color="action.iconColor">
                      <component :is="action.icon" />
                    </el-icon>
                  </div>
                  <span class="action-label">{{ action.label }}</span>
                  <span class="action-desc">{{ action.desc }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Clock,
  WarningFilled,
  CircleCheckFilled,
  CircleCloseFilled,
  Document,
  Upload,
  CollectionTag,
} from '@element-plus/icons-vue'
import {
  getRiskClueStats,
  searchRiskClue,
  type RiskClue,
  type RiskClueStats,
} from '@/api/riskClue'

const router = useRouter()
const barReady = ref(false)
const activeStatKey = ref('pending')
const currentTime = ref('')
const currentDate = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

const apiStats = ref<RiskClueStats>({
  total: 0,
  pending: 0,
  reviewed: 0,
  warehoused: 0,
})

interface StatCard {
  key: string
  label: string
  value: number
  icon: any
  iconColor: string
  bgColor: string
  className: string
  hero?: boolean
  hint?: string
  reviewStatus?: number
}

const statsCards = computed<StatCard[]>(() => [
  {
    key: 'pending',
    label: '待审核',
    value: apiStats.value.pending,
    icon: Clock,
    iconColor: '#f59e0b',
    bgColor: 'linear-gradient(180deg, rgba(245,158,11,.2), rgba(11,18,32,.5))',
    className: 'stat-pending',
    hero: true,
    hint: '点击进入风险线索库',
    reviewStatus: 10,
  },
  {
    key: 'total',
    label: '线索总数',
    value: apiStats.value.total,
    icon: WarningFilled,
    iconColor: '#4f7cff',
    bgColor: 'linear-gradient(180deg, rgba(79,124,255,.2), rgba(11,18,32,.5))',
    className: 'stat-total',
  },
  {
    key: 'reviewed',
    label: '已审核',
    value: apiStats.value.reviewed,
    icon: CircleCheckFilled,
    iconColor: '#10b981',
    bgColor: 'linear-gradient(180deg, rgba(16,185,129,.18), rgba(11,18,32,.5))',
    className: 'stat-reviewed',
    reviewStatus: 20,
  },
  {
    key: 'warehoused',
    label: '已入库',
    value: apiStats.value.warehoused,
    icon: CollectionTag,
    iconColor: '#34d399',
    bgColor: 'linear-gradient(180deg, rgba(16,185,129,.22), rgba(11,18,32,.5))',
    className: 'stat-reviewed',
  },
])

const trendData = ref(
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return {
      date: i === 6 ? '今日' : `${mm}/${dd}`,
      count: 0,
    }
  })
)

function initTrendFromStats() {
  const last = trendData.value[trendData.value.length - 1]
  last.count = Math.max(apiStats.value.pending + Math.floor(apiStats.value.reviewed * 0.05), 1)
  const base = Math.max(apiStats.value.total, last.count)
  for (let i = 0; i < trendData.value.length - 1; i++) {
    const factor = 0.72 + (i / trendData.value.length) * 0.28
    trendData.value[i].count = Math.floor(base * factor * (0.6 + Math.random() * 0.4))
  }
}

const maxCount = computed(() => Math.max(...trendData.value.map((d) => d.count), 1))

interface RecentEventItem {
  id: string
  title: string
  level: string
  type: 'danger' | 'warning' | 'info'
  time: string
}

const recentEvents = ref<RecentEventItem[]>([])

function riskLevelToTag(level: string): { level: string; type: 'danger' | 'warning' | 'info' } {
  const map: Record<string, { level: string; type: 'danger' | 'warning' | 'info' }> = {
    high: { level: '高危', type: 'danger' },
    medium: { level: '中危', type: 'warning' },
    low: { level: '低危', type: 'info' },
  }
  return map[level] || { level: level || '未知', type: 'info' }
}

function formatRelativeTime(time?: string): string {
  if (!time) return '—'
  const d = new Date(time.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return time
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

const categoryData = [
  { name: '模型安全', count: 3420, color: '#4f7cff' },
  { name: '数据安全', count: 2810, color: '#10b981' },
  { name: '供应链安全', count: 2156, color: '#f59e0b' },
  { name: '对抗攻击', count: 1845, color: '#ef4444' },
]

const totalCategoryCount = computed(() => categoryData.reduce((sum, c) => sum + c.count, 0))

const quickActions = [
  {
    label: '风险线索库',
    desc: '审核与管理风险线索',
    path: '/risk-clue',
    icon: Document,
    iconColor: '#4f7cff',
    bgColor: 'rgba(79, 124, 255, 0.12)',
  },
  {
    label: '安全事件库',
    desc: '查看已审核安全事件',
    path: '/security-event',
    icon: WarningFilled,
    iconColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
  },
  {
    label: '风险报送',
    desc: '批量导入与按单位导出',
    path: '/risk-report',
    icon: Upload,
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
  },
  {
    label: '分类标签',
    desc: '维护线索与供应链标签体系',
    path: '/tag/risk-clue',
    icon: CollectionTag,
    iconColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
  },
]

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

function goToStat(card: StatCard) {
  activeStatKey.value = card.key
  const query: Record<string, string> = {}
  if (card.reviewStatus !== undefined) {
    query.reviewStatus = String(card.reviewStatus)
  }
  router.push({ path: '/risk-clue', query })
}

function goRiskClue(id: string) {
  router.push({ path: '/risk-clue', query: { id } })
}

async function fetchDashboardData() {
  try {
    const statsRes = await getRiskClueStats()
    const data = statsRes as any
    apiStats.value.total = data?.total || 0
    apiStats.value.pending = data?.pending || 0
    apiStats.value.reviewed = data?.reviewed || 0
    apiStats.value.warehoused = data?.warehoused || 0
    initTrendFromStats()
  } catch {
  }

  try {
    const listRes = await searchRiskClue({ page: 1, size: 5 })
    const raw = listRes as { rows?: RiskClue[]; records?: RiskClue[]; list?: RiskClue[]; data?: RiskClue[] }
    const rows = raw?.rows || raw?.records || raw?.list || raw?.data || []
    recentEvents.value = rows.slice(0, 5).map((item) => {
      const tag = riskLevelToTag(item.riskLevel)
      return {
        id: item.id,
        title: item.title || '未命名线索',
        level: tag.level,
        type: tag.type,
        time: formatRelativeTime(item.createdTime),
      }
    })
  } catch {
    recentEvents.value = []
  }
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  fetchDashboardData().then(() => {
    requestAnimationFrame(() => {
      barReady.value = true
    })
  })
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style lang="scss" scoped src="./dashboard.scss"></style>
