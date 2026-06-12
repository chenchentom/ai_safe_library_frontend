<template>
  <div class="page-container system-admin">
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
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable popper-class="system-admin-popper" style="width: 120px">
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
            popper-class="system-admin-popper"
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
          popper-class="app-pagination-popper"
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
      class="system-admin-dialog"
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
        <template v-if="!formData.userId">
          <el-form-item label="登录密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              show-password
              placeholder="6-32 位，不填则默认为 admin123"
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入密码"
              autocomplete="new-password"
            />
          </el-form-item>
        </template>
        <el-form-item v-else label="密码">
          <span class="pwd-hint">编辑用户不修改密码，可在列表中点击「重置密码」设置新密码</span>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :data="deptTree"
            :props="treeProps"
            value-key="id"
            placeholder="请选择部门"
            check-strictly
            filterable
            popper-class="system-admin-popper"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="formData.phonenumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="个人角色">
          <el-select v-model="formData.roleIds" multiple collapse-tags popper-class="system-admin-popper" placeholder="额外绑定角色（与部门角色合并生效）" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.roleId" :label="r.roleName" :value="r.roleId" />
          </el-select>
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

    <!-- 重置密码 -->
    <el-dialog
      v-model="resetPwdVisible"
      title="重置密码"
      width="480px"
      class="system-admin-dialog"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="resetResetPwdForm"
    >
      <p v-if="resetPwdTarget" class="reset-pwd-user">
        为用户 <strong>{{ resetPwdTarget.userName }}</strong> 设置新登录密码
      </p>
      <el-form ref="resetPwdFormRef" :model="resetPwdForm" :rules="resetPwdRules" label-width="90px">
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="resetPwdForm.password"
            type="password"
            show-password
            placeholder="6-32 位"
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="resetPwdLoading" @click="submitResetPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { openDialogVisible } from '@/utils/cleanupOverlays'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Delete, RefreshRight, Edit } from '@element-plus/icons-vue'
import { getUserList, getUser, addUser, updateUser, deleteUser, resetPassword, checkUserUnique } from '@/api/user'
import { getDeptList } from '@/api/dept'
import { getRoleList, type RoleData } from '@/api/role'

const loading = ref(false)
const submitLoading = ref(false)
const resetPwdLoading = ref(false)
const dialogVisible = ref(false)
const resetPwdVisible = ref(false)
const formRef = ref<FormInstance>()
const resetPwdFormRef = ref<FormInstance>()
const resetPwdTarget = ref<{ userId: string; userName: string } | null>(null)
const selectedIds = ref<string[]>([])
const tableData = ref<any[]>([])
const deptTree = ref<any[]>([])
const roleOptions = ref<RoleData[]>([])
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
  userId: '' as string,
  userName: '',
  nickName: '',
  deptId: undefined as number | string | undefined,
  phonenumber: '',
  email: '',
  status: '0',
  roleIds: [] as Array<number | string>,
  password: '',
  confirmPassword: '',
})

function normalizeUserId(id: unknown): string {
  if (id === null || id === undefined || id === '') return ''
  return String(id)
}

/** 编辑时记录原始用户名/昵称，仅改角色等字段时跳过唯一性校验 */
const editSnapshot = reactive({
  userId: '',
  userName: '',
  nickName: '',
})

function normalizeRoleIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return []
  return ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
}

function fillUserForm(source: Record<string, unknown>) {
  formData.userId = normalizeUserId(source.userId)
  formData.userName = String(source.userName ?? '')
  formData.nickName = String(source.nickName ?? '')
  formData.deptId = source.deptId != null ? String(source.deptId) : source.dept && typeof source.dept === 'object'
    ? String((source.dept as Record<string, unknown>).deptId ?? '')
    : undefined
  if (formData.deptId === '') formData.deptId = undefined
  formData.phonenumber = String(source.phonenumber ?? '')
  formData.email = String(source.email ?? '')
  formData.status = String(source.status ?? '0')
  formData.roleIds = normalizeRoleIds(source.roleIds)
  formData.password = ''
  formData.confirmPassword = ''
  editSnapshot.userId = formData.userId
  editSnapshot.userName = formData.userName
  editSnapshot.nickName = formData.nickName
}

const validateConfirmPassword = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (formData.password && value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateUserNameUnique = async (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    callback()
    return
  }
  if (editSnapshot.userId && trimmed === editSnapshot.userName) {
    callback()
    return
  }
  try {
    const res = await checkUserUnique({
      userName: trimmed,
      userId: editSnapshot.userId || undefined,
    })
    if (res.userNameUnique === false) {
      callback(new Error('用户名已存在'))
      return
    }
    callback()
  } catch {
    callback()
  }
}

const validateNickNameUnique = async (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    callback()
    return
  }
  if (editSnapshot.userId && trimmed === editSnapshot.nickName) {
    callback()
    return
  }
  try {
    const res = await checkUserUnique({
      nickName: trimmed,
      userId: editSnapshot.userId || undefined,
    })
    if (res.nickNameUnique === false) {
      callback(new Error('昵称已存在'))
      return
    }
    callback()
  } catch {
    callback()
  }
}

const formRules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUserNameUnique, trigger: 'blur' },
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { validator: validateNickNameUnique, trigger: 'blur' },
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (value.length < 6 || value.length > 32) {
          callback(new Error('密码长度为 6-32 位'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => (formData.userId ? '编辑用户' : '新增用户'))

const resetPwdForm = reactive({
  password: '',
  confirmPassword: '',
})

const validateResetConfirmPassword = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (value !== resetPwdForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetPwdRules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为 6-32 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateResetConfirmPassword, trigger: 'blur' },
  ],
}

function resetResetPwdForm() {
  resetPwdTarget.value = null
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdFormRef.value?.clearValidate()
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getUserList({
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    })
    tableData.value = ((res as any).rows || (res as any).data || []).map((row: Record<string, unknown>) => ({
      ...row,
      userId: normalizeUserId(row.userId),
      deptId: row.deptId != null ? String(row.deptId) : row.dept && typeof row.dept === 'object'
        ? String((row.dept as Record<string, unknown>).deptId ?? '')
        : row.deptId,
    }))
    pagination.total = (res as any).total || 0
  } catch (error) {
    console.error('[用户列表] API请求失败:', error)
    tableData.value = []
    pagination.total = 0
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
  selectedIds.value = rows.map((r) => normalizeUserId(r.userId))
}

function handleAdd() {
  formData.userId = ''
  editSnapshot.userId = ''
  editSnapshot.userName = ''
  editSnapshot.nickName = ''
  formData.userName = ''
  formData.nickName = ''
  formData.deptId = undefined
  formData.phonenumber = ''
  formData.email = ''
  formData.status = '0'
  formData.roleIds = []
  formData.password = ''
  formData.confirmPassword = ''
  openDialogVisible(dialogVisible)
}

async function handleEdit(row: any) {
  const userId = normalizeUserId(row.userId)
  if (userId) {
    try {
      const detail = (await getUser(userId)) as Record<string, unknown>
      fillUserForm(detail)
    } catch {
      fillUserForm(row)
    }
  } else {
    fillUserForm(row)
  }
  openDialogVisible(dialogVisible)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (formData.userId) {
        await updateUser({
          userId: formData.userId,
          userName: formData.userName,
          nickName: formData.nickName,
          deptId: formData.deptId,
          phonenumber: formData.phonenumber,
          email: formData.email,
          status: formData.status,
          roleIds: formData.roleIds,
        })
        ElMessage.success('修改成功')
      } else {
        const { confirmPassword: _, userId: __, ...payload } = formData
        await addUser(payload)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch {
      // 错误信息由请求拦截器展示
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(row: any) {
  const userId = normalizeUserId(row.userId)
  if (!userId) {
    ElMessage.error('用户 ID 无效，无法删除')
    return
  }
  try {
    await ElMessageBox.confirm(`确认删除用户「${row.userName}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
    })
  } catch {
    return
  }
  try {
    await deleteUser([userId])
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // 错误信息由请求拦截器展示
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个用户？`, '批量删除', {
      type: 'warning',
      confirmButtonText: '删除',
    })
  } catch {
    return
  }
  try {
    await deleteUser(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchData()
  } catch {
    // 错误信息由请求拦截器展示
  }
}

async function handleStatusChange(row: any, val: boolean) {
  const newStatus = val ? '0' : '1'
  try {
    await updateUser({ userId: normalizeUserId(row.userId), status: newStatus } as any)
    ElMessage.success(`${row.userName} ${val ? '已启用' : '已停用'}`)
    fetchData()
  } catch {
    // 错误信息由请求拦截器展示
    // 回滚前端状态
    row.status = val ? '1' : '0'
  }
}

function handleResetPwd(row: any) {
  resetPwdTarget.value = { userId: normalizeUserId(row.userId), userName: row.userName }
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdVisible.value = true
}

async function submitResetPwd() {
  if (!resetPwdFormRef.value || !resetPwdTarget.value) return
  try {
    await resetPwdFormRef.value.validate()
  } catch {
    return
  }
  resetPwdLoading.value = true
  try {
    await resetPassword(resetPwdTarget.value.userId, resetPwdForm.password)
    ElMessage.success('密码重置成功')
    resetPwdVisible.value = false
  } catch {
    // 错误由请求拦截器提示
  } finally {
    resetPwdLoading.value = false
  }
}

function buildDeptTree(data: any[]): any[] {
  if (!data?.length) return []
  return data.map((d) => ({
    id: d.deptId != null ? String(d.deptId) : d.id != null ? String(d.id) : '',
    label: d.deptName ?? d.label,
    children: d.children?.length ? buildDeptTree(d.children) : [],
  }))
}

async function fetchDeptTree() {
  try {
    const res = await getDeptList()
    const list = Array.isArray(res) ? res : (res as any)?.data ?? []
    deptTree.value = buildDeptTree(list)
  } catch (error) {
    console.error('[部门树] API请求失败:', error)
    deptTree.value = []
  }
}

async function fetchRoles() {
  try {
    roleOptions.value = ((await getRoleList({ status: '0' })) as RoleData[]) || []
  } catch {
    roleOptions.value = []
  }
}

onMounted(() => {
  fetchData()
  fetchDeptTree()
  fetchRoles()
})
</script>

