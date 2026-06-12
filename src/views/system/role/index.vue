<template>
  <div class="page-container system-admin">
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="状态" clearable popper-class="system-admin-popper" style="width: 120px">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchData">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="roleId" label="ID" width="70" align="center" />
        <el-table-column prop="roleName" label="角色名称" min-width="140" />
        <el-table-column prop="roleKey" label="权限字符" min-width="120" />
        <el-table-column prop="roleSort" label="排序" width="80" align="center" />
        <el-table-column prop="dataScope" label="数据范围" width="120" align="center">
          <template #default="{ row }">{{ dataScopeLabel(row.dataScope) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small" effect="plain">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="640px"
      class="system-admin-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="如：业务操作员" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="formData.roleKey" placeholder="如：business（英文唯一标识）" :disabled="!!formData.roleId" />
        </el-form-item>
        <el-form-item label="排序" prop="roleSort">
          <el-input-number v-model="formData.roleSort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="数据范围">
          <el-select v-model="formData.dataScope" popper-class="system-admin-popper" style="width: 100%">
            <el-option v-for="opt in dataScopeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            class="system-admin-menu-tree"
            :data="menuTree"
            node-key="menuId"
            show-checkbox
            default-expand-all
            :props="{ label: 'menuName', children: 'children' }"
          />
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { openDialogVisible } from '@/utils/cleanupOverlays'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getRoleList, getRole, addRole, updateRole, deleteRole, type RoleData } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import type { MenuItem } from '@/types/menu'
import type { ElTree } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const menuTreeRef = ref<InstanceType<typeof ElTree>>()
const tableData = ref<RoleData[]>([])
const menuTree = ref<MenuItem[]>([])

const searchForm = reactive({ roleName: '', status: '' })

const formData = reactive<RoleData>({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  dataScope: '5',
  status: '0',
  remark: '',
})

const formRules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入权限字符', trigger: 'blur' }],
}

const dataScopeOptions = [
  { value: '1', label: '全部数据' },
  { value: '2', label: '自定义' },
  { value: '3', label: '本部门' },
  { value: '4', label: '本部门及以下' },
  { value: '5', label: '仅本人' },
]

const dialogTitle = computed(() => (formData.roleId ? '编辑角色' : '新增角色'))

function dataScopeLabel(v?: string) {
  return dataScopeOptions.find((o) => o.value === v)?.label || v || '—'
}

async function fetchMenus() {
  menuTree.value = (await getMenuTree()) || []
}

async function fetchData() {
  loading.value = true
  try {
    tableData.value = (await getRoleList({
      roleName: searchForm.roleName || undefined,
      status: searchForm.status || undefined,
    })) as RoleData[]
  } finally {
    loading.value = false
  }
}

function handleReset() {
  searchForm.roleName = ''
  searchForm.status = ''
  fetchData()
}

function handleAdd() {
  Object.assign(formData, {
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    dataScope: '5',
    status: '0',
    remark: '',
  })
  openDialogVisible(dialogVisible)
  nextTick(() => menuTreeRef.value?.setCheckedKeys([]))
}

async function handleEdit(row: RoleData) {
  const detail = await getRole(row.roleId!)
  Object.assign(formData, {
    roleId: detail.roleId,
    roleName: detail.roleName,
    roleKey: detail.roleKey,
    roleSort: detail.roleSort,
    dataScope: detail.dataScope,
    status: detail.status,
    remark: detail.remark,
  })
  openDialogVisible(dialogVisible)
  await nextTick()
  menuTreeRef.value?.setCheckedKeys(detail.menuIds || [])
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const checked = menuTreeRef.value?.getCheckedKeys(false) as number[]
      const half = menuTreeRef.value?.getHalfCheckedKeys() as number[]
      const menuIds = [...new Set([...checked, ...half])]
      const payload = { ...formData, menuIds }
      if (formData.roleId) {
        await updateRole(payload)
        ElMessage.success('修改成功')
      } else {
        await addRole(payload)
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

async function handleDelete(row: RoleData) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.roleName}」？`, '删除确认', { type: 'warning' })
    await deleteRole(row.roleId!)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchMenus()
  fetchData()
})
</script>

