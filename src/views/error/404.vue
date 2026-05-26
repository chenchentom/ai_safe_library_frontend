<template>
  <div class="error-page">
    <h1>404</h1>
    <p>页面未找到</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
// 404 错误页
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  h1 {
    font-size: 72px;
    color: var(--color-text-secondary);
  }
  p {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    margin: 16px 0 24px;
  }
}
</style>
