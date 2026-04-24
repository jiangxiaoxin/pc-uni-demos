<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Vue 组件测试环境</h1>
      <nav class="nav">
        <RouterLink to="/" exact-active-class="active">首页</RouterLink>
        <RouterLink to="/demo" exact-active-class="active">组件演示</RouterLink>
        <RouterLink to="/editor" exact-active-class="active">字段编辑器</RouterLink>
        <RouterLink to="/about" exact-active-class="active">关于</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-container {
  max-width: 900px;
  margin: 0 auto;
}

.app-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav a {
  padding: 8px 20px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav a.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 500;
}

.app-main {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 400px;
}
</style>
