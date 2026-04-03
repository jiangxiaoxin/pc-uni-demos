<template>
  <div class="json-to-xml-view">
    <h1>JSON 转 XML 转换器</h1>
    
    <div class="converter-container">
      <!-- 左侧：JSON 输入区 -->
      <div class="input-section">
        <div class="section-header">
          <span class="section-title">JSON 配置</span>
          <button class="format-btn" @click="formatJson">格式化</button>
        </div>
        <textarea
          v-model="jsonInput"
          class="json-textarea"
          placeholder="请输入 JSON 结构配置..."
          spellcheck="false"
        ></textarea>
      </div>

      <!-- 中间：转换按钮 -->
      <div class="action-section">
        <button class="convert-btn" @click="convertToXml">
          <span class="arrow">→</span>
          <span class="btn-text">转换</span>
        </button>
      </div>

      <!-- 右侧：XML 输出区 -->
      <div class="output-section">
        <div class="section-header">
          <span class="section-title">XML 配置</span>
          <button 
            class="copy-btn" 
            @click="copyToClipboard"
            :class="{ 'copied': copied }"
          >
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        <textarea
          v-model="xmlOutput"
          class="xml-textarea"
          placeholder="转换后的 XML 将显示在这里..."
          readonly
          spellcheck="false"
        ></textarea>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="error-message">
      {{ errorMsg }}
    </div>

    <!-- 导航链接 -->
    <div class="nav-links">
      <router-link to="/">流程编辑器</router-link>
      <router-link to="/view">流程查看器</router-link>
      <router-link to="/xml">XML 解析</router-link>
      <router-link to="/json-to-xml" class="active">JSON 转 XML</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { json2xml, type ParseResult } from '../utils/xmlutils'

const jsonInput = ref<string>('')
const xmlOutput = ref<string>('')
const errorMsg = ref<string>('')
const copied = ref<boolean>(false)

// 格式化 JSON
function formatJson() {
  try {
    if (!jsonInput.value.trim()) {
      errorMsg.value = '请输入 JSON 内容'
      return
    }
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
    errorMsg.value = ''
  } catch (error) {
    errorMsg.value = 'JSON 格式错误，无法格式化'
  }
}

// 转换为 XML
function convertToXml() {
  try {
    errorMsg.value = ''
    
    if (!jsonInput.value.trim()) {
      errorMsg.value = '请输入 JSON 内容'
      return
    }

    // 解析 JSON
    const jsonData: ParseResult = JSON.parse(jsonInput.value)
    
    // 验证必要字段
    if (!jsonData.definitions || !jsonData.process) {
      errorMsg.value = 'JSON 结构不正确，缺少 definitions 或 process 字段'
      return
    }

    // 转换为 XML
    xmlOutput.value = json2xml(jsonData)
  } catch (error) {
    if (error instanceof SyntaxError) {
      errorMsg.value = 'JSON 解析错误：' + error.message
    } else {
      errorMsg.value = '转换失败：' + (error as Error).message
    }
  }
}

// 复制到剪贴板
async function copyToClipboard() {
  if (!xmlOutput.value) {
    errorMsg.value = '没有可复制的 XML 内容'
    return
  }

  try {
    await navigator.clipboard.writeText(xmlOutput.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = xmlOutput.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.json-to-xml-view {
  padding: 20px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.converter-container {
  display: flex;
  gap: 20px;
  align-items: stretch;
  min-height: 500px;
}

/* 左右输入输出区域 */
.input-section,
.output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.section-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.format-btn,
.copy-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.format-btn:hover {
  background: #bbdefb;
}

.copy-btn {
  background: #667eea;
  color: #fff;
}

.copy-btn:hover {
  background: #5a6fd6;
}

.copy-btn.copied {
  background: #4caf50;
}

.json-textarea,
.xml-textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  outline: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  background: #fafafa;
  color: #333;
}

.json-textarea {
  background: #fff;
}

.xml-textarea {
  background: #f5f7fa;
  color: #2d3748;
}

.json-textarea::placeholder,
.xml-textarea::placeholder {
  color: #999;
}

/* 中间转换按钮区域 */
.action-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.convert-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  min-width: 80px;
}

.convert-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.convert-btn:active {
  transform: translateY(0);
}

.arrow {
  font-size: 24px;
  margin-bottom: 4px;
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
}

/* 错误提示 */
.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

/* 导航链接 */
.nav-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e8e8e8;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
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

/* 响应式 */
@media (max-width: 768px) {
  .converter-container {
    flex-direction: column;
    min-height: auto;
  }

  .action-section {
    padding: 10px 0;
  }

  .convert-btn {
    flex-direction: row;
    padding: 12px 32px;
  }

  .arrow {
    margin-bottom: 0;
    margin-right: 8px;
  }

  .json-textarea,
  .xml-textarea {
    min-height: 200px;
  }
}
</style>
