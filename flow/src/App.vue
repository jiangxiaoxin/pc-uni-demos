<template>
  <div id="app">
    <!-- <ConfigProvider :locale="zhCN">
      <router-view />
    </ConfigProvider> -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
  // import { ConfigProvider } from "ant-design-vue";
  // import zhCN from "ant-design-vue/locale/zh_CN";
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.app-nav {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-brand {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-links a:hover {
  color: #667eea;
  background: #f0f2ff;
}

.nav-links a.active {
  color: #667eea;
  background: #e8ebff;
  font-weight: 500;
}

.app-content {
  flex: 1;
  overflow: auto;
}
</style>
