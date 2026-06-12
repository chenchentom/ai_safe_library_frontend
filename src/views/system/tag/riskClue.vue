<template>
  <div class="tag-page">
    <!-- 顶部工具栏 -->
    <div class="tag-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleAdd()">新增标签</el-button>
        <el-button :icon="Download" :loading="exportLoading" @click="handleExport">导出</el-button>
      </div>
      <div class="toolbar-right">
        <el-button :icon="Fold" @click="expandAll">展开全部</el-button>
        <el-button :icon="Expand" @click="collapseAll">折叠全部</el-button>
      </div>
    </div>

    <!-- 主体：左树右详情 -->
    <div class="tag-body">
      <!-- 左侧树 -->
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
                <el-tag size="small" type="info" class="tree-node-count" v-if="data.children && data.children.length">
                  {{ data.children.length }}
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="tag-detail-panel">
        <!-- 未选中 -->
        <div v-if="!selectedNode" class="detail-empty">
          <el-empty description="请选择左侧标签查看详情" :image-size="120" />
        </div>

        <!-- 已选中 -->
        <template v-else>
          <div class="detail-header">
            <span class="detail-title">{{ selectedNode.label }}</span>
            <div class="detail-actions">
              <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(selectedNode)">编辑</el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(selectedNode)">删除</el-button>
              <el-button size="small" :icon="Plus" @click="handleAdd(selectedNode.id)">新增子标签</el-button>
            </div>
          </div>

          <!-- 基本信息卡片 -->
          <el-descriptions :column="2" border size="small" class="detail-info">
            <el-descriptions-item label="标签ID">{{ selectedNode.id }}</el-descriptions-item>
            <el-descriptions-item label="编码">{{ selectedNode.tagCode }}</el-descriptions-item>
            <el-descriptions-item label="层级">{{ 'L' + selectedNode.tagLevel }}</el-descriptions-item>
            <el-descriptions-item label="路径">{{ selectedNode.tagPath }}</el-descriptions-item>
            <el-descriptions-item label="排序">{{ selectedNode.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="selectedNode.status === '0' ? 'success' : 'danger'" size="small">
                {{ selectedNode.status === '0' ? '启用' : '停用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ selectedNode.description || '-' }}</el-descriptions-item>
          </el-descriptions>

          <!-- 子标签列表 -->
          <div class="detail-children" v-if="selectedNode.children && selectedNode.children.length">
            <div class="children-title">子标签 ({{ selectedNode.children.length }})</div>
            <el-table :data="selectedNode.children" size="small" max-height="400">
              <el-table-column prop="label" label="名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="tagCode" label="编码" width="200" show-overflow-tooltip />
              <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
              <el-table-column prop="status" label="状态" width="70" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
                    {{ row.status === '0' ? '启用' : '停用' }}
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

    <!-- 新增/编辑弹窗 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Search, Download, Fold, Expand } from '@element-plus/icons-vue'
import { getTagTree, addTag, updateTag, deleteTag, exportTagCategory, type TagCategoryNode, type TagCategoryForm, type TagId } from '@/api/tagCategory'

// --- Refs ---
const treeRef = ref<any>(null)
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitLoading = ref(false)
const exportLoading = ref(false)
const dialogVisible = ref(false)
const treeData = ref<TagCategoryNode[]>([])
const treeFilter = ref('')
const selectedNode = ref<TagCategoryNode | null>(null)

const form = reactive<TagCategoryForm>({
  id: undefined,
  parentId: '0',
  module: 'risk_clue',
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

// 为 tree-select 提供 flat 选项（避免嵌套 children 导致的问题）
const parentTreeOptions = computed(() => {
  return treeData.value
})

// --- Tree filter ---
watch(treeFilter, (val) => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: any): boolean {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// --- Tree actions ---
function expandAll() {
  const allKeys = collectAllKeys(treeData.value)
  allKeys.forEach((key) => treeRef.value?.store.nodesMap[key]?.expand())
}

function collapseAll() {
  const allKeys = collectAllKeys(treeData.value)
  // 保持第一层展开
  const firstLevelKeys = treeData.value.map((n) => n.id)
  allKeys.forEach((key) => {
    if (!firstLevelKeys.includes(key)) {
      treeRef.value?.store.nodesMap[key]?.collapse()
    }
  })
}

function collectAllKeys(nodes: TagCategoryNode[]): TagId[] {
  let keys: TagId[] = []
  for (const node of nodes) {
    keys.push(node.id)
    if (node.children) {
      keys = keys.concat(collectAllKeys(node.children))
    }
  }
  return keys
}

// --- Data ---
async function fetchData() {
  loading.value = true
  try {
    treeData.value = await getTagTree()
    // Keep current selection if still valid after reload
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

function findNode(nodes: TagCategoryNode[], id: TagId): TagCategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function handleNodeClick(data: TagCategoryNode) {
  selectedNode.value = data
}

// --- CRUD ---
function handleAdd(parentId?: TagId) {
  form.id = undefined
  form.parentId = parentId || '0'
  form.tagName = ''
  form.tagCode = ''
  form.description = ''
  form.icon = ''
  form.sortOrder = 0
  form.status = '0'
  dialogVisible.value = true
}

function handleEdit(node: TagCategoryNode) {
  form.id = node.id
  form.parentId = node.parentId || '0'
  form.tagName = node.label
  form.tagCode = node.tagCode
  form.description = node.description
  form.icon = node.icon || ''
  form.sortOrder = node.sortOrder
  form.status = node.status
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (form.id) {
        await updateTag(form as TagCategoryForm)
        ElMessage.success('更新成功')
      } else {
        await addTag(form as TagCategoryForm)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      await fetchData()
      // Re-select the updated node
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

async function handleDelete(node: TagCategoryNode) {
  const hasChildren = node.children && node.children.length > 0
  const msg = hasChildren
    ? `确认删除「${node.label}」及其所有子标签 (${node.children?.length} 个)？`
    : `确认删除「${node.label}」？`
  try {
    await ElMessageBox.confirm(msg, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
    })
    await deleteTag(node.id)
    ElMessage.success('删除成功')
    selectedNode.value = null
    await fetchData()
  } catch (e: unknown) {
    if (e === 'cancel' || e === 'close') return
    const msg = e instanceof Error ? e.message : '删除失败'
    // 上次删除可能已成功但缓存未刷新，此时刷新列表即可
    if (msg.includes('标签不存在')) {
      ElMessage.warning('该标签已删除，正在刷新列表')
      selectedNode.value = null
      await fetchData()
      return
    }
    ElMessage.error(msg)
  }
}

async function handleExport() {
  exportLoading.value = true
  try {
    await exportTagCategory('risk_clue')
    ElMessage.success('导出成功')
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '导出失败')
  } finally {
    exportLoading.value = false
  }
}

// --- Init ---
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped src="./tag-page.scss"></style>
