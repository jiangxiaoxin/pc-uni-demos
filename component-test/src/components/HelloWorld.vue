<template>
  <div class="hello-world">
    <h1 class="title">{{ msg }}</h1>
    <p class="desc">
      这是一个示例组件，你可以在
      <code>src/components/</code>
      目录下添加自己的组件进行开发和测试。
    </p>
    <div class="actions">
      <button class="btn" @click="count++">点击次数: {{ count }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg: string
}>()

const count = ref(0)
</script>

<style scoped>
.hello-world {
  padding: 16px 0;
}

.title {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.desc code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.actions {
  margin-top: 12px;
}

.btn {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn:hover {
  background: #5568d3;
}
</style>
