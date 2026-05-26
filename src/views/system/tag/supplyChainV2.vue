<template>
  <div class="tag-page" v-loading="loading">
    <div class="tag-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleAdd()">新增标签</el-button>
        <el-button :icon="Upload" @click="importVisible = true">导入</el-button>
        <el-button :icon="Download" @click="handleExport">导出</el-button>
      </div>
      <div class="toolbar-right">
        <el-button :icon="Fold" @click="expandAll">展开全部</el-button>
        <el-button :icon="Expand" @click="collapseAll">折叠全部</el-button>
      </div>
    </div>

    <div class="tag-body">
      <div class="tag-tree-panel">
        <div class="tree-search">
          <el-input
            v-model="treeFilter"
            placeholder="搜索标签…"
            :prefix-icon="Search"
            clearable
            size="default"
          />
        </div>
        <div class="tree-container">
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            node-key="id"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.icon" class="tree-node-icon"><component :is="data.icon" /></el-icon>
                <span class="tree-node-label">{{ node.label }}</span>
                <el-tag
                  v-if="data.children && data.children.length"
                  size="small"
                  type="info"
                  class="tree-node-count"
                >
                  {{ data.children.length }}
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <div class="tag-detail-panel">
        <div v-if="!selectedNode" class="detail-empty">
          <el-empty description="请选择左侧标签查看详情" :image-size="120" />
        </div>

        <template v-else>
          <div class="detail-header">
            <span class="detail-title">{{ selectedNode.label }}</span>
            <div class="detail-actions">
              <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(selectedNode)">编辑</el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(selectedNode)">删除</el-button>
              <el-button size="small" :icon="Plus" @click="handleAdd(selectedNode.id)">新增子标签</el-button>
            </div>
          </div>

          <el-descriptions :column="2" border size="small" class="detail-info">
            <el-descriptions-item label="标签ID">{{ selectedNode.id }}</el-descriptions-item>
            <el-descriptions-item label="编码">{{ selectedNode.tagCode || '—' }}</el-descriptions-item>
            <el-descriptions-item label="父级标签">
              {{ selectedNode.parentName || (selectedNode.parentId ? '—' : '根节点') }}
            </el-descriptions-item>
            <el-descriptions-item label="所属模块">{{ selectedNode.module || 'supply_chain' }}</el-descriptions-item>
            <el-descriptions-item label="层级">{{ 'L' + selectedNode.tagLevel }}</el-descriptions-item>
            <el-descriptions-item label="路径">{{ selectedNode.tagPath || '—' }}</el-descriptions-item>
            <el-descriptions-item label="排序">{{ selectedNode.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="isEnabled(selectedNode.status) ? 'success' : 'danger'" size="small">
                {{ isEnabled(selectedNode.status) ? '启用' : '停用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ selectedNode.description || '—' }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="selectedNode.children && selectedNode.children.length" class="detail-children">
            <div class="children-title">子标签 ({{ selectedNode.children.length }})</div>
            <el-table :data="selectedNode.children" size="small" max-height="400">
              <el-table-column prop="label" label="名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="tagCode" label="编码" width="200" show-overflow-tooltip />
              <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
              <el-table-column prop="status" label="状态" width="70" align="center">
                <template #default="{ row }">
                  <el-tag :type="isEnabled(row.status) ? 'success' : 'danger'" size="small">
                    {{ isEnabled(row.status) ? '启用' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="上级标签" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentTreeOptions"
            :props="{ label: 'label', children: 'children' }"
            value-key="id"
            placeholder="请选择上级标签（可选）"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="!form.parentId" label="所属模块" prop="module">
          <el-input v-model="form.module" placeholder="如 supply_chain" />
        </el-form-item>
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="form.tagName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签编码" prop="tagCode">
          <el-input v-model="form.tagCode" placeholder="英文标识" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="Element Plus icon name" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="0">启用</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importVisible" title="导入 Excel" width="460px" :close-on-click-modal="false">
      <el-upload drag action="#" :auto-upload="false" :on-change="handleFileChange" accept=".xlsx,.xls">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽 Excel 文件到此处 或 <em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="importVisible = false">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Plus, Edit, Delete, Search, Upload, Download, Fold, Expand, UploadFilled } from '@element-plus/icons-vue'
import {
  getSupplyChainTagV2Tree,
  addSupplyChainTagV2,
  updateSupplyChainTagV2,
  deleteSupplyChainTagV2,
  type SupplyChainTagV2Node,
  type SupplyChainTagV2Form,
} from '@/api/supplyChainTagV2'

const treeRef = ref<{ filter: (v: string) => void; store: { nodesMap: Record<number, { expand: () => void; collapse: () => void }> } } | null>(null)
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const importVisible = ref(false)
const treeData = ref<SupplyChainTagV2Node[]>([])
const treeFilter = ref('')
const selectedNode = ref<SupplyChainTagV2Node | null>(null)

const form = reactive<SupplyChainTagV2Form & { id?: number }>({
  id: undefined,
  parentId: 0,
  module: 'supply_chain',
  tagName: '',
  tagCode: '',
  description: '',
  icon: '',
  sortOrder: 0,
  status: '0',
})

const formRules: FormRules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  tagCode: [{ required: true, message: '请输入标签编码', trigger: 'blur' }],
}

const treeProps = {
  label: 'label',
  children: 'children',
}

const dialogTitle = computed(() => (form.id ? '编辑标签' : '新增标签'))
const parentTreeOptions = computed(() => treeData.value)

/** 启用：status 为 0（与风险线索标签一致） */
function isEnabled(status?: string | number): boolean {
  if (status === undefined || status === null) return true
  return String(status) === '0'
}

watch(treeFilter, (val) => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: SupplyChainTagV2Node): boolean {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

function expandAll() {
  collectAllKeys(treeData.value).forEach((key) => treeRef.value?.store.nodesMap[key]?.expand())
}

function collapseAll() {
  const firstLevelKeys = treeData.value.map((n) => n.id)
  collectAllKeys(treeData.value).forEach((key) => {
    if (!firstLevelKeys.includes(key)) {
      treeRef.value?.store.nodesMap[key]?.collapse()
    }
  })
}

function collectAllKeys(nodes: SupplyChainTagV2Node[]): number[] {
  let keys: number[] = []
  for (const node of nodes) {
    keys.push(node.id)
    if (node.children?.length) {
      keys = keys.concat(collectAllKeys(node.children))
    }
  }
  return keys
}

async function fetchData() {
  loading.value = true
  try {
    treeData.value = await getSupplyChainTagV2Tree()
    if (selectedNode.value) {
      const found = findNode(treeData.value, selectedNode.value.id)
      if (found) selectedNode.value = found
    }
  } catch {
    ElMessage.error('加载标签树失败')
  } finally {
    loading.value = false
  }
}

function findNode(nodes: SupplyChainTagV2Node[], id: number): SupplyChainTagV2Node | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function handleNodeClick(data: SupplyChainTagV2Node) {
  selectedNode.value = data
}

function handleAdd(parentId?: number) {
  form.id = undefined
  form.parentId = parentId || 0
  form.module = 'supply_chain'
  form.tagName = ''
  form.tagCode = ''
  form.description = ''
  form.icon = ''
  form.sortOrder = 0
  form.status = '0'
  dialogVisible.value = true
}

function handleEdit(node: SupplyChainTagV2Node) {
  form.id = node.id
  form.parentId = node.parentId || 0
  form.module = node.module || 'supply_chain'
  form.tagName = node.label
  form.tagCode = node.tagCode
  form.description = node.description
  form.icon = node.icon || ''
  form.sortOrder = node.sortOrder
  form.status = String(node.status ?? '0')
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const payload: SupplyChainTagV2Form = {
        parentId: form.parentId || 0,
        module: form.parentId ? undefined : form.module || 'supply_chain',
        tagName: form.tagName,
        tagCode: form.tagCode,
        description: form.description,
        icon: form.icon,
        sortOrder: form.sortOrder,
        status: form.status,
      }
      if (form.id) {
        await updateSupplyChainTagV2({ ...payload, id: form.id })
        ElMessage.success('更新成功')
      } else {
        await addSupplyChainTagV2(payload)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      await fetchData()
      if (selectedNode.value) {
        const found = findNode(treeData.value, selectedNode.value.id)
        if (found) selectedNode.value = found
      }
    } catch {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(node: SupplyChainTagV2Node) {
  const childCount = node.children?.length || 0
  const msg = childCount
    ? `确认删除「${node.label}」及其所有子标签 (${childCount} 个)？`
    : `确认删除「${node.label}」？`
  try {
    await ElMessageBox.confirm(msg, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
    })
    await deleteSupplyChainTagV2(node.id)
    ElMessage.success('删除成功')
    selectedNode.value = null
    await fetchData()
  } catch {
    // cancelled or failed
  }
}

function handleFileChange(_file: UploadFile) {
  ElMessage.info('Excel 导入功能开发中')
}

function handleExport() {
  ElMessage.info('Excel 导出功能开发中')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped src="./tag-page.scss"></style>
