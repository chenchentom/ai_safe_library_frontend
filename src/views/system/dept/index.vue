<template>
  <div class="page-container system-admin">
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
      class="system-admin-dialog"
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
            popper-class="system-admin-popper"
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
        <el-form-item label="部门角色">
          <el-select v-model="formData.roleIds" multiple collapse-tags popper-class="system-admin-popper" placeholder="该部门下用户默认继承的角色" style="width: 100%">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getDeptList, addDept, updateDept, deleteDept } from '@/api/dept'
import { getRoleList, type RoleData } from '@/api/role'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<any[]>([])
const deptTree = ref<any[]>([])
const roleOptions = ref<RoleData[]>([])

const formData = reactive({
  deptId: 0,
  parentId: undefined as number | undefined,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0',
  roleIds: [] as number[],
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
  formData.roleIds = []
  dialogVisible.value = true
}

function handleEdit(row: any) {
  Object.assign(formData, row, { roleIds: row.roleIds || [] })
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

async function fetchRoles() {
  try {
    roleOptions.value = ((await getRoleList({ status: '0' })) as RoleData[]) || []
  } catch {
    roleOptions.value = []
  }
}

onMounted(() => {
  fetchData()
  fetchRoles()
})
</script>

