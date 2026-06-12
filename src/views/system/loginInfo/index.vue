<template>
  <div class="page-container system-admin">
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.userName" placeholder="登录账号" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable popper-class="system-admin-popper" style="width: 100px">
            <el-option label="成功" value="0" />
            <el-option label="失败" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD HH:mm:ss"
            popper-class="system-admin-popper"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-loading="loading" class="table-container">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="infoId" label="编号" width="80" align="center" />
        <el-table-column prop="userName" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="ipaddr" label="IP" width="140" show-overflow-tooltip />
        <el-table-column prop="browser" label="浏览器" width="100" />
        <el-table-column prop="os" label="操作系统" width="100" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small" effect="plain">
              {{ row.status === '0' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="提示消息" min-width="160" show-overflow-tooltip />
        <el-table-column prop="loginTime" label="登录时间" width="170" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onDeactivated, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getLoginInfoList, type LoginInfoItem } from '@/api/loginInfo'
import { resetPageLoading } from '@/utils/cleanupOverlays'

const loading = ref(false)
const tableData = ref<LoginInfoItem[]>([])

const searchForm = reactive({
  userName: '',
  status: '',
  dateRange: [] as string[],
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getLoginInfoList({
      userName: searchForm.userName || undefined,
      status: searchForm.status || undefined,
      beginTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1],
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    })
    tableData.value = res?.rows || []
    pagination.total = res?.total || 0
  } catch {
    tableData.value = []
    pagination.total = 0
    ElMessage.error('登录日志加载失败')
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
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.pageNum = 1
  fetchData()
}

onMounted(fetchData)
onDeactivated(() => resetPageLoading(loading))
onBeforeUnmount(() => resetPageLoading(loading))
</script>
