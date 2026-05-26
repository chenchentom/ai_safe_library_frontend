<template>
  <div class="page-container">
    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd()">新增</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        default-expand-all
      >
        <el-table-column prop="deptName" label="部门名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="orderNum" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small" effect="plain">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :icon="Plus" @click="handleAdd(row.deptId)">新增</el-button>
            <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="deptTree"
            :props="{ label: 'label', children: 'children' }"
            value-key="id"
            placeholder="请选择上级部门（可选）"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="formData.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio value="0">正常</el-radio>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getDeptList, addDept, updateDept, deleteDept } from '@/api/dept'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<any[]>([])
const deptTree = ref<any[]>([])

const formData = reactive({
  deptId: 0,
  parentId: undefined as number | undefined,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0',
})

const formRules: FormRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  orderNum: [{ required: true, message: '请输入排序', trigger: 'blur' }],
}

const dialogTitle = computed(() => (formData.deptId ? '编辑部门' : '新增部门'))

const mockData = [
  { deptId: 1, deptName: 'AI 安全平台', orderNum: 1, status: '0', leader: '张总', phone: '13800000001', createTime: '2026-01-01 00:00:00', children: [
    { deptId: 2, deptName: '安全管理部', orderNum: 1, status: '0', leader: '李经理', phone: '13800000002', createTime: '2026-01-01 00:00:00', children: [
      { deptId: 6, deptName: '安全响应组', orderNum: 1, status: '0', leader: '王组长', phone: '13800000006', createTime: '2026-01-15 00:00:00' },
      { deptId: 7, deptName: '威胁分析组', orderNum: 2, status: '0', leader: '陈组长', phone: '13800000007', createTime: '2026-01-15 00:00:00' },
    ]},
    { deptId: 3, deptName: '技术部', orderNum: 2, status: '0', leader: '刘经理', phone: '13800000003', createTime: '2026-01-01 00:00:00' },
    { deptId: 4, deptName: '运营部', orderNum: 3, status: '0', leader: '赵经理', phone: '13800000004', createTime: '2026-02-01 00:00:00' },
    { deptId: 5, deptName: '产品部', orderNum: 4, status: '1', leader: '周经理', phone: '13800000005', createTime: '2026-03-01 00:00:00' },
  ]},
]

function buildDeptTree(data: any[]): any[] {
  if (!data || data.length === 0) return []
  return data.map((d) => ({
    id: d.deptId,
    label: d.deptName,
    children: d.children ? buildDeptTree(d.children) : [],
  }))
}

async function fetchData() {
  loading.value = true
  try {
    try {
      const res = await getDeptList()
      tableData.value = (res as any).data || (res as any) || []
      deptTree.value = buildDeptTree(tableData.value)
    } catch {
      tableData.value = mockData
      deptTree.value = buildDeptTree(mockData)
    }
  } finally {
    loading.value = false
  }
}

function handleAdd(parentId?: number) {
  formData.deptId = 0
  formData.parentId = parentId || undefined
  formData.deptName = ''
  formData.orderNum = 0
  formData.leader = ''
  formData.phone = ''
  formData.email = ''
  formData.status = '0'
  dialogVisible.value = true
}

function handleEdit(row: any) {
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (formData.deptId) {
        await updateDept(formData)
        ElMessage.success('修改成功')
      } else {
        await addDept(formData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除部门「${row.deptName}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
    })
    await deleteDept(row.deptId)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding-left: 0;
}

.table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: none;
  backdrop-filter: blur(12px);

  &:hover {
    border-color: rgba(255, 255, 255, 0.10);
  }
}

.table-container :deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.03);
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.04);
  --el-table-border-color: rgba(255, 255, 255, 0.06);
  --el-table-text-color: rgba(255, 255, 255, 0.82);
  --el-table-header-text-color: rgba(255, 255, 255, 0.55);
  --el-table-striped-row-bg-color: rgba(255, 255, 255, 0.02);
}

.table-container :deep(.el-table__inner-wrapper),
.table-container :deep(.el-table__header-wrapper),
.table-container :deep(.el-table__body-wrapper) {
  background: transparent;
}

.table-container :deep(.el-tag) {
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.78);
  font-weight: 500;
}

.table-container :deep(.el-tag--success) {
  background: rgba(82, 196, 26, 0.1);
  color: #73d13d;
}

.table-container :deep(.el-tag--danger) {
  background: rgba(255, 77, 79, 0.1);
  color: #ff7875;
}

:deep(.el-dialog) {
  background: linear-gradient(180deg, rgba(10, 16, 28, 0.96), rgba(11, 18, 32, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(16px);
}

:deep(.el-dialog__title) {
  color: rgba(255, 255, 255, 0.86);
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.62);
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.55);
}

.page-container :deep(.el-input__wrapper),
.page-container :deep(.el-select__wrapper),
.page-container :deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.page-container :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.86);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-base);

  .toolbar-left {
    display: flex;
    gap: var(--spacing-sm);
  }
}
</style>
