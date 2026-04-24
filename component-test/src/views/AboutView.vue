<template>
  <div class="about-view">
    <h2>关于</h2>
    <div class="info-card">
      <h3>Vue Component Test 项目</h3>
      <p>这是一个用于开发和测试 Vue 3 组件的独立子项目。</p>
      <ul>
        <li><strong>框架：</strong>Vue 3 + Composition API</li>
        <li><strong>语言：</strong>TypeScript</li>
        <li><strong>构建工具：</strong>Vite</li>
        <li><strong>测试：</strong>Vitest + @vue/test-utils</li>
        <li><strong>路由：</strong>Vue Router 4</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  padding: 16px 0;
}

.about-view h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.info-card {
  background: #f9fafc;
  border-radius: 8px;
  padding: 24px;
}

.info-card h3 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #667eea;
}

.info-card p {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 8px 0;
  color: #444;
  border-bottom: 1px solid #eee;
}

.info-card li:last-child {
  border-bottom: none;
}

.info-card strong {
  color: #333;
  display: inline-block;
  width: 100px;
}
</style>
