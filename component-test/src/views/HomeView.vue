<template>
  <div class="home-view">
    <h2>首页</h2>
    <p>这是 Vue Router 示例首页，项目已启用路由功能。</p>
    <div class="card">
      <HelloWorld msg="Vue Router 已启用" />
    </div>
    <BasicMsg msg="直接放一个"/>
    <drawH />
  </div>
</template>

<script setup lang="ts">
import HelloWorld from '../components/HelloWorld.vue'
import BasicMsg from '@/components/BasicMsg.vue';
import { h } from 'vue'



const drawH = () => {
  const comp = h(BasicMsg, { msg: '我自己造一个' })
  console.log("🚀 ~ HomeView.vue:22 ~ drawH ~ comp:", comp)

  return comp
}

</script>

<style scoped>
.home-view {
  padding: 16px 0;
}

.home-view h2 {
  font-size: 22px;
  margin-bottom: 12px;
  color: #2c3e50;
}

.home-view p {
  color: #666;
  margin-bottom: 20px;
}

.card {
  background: #f9fafc;
  border-radius: 8px;
  padding: 20px;
}
</style>
