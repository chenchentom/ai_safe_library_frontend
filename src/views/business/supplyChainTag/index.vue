<template>
  <div class="supply-chain-tag-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">AI供应链生态平台</h2>
        <p class="page-desc">探索AI技术生态，发现前沿技术工具</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索技术标签..."
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <div class="tree-panel">
        <div class="tree-header">
          <span class="tree-title">生态树</span>
          <el-button text size="small" @click="handleExpandAll">
            <el-icon><Expand /></el-icon>
            展开全部
          </el-button>
        </div>
        <el-tree
          ref="treeRef"
          :data="tagTree"
          :props="treeProps"
          node-key="id"
          default-expand-all
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          class="tag-tree"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon v-if="data.nodeType === 'stage'" class="node-icon stage-icon"><Odometer /></el-icon>
              <el-icon v-else-if="data.nodeType === 'sub_stage'" class="node-icon sub-stage-icon"><Folder /></el-icon>
              <el-icon v-else class="node-icon leaf-icon"><Box /></el-icon>
              <span class="node-label">{{ node.label }}</span>
            </div>
          </template>
        </el-tree>
      </div>

      <div class="cards-panel">
        <div class="cards-header">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalTags }}</div>
              <div class="stat-label">总标签数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.stages }}</div>
              <div class="stat-label">阶段</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.subStages }}</div>
              <div class="stat-label">子阶段</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.technologies }}</div>
              <div class="stat-label">技术工具</div>
            </div>
          </div>
        </div>

        <div v-loading="loading" class="cards-container">
          <div
            v-for="item in tagList"
            :key="item.id"
            class="tech-card"
            @click="handleCardClick(item)"
          >
            <div class="card-icon">
              <el-icon :size="36"><Box /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">{{ item.tagName }}</div>
              <div class="card-intro">{{ item.intro || '暂无介绍' }}</div>
              <div class="card-meta">
                <el-tag v-if="item.bizType" size="small" type="info">{{ item.bizType }}</el-tag>
                <el-tag v-if="item.developer" size="small" type="success">{{ item.developer }}</el-tag>
              </div>
            </div>
          </div>

          <div v-if="!loading && tagList.length === 0" class="empty-state">
            <el-icon :size="64"><Document /></el-icon>
            <p>暂无数据</p>
          </div>
        </div>

        <div class="pagination-wrap" v-if="pagination.total > 0">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            popper-class="app-pagination-popper"
            :page-sizes="[12, 24, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="fetchTagList"
            @current-change="fetchTagList"
          />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailDialogVisible"
      :title="currentTag?.tagName"
      width="600px"
    >
      <div v-if="currentTag" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="节点类型">
            <el-tag :type="getNodeTypeTagType(currentTag.nodeType)">
              {{ getNodeTypeLabel(currentTag.nodeType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="业务形态">{{ currentTag.bizType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开发者">{{ currentTag.developer || '-' }}</el-descriptions-item>
          <el-descriptions-item label="简介">{{ currentTag.intro || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentTag.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="路径">{{ currentTag.tagPath }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentTag.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentTag.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="导入数据" width="500px">
      <el-upload
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
      >
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          选择文件
        </el-button>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx 或 .xls 格式的 Excel 文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleConfirmImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Upload,
  Download,
  Expand,
  Odometer,
  Folder,
  Box,
  Document,
} from '@element-plus/icons-vue'
import {
  getSupplyChainTagTree,
  getSupplyChainTagList,
  getSupplyChainTagById,
  importSupplyChainTag,
  exportSupplyChainTag,
  type SupplyChainTag,
} from '@/api/supplyChainTag'

const treeRef = ref()
const loading = ref(false)
const importLoading = ref(false)
const searchKeyword = ref('')
const selectedFile = ref<File | null>(null)
const detailDialogVisible = ref(false)
const importDialogVisible = ref(false)
const currentTag = ref<SupplyChainTag | null>(null)
const tagTree = ref<SupplyChainTag[]>([])
const tagList = ref<SupplyChainTag[]>([])
const selectedParentId = ref<number>(0)

const stats = reactive({
  totalTags: 0,
  stages: 0,
  subStages: 0,
  technologies: 0,
})

const pagination = reactive({
  page: 1,
  size: 12,
  total: 0,
})

const treeProps = {
  label: 'tagName',
  children: 'children',
}

function getNodeTypeLabel(type: string): string {
  const map: Record<string, string> = {
    stage: '阶段',
    sub_stage: '子阶段',
    leaf: '技术/工具',
  }
  return map[type] || type
}

function getNodeTypeTagType(type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    stage: 'primary',
    sub_stage: 'warning',
    leaf: 'success',
  }
  return map[type] || 'info'
}

async function fetchTagTree() {
  try {
    const res = await getSupplyChainTagTree()
    tagTree.value = res || []
    calculateStats(res || [])
  } catch {
    ElMessage.error('获取标签树失败')
  }
}

function calculateStats(tree: SupplyChainTag[]) {
  let total = 0
  let stages = 0
  let subStages = 0
  let technologies = 0

  function traverse(nodes: SupplyChainTag[]) {
    nodes.forEach(node => {
      total++
      if (node.nodeType === 'stage') stages++
      else if (node.nodeType === 'sub_stage') subStages++
      else if (node.nodeType === 'leaf') technologies++
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  stats.totalTags = total
  stats.stages = stages
  stats.subStages = subStages
  stats.technologies = technologies
}

async function fetchTagList() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      size: pagination.size,
    }
    if (selectedParentId.value > 0) {
      params.parentId = selectedParentId.value
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    const res = await getSupplyChainTagList(params)
    const data = res as any
    tagList.value = data?.rows || data?.records || data?.list || data?.data || []
    pagination.total = data?.total || 0
  } catch {
    tagList.value = []
  } finally {
    loading.value = false
  }
}

function handleNodeClick(data: SupplyChainTag) {
  if (data.isLeaf === 1 || data.nodeType === 'leaf') {
    tagList.value = [data]
    pagination.total = 1
  } else {
    selectedParentId.value = data.id
    pagination.page = 1
    fetchTagList()
  }
}

async function handleCardClick(item: SupplyChainTag) {
  try {
    const res = await getSupplyChainTagById(item.id)
    currentTag.value = res
  } catch {
    currentTag.value = item
  }
  detailDialogVisible.value = true
}

function handleSearch() {
  pagination.page = 1
  fetchTagList()
}

function handleExpandAll() {
  treeRef.value?.setExpandedKeys(tagTree.value.map((node: any) => node.id))
}

function handleImport() {
  importDialogVisible.value = true
  selectedFile.value = null
}

function handleFileChange(file: any) {
  selectedFile.value = file.raw
}

async function handleConfirmImport() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  importLoading.value = true
  try {
    await importSupplyChainTag(selectedFile.value)
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    fetchTagTree()
    fetchTagList()
  } catch {
    ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

async function handleExport() {
  try {
    await exportSupplyChainTag()
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchTagTree()
  fetchTagList()
})
</script>

<style lang="scss" scoped>
.supply-chain-tag-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, rgba(14, 22, 40, 0.96), rgba(10, 16, 28, 0.98));
  border: 1px solid rgba(80, 120, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(80, 120, 255, 0.04), 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;

  .header-left {
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: rgba(230, 237, 247, 0.92);
    }
    .page-desc {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: rgba(230, 237, 247, 0.62);
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.page-content {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.tech-card {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(11, 18, 32, 0.98));
  border: 1px solid rgba(80, 120, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(80, 120, 255, 0.04);
  transition: all 0.2s ease;
}

.tech-card:hover {
  transform: translateY(-2px);
  border-color: rgba(90, 120, 255, 0.28);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(79, 124, 255, 0.12);
}

.tree-panel {
  width: 300px;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(11, 18, 32, 0.98));
  border: 1px solid rgba(80, 120, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(80, 120, 255, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px 8px;
    border-bottom: 1px solid rgba(80, 120, 255, 0.12);

    .tree-title {
      font-size: 15px;
      font-weight: 600;
      color: rgba(230, 237, 247, 0.86);
    }
  }

  .tag-tree {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: transparent;

    :deep(.el-tree) {
      background: transparent;
      color: rgba(230, 237, 247, 0.78);
    }

    :deep(.el-tree-node) {
      background: transparent;
    }

    :deep(.el-tree-node__children) {
      background: transparent;
    }

    :deep(.el-tree__empty-block) {
      background: transparent;
    }

    :deep(.el-tree-node__content) {
      height: 36px;
      border-radius: 10px;
      transition: all 0.2s;
      background: transparent;
    }

    :deep(.el-tree-node__content:hover) {
      background: rgba(80, 120, 255, 0.08);
    }

    :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
      background: linear-gradient(90deg, rgba(79, 124, 255, 0.25), rgba(122, 92, 255, 0.18));
      border: 1px solid rgba(90, 120, 255, 0.25);
      box-shadow: 0 0 12px rgba(79, 124, 255, 0.18);
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;

      .node-icon {
        font-size: 16px;
      }
      .stage-icon {
        color: rgba(230, 237, 247, 0.72);
      }
      .sub-stage-icon {
        color: rgba(230, 237, 247, 0.62);
      }
      .leaf-icon {
        color: rgba(230, 237, 247, 0.62);
      }
      .node-label {
        font-size: 14px;
        color: rgba(230, 237, 247, 0.78);
      }
    }
  }
}

.cards-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;

  .cards-header {
    margin-bottom: 12px;
    flex-shrink: 0;

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .stat-item {
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(11, 18, 32, 0.98));
        border: 1px solid rgba(80, 120, 255, 0.15);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(56, 110, 255, 0.08);
        backdrop-filter: blur(12px);

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          color: #dce7ff;
          text-shadow: 0 0 12px rgba(79, 124, 255, 0.35);
        }
        .stat-label {
          font-size: 13px;
          color: rgba(230, 237, 247, 0.62);
          margin-top: 4px;
        }
      }
    }
  }

  .cards-container {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    overflow-y: auto;
    align-content: start;
  }

  .tech-card {
    display: flex;
    gap: 16px;
    padding: 20px;
    cursor: pointer;

    .card-icon {
      width: 64px;
      height: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(79, 124, 255, 0.12);
      border: 1px solid rgba(80, 120, 255, 0.12);
      border-radius: 16px;
      color: rgba(230, 237, 247, 0.82);
      box-shadow: 0 0 20px rgba(79, 124, 255, 0.12);
    }

    .card-content {
      flex: 1;
      min-width: 0;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: rgba(230, 237, 247, 0.9);
      }
      .card-intro {
        font-size: 13px;
        color: rgba(230, 237, 247, 0.62);
        line-height: 1.5;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .card-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: rgba(230, 237, 247, 0.42);

    p {
      margin-top: 12px;
      font-size: 14px;
    }
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  flex-shrink: 0;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(80, 120, 255, 0.12);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: rgba(230, 237, 247, 0.86);
}

:deep(.el-input__inner::placeholder) {
  color: rgba(230, 237, 247, 0.42);
}

:deep(.el-tag.el-tag--info) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(80, 120, 255, 0.12);
  color: rgba(230, 237, 247, 0.62);
}

:deep(.el-dialog) {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(11, 18, 32, 0.98));
  border: 1px solid rgba(80, 120, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(80, 120, 255, 0.04), 0 10px 30px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(16px);
}

:deep(.el-dialog__title) {
  color: rgba(230, 237, 247, 0.9);
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(230, 237, 247, 0.62);
}

:deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(255, 255, 255, 0.03);
  --el-descriptions-item-bordered-content-background: rgba(11, 18, 32, 0.35);
}

:deep(.el-descriptions__cell) {
  border-color: rgba(80, 120, 255, 0.12) !important;
  color: rgba(230, 237, 247, 0.78);
}

:deep(.el-descriptions__label) {
  color: rgba(230, 237, 247, 0.62);
}

:deep(.el-upload-dragger) {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(80, 120, 255, 0.18);
}
</style>
