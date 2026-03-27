<template>
  <div class="editor-container">
    <nav class="nav-menu">
      <router-link to="/drag" class="nav-link">拖拽编辑器</router-link>
    </nav>
    <h1>JSON Editor</h1>
    <div class="input-section">
      <label for="json-input">请输入 JSON 数据：</label>
      <textarea
        id="json-input"
        v-model="jsonInput"
        class="json-textarea"
        placeholder='{"name": "示例", "age": 18}'
        rows="10"
      ></textarea>
    </div>
    <div class="button-section">
      <button class="btn-primary" @click="handleSend">确定</button>
      <button class="btn-secondary" @click="handleClear">清空</button>
    </div>
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
    
    <!-- 调试信息 -->
    <div class="debug-info">
      <h3>调试信息</h3>
      <p>发送状态: {{ sendStatus }}</p>
      <p>当前时间: {{ currentTime }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const jsonInput = ref('')
const message = ref('')
const messageType = ref('')
const sendStatus = ref('等待发送')
const currentTime = ref('')

const SERVER_URL = 'http://localhost:3000'

let timer: number | null = null

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
  
  // 检查消息服务器是否可用
  fetch(`${SERVER_URL}/health`)
    .then(() => {
      sendStatus.value = '消息服务器已连接'
    })
    .catch(() => {
      sendStatus.value = '⚠️ 消息服务器未启动，请先运行: node message-server.js'
    })
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const handleSend = async () => {
  sendStatus.value = '开始发送...'
  
  if (!jsonInput.value.trim()) {
    message.value = '请输入 JSON 数据'
    messageType.value = 'error'
    sendStatus.value = '失败：输入为空'
    return
  }

  // 验证 JSON 格式
  let parsedData: unknown
  try {
    parsedData = JSON.parse(jsonInput.value)
  } catch (e) {
    message.value = 'JSON 格式错误，请检查输入'
    messageType.value = 'error'
    sendStatus.value = '失败：JSON 格式错误'
    return
  }

  const payload = {
    type: 'json-data',
    data: parsedData,
    timestamp: Date.now(),
  }

  // 通过 HTTP 发送到消息服务器
  try {
    const response = await fetch(`${SERVER_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      console.log('[Editor] HTTP 发送成功:', payload)
      sendStatus.value = '✅ 发送成功 - ' + currentTime.value
      message.value = '数据已发送到 myViewer'
      messageType.value = 'success'
    } else {
      throw new Error('服务器响应错误')
    }
  } catch (error) {
    console.error('[Editor] 发送失败:', error)
    sendStatus.value = '❌ 发送失败: ' + (error as Error).message
    message.value = '发送失败，请确保消息服务器已启动 (node message-server.js)'
    messageType.value = 'error'
  }
}

const handleClear = () => {
  jsonInput.value = ''
  message.value = ''
  sendStatus.value = '已清空'
}
</script>

<style scoped>
.editor-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.nav-menu {
  text-align: right;
  margin-bottom: 10px;
}

.nav-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.nav-link:hover {
  text-decoration: underline;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.input-section {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #555;
}

.json-textarea {
  width: 100%;
  min-height: 300px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
}

.json-textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.button-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

button {
  padding: 12px 30px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f44336;
  color: white;
}

.btn-secondary:hover {
  background-color: #da190b;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.debug-info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.debug-info h3 {
  margin-top: 0;
  color: #666;
}

.debug-info p {
  margin: 8px 0;
  font-family: monospace;
  font-size: 14px;
}
</style>
