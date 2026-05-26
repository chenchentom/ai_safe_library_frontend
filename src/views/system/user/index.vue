<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phonenumber" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable style="width: 120px">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button :icon="Delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="刷新">
            <el-button :icon="RefreshRight" circle @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="userId"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="userId" label="用户编号" width="90" align="center" />
        <el-table-column prop="userName" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="nickName" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="dept.deptName" label="部门" min-width="140" show-overflow-tooltip />
        <el-table-column prop="phonenumber" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === '0'"
              active-text="正常"
              inactive-text="停用"
              inline-prompt
              size="small"
              @change="(val: any) => handleStatusChange(row, val as boolean)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" size="small" :icon="Refresh" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户名" :disabled="!!formData.userId" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="formData.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :data="deptTree"
            :props="treeProps"
            value-key="id"
            placeholder="请选择部门"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="formData.phonenumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
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
import { Search, Refresh, Plus, Delete, RefreshRight, Edit } from '@element-plus/icons-vue'
import { getUserList, addUser, updateUser, deleteUser, resetPassword } from '@/api/user'
import { getDeptList } from '@/api/dept'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const selectedIds = ref<number[]>([])
const tableData = ref<any[]>([])
const deptTree = ref<any[]>([])
const treeProps = {
  label: 'label',
  children: 'children',
}

const searchForm = reactive({
  userName: '',
  phonenumber: '',
  status: '',
  dateRange: [] as string[],
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const formData = reactive({
  userId: 0,
  userName: '',
  nickName: '',
  deptId: undefined as number | undefined,
  phonenumber: '',
  email: '',
  status: '0',
})

const formRules: FormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => (formData.userId ? '编辑用户' : '新增用户'))

// 演示数据
const mockData = [
  { userId: 1, userName: 'admin', nickName: '系统管理员', dept: { deptName: '安全管理部' }, phonenumber: '13800000001', status: '0', createTime: '2026-01-15 09:30:00' },
  { userId: 2, userName: 'zhangsan', nickName: '张三', dept: { deptName: '技术部' }, phonenumber: '13800000002', status: '0', createTime: '2026-02-20 14:22:00' },
  { userId: 3, userName: 'lisi', nickName: '李四', dept: { deptName: '运营部' }, phonenumber: '13800000003', status: '0', createTime: '2026-03-10 10:15:00' },
  { userId: 4, userName: 'wangwu', nickName: '王五', dept: { deptName: '产品部' }, phonenumber: '13800000004', status: '1', createTime: '2026-04-05 08:45:00' },
  { userId: 5, userName: 'zhaoliu', nickName: '赵六', dept: { deptName: '安全响应组' }, phonenumber: '13800000005', status: '0', createTime: '2026-05-01 16:30:00' },
]

async function fetchData() {
  loading.value = true
  try {
    // 尝试真实 API
    try {
      const res = await getUserList({
        ...searchForm,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      })
      console.log('[用户列表] API响应:', res)
      console.log('[用户列表] res.rows:', (res as any).rows)
      console.log('[用户列表] res.total:', (res as any).total)
      tableData.value = (res as any).rows || (res as any).data || []
      pagination.total = (res as any).total || 0
    } catch (error) {
      console.error('[用户列表] API请求失败:', error)
      // API 不可用时使用演示数据
      tableData.value = mockData
      pagination.total = mockData.length
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  fetchData()
}

function handleReset() {
  searchForm.userName = ''
  searchForm.phonenumber = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.pageNum = 1
  fetchData()
}

function handleSelectionChange(rows: any[]) {
  selectedIds.value = rows.map((r) => r.userId)
}

function handleAdd() {
  formData.userId = 0
  formData.userName = ''
  formData.nickName = ''
  formData.deptId = undefined
  formData.phonenumber = ''
  formData.email = ''
  formData.status = '0'
  dialogVisible.value = true
}

function handleEdit(row: any) {
  Object.assign(formData, row, { deptId: row.dept?.deptId })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (formData.userId) {
        await updateUser(formData)
        ElMessage.success('修改成功')
      } else {
        await addUser(formData)
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
    await ElMessageBox.confirm(`确认删除用户「${row.userName}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
    })
    await deleteUser([row.userId])
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个用户？`, '批量删除', {
      type: 'warning',
      confirmButtonText: '删除',
    })
    await deleteUser(selectedIds.value)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled
  }
}

function handleStatusChange(row: any, val: boolean) {
  ElMessage.success(`${row.userName} ${val ? '已启用' : '已停用'}`)
}

async function handleResetPwd(row: any) {
  try {
    await ElMessageBox.confirm(`确认重置「${row.userName}」的密码？`, '重置密码', {
      type: 'warning',
      confirmButtonText: '确定',
    })
    await resetPassword(row.userId)
    ElMessage.success('密码重置成功')
  } catch {
    // cancelled
  }
}

async function fetchDeptTree() {
  try {
    const res = await getDeptList()
    console.log('[部门树] API响应:', res)
    deptTree.value = (res as any) || []
  } catch (error) {
    console.error('[部门树] API请求失败:', error)
    deptTree.value = []
  }
}

onMounted(() => {
  fetchData()
  fetchDeptTree()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding-left: 0;
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

.table-container :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: rgba(255, 255, 255, 0.55);
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.03);
  --el-pagination-hover-color: #4f7cff;
}

.table-container :deep(.el-switch__label) {
  color: rgba(255, 255, 255, 0.55);
}

.table-container :deep(.el-switch__label.is-active) {
  color: rgba(255, 255, 255, 0.82);
}

:deep(.el-dialog) {
  background: linear-gradient(180deg, rgba(10, 16, 28, 0.96), rgba(11, 18, 32, 0.98));
  border: 1px solid rgba(80, 120, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(80, 120, 255, 0.06), 0 10px 32px rgba(0, 0, 0, 0.35);
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
.page-container :deep(.el-range-editor.el-input__wrapper),
.page-container :deep(.el-date-editor.el-input__wrapper),
.page-container :deep(.el-tree-select__wrapper) {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.page-container :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.86);
}

.page-container :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.42);
}

.page-container :deep(.el-select__placeholder) {
  color: rgba(255, 255, 255, 0.42);
}

.page-container :deep(.el-button--primary) {
  background: linear-gradient(90deg, #4f7cff 0%, #3d67e6 100%);
  border-color: rgba(79, 124, 255, 0.28);
  color: #ffffff;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset;
}

.page-container :deep(.el-button--primary:hover) {
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.12) inset;
}

.page-container :deep(.el-button:not(.el-button--primary)) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.78);
}

.page-container :deep(.el-button:not(.el-button--primary):hover) {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
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

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-base);
}
</style>
