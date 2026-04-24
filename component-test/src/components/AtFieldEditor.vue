<template>
  <div class="field-editor">
    <div class="editor-wrapper">
      <div
        ref="editorRef"
        class="editor"
        contenteditable="true"
        @beforeinput="handleBeforeInput"
        @input="handleInput"
        @keydown="handleKeydown"
        @paste="handlePaste"
      ></div>

      <!-- 字段选择器 -->
      <div
        v-if="showPicker"
        ref="pickerRef"
        class="field-picker"
        :style="pickerStyle"
      >
        <div class="picker-header">选择字段</div>
        <div class="picker-list">
          <div
            v-for="field in fieldList"
            :key="field.key"
            class="field-option"
            :class="{ active: focusedIndex === fieldList.indexOf(field) }"
            @mousedown.prevent="selectField(field)"
          >
            <!-- <span class="field-icon">@</span> -->
            <span class="field-label">{{ field.label }}</span>
            <span class="field-key">{{ field.key }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="save-btn" @click="handleSave">保存</button>
    </div>

    <div v-if="output" class="output-panel">
      <h4>输出结果</h4>
      <div class="output-section">
        <strong>Segments（结构化数据）:</strong>
        <pre>{{ JSON.stringify(output.segments, null, 2) }}</pre>
      </div>
      <div class="output-section">
        <strong>纯文本:</strong>
        <pre>{{ output.text }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

export interface FieldOption {
  key: string
  label: string
}

export interface Segment {
  type: 'text' | 'field'
  value: string
  label?: string
}

export interface EditorOutput {
  segments: Segment[]
  text: string
}

const props = withDefaults(defineProps<{
  fields?: FieldOption[]
}>(), {
  fields: () => [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年龄' },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'address', label: '地址' },
    { key: 'company', label: '公司' },
    { key: 'department', label: '部门' },
    { key: 'position', label: '职位' },
  ],
})

const emit = defineEmits<{
  save: [output: EditorOutput]
}>()

const editorRef = ref<HTMLDivElement>()
const showPicker = ref(false)
const pickerStyle = ref({ top: '0px', left: '0px' })
const focusedIndex = ref(0)

let justTypedAt = false
let isInsertingField = false

const fieldList = ref<FieldOption[]>(props.fields)
const output = ref<EditorOutput | null>(null)

onMounted(() => {
  // 确保编辑器初始可聚焦
  if (editorRef.value && editorRef.value.childNodes.length === 0) {
    editorRef.value.appendChild(document.createTextNode(''))
  }
  // 全局监听点击，点击编辑器/选择器外部时关闭选择器
  document.addEventListener('mousedown', handleDocumentMousedown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocumentMousedown)
})

// 点击文档其他区域关闭选择器
function handleDocumentMousedown(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (
    showPicker.value &&
    !target.closest('.field-picker') &&
    !target.closest('.editor')
  ) {
    showPicker.value = false
  }
}

// 监听 beforeinput 检测 @ 输入
function handleBeforeInput(e: InputEvent) {
  // console.log('before', e);
  
  if (e.data === '@') {
    justTypedAt = true
  }
}

// input 事件：处理 @ 后的选择器显示
function handleInput(e: InputEvent) {
  if (justTypedAt) {
    justTypedAt = false
    focusedIndex.value = 0
    showFieldPicker()
    return
  }

  // 如果是字段插入导致的 input，忽略
  if (isInsertingField) {
    return
  }

  // 选择器打开时，输入了其他字符（非 @ 非字段插入），关闭选择器
  if (showPicker.value) {
    showPicker.value = false
    return
  }

  // 清理孤立的零宽空格节点（没有内容的）
  cleanupEmptyNodes()
}

// 显示字段选择器并定位
function showFieldPicker() {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) {
    showPicker.value = false
    return
  }

  const range = sel.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  const editorRect = editorRef.value.getBoundingClientRect()

  pickerStyle.value = {
    top: `${rect.bottom - editorRect.top + 4}px`,
    left: `${rect.left - editorRect.left}px`,
  }
  showPicker.value = true
}

// 在编辑器中从后往前查找 @ 字符
function findLastAtChar(root: HTMLElement): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)
  const textNodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text)
  }

  for (let i = textNodes.length - 1; i >= 0; i--) {
    const text = textNodes[i].textContent || ''
    const idx = text.lastIndexOf('@')
    if (idx !== -1) {
      return { node: textNodes[i], offset: idx }
    }
  }
  return null
}

// 选择字段
function selectField(field: FieldOption) {
  isInsertingField = true

  if (!editorRef.value) {
    showPicker.value = false
    isInsertingField = false
    return
  }

  const sel = window.getSelection()
  if (!sel) {
    showPicker.value = false
    isInsertingField = false
    return
  }

  // 在编辑器 DOM 中查找最后输入的 @ 符号（不依赖 atRange，更可靠）
  const atInfo = findLastAtChar(editorRef.value)
  if (!atInfo) {
    showPicker.value = false
    isInsertingField = false
    return
  }

  // 删除 @ 符号
  const delRange = document.createRange()
  delRange.setStart(atInfo.node, atInfo.offset)
  delRange.setEnd(atInfo.node, atInfo.offset + 1)
  delRange.deleteContents()

  // 创建字段标签
  const span = document.createElement('span')
  span.className = 'field-tag'
  span.contentEditable = 'false'
  span.dataset.key = field.key
  span.textContent = `@${field.label}`

  // 在标签后插入零宽空格文本节点，方便继续输入
  const zwsp = document.createTextNode('\u200B')

  const frag = document.createDocumentFragment()
  frag.appendChild(span)
  frag.appendChild(zwsp)

  delRange.insertNode(frag)

  // 移动光标到零宽空格之后
  const newRange = document.createRange()
  newRange.setStartAfter(zwsp)
  newRange.collapse(true)
  sel.removeAllRanges()
  sel.addRange(newRange)

  showPicker.value = false
  focusedIndex.value = 0

  // 延迟重置标志，让 input 事件有机会跳过
  nextTick(() => {
    isInsertingField = false
    editorRef.value?.focus()
  })
}

// 处理键盘事件：整块删除 field-tag、选择器导航
function handleKeydown(e: KeyboardEvent) {
  // 选择器打开时的导航
  if (showPicker.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusedIndex.value = (focusedIndex.value + 1) % fieldList.value.length
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusedIndex.value = (focusedIndex.value - 1 + fieldList.value.length) % fieldList.value.length
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      selectField(fieldList.value[focusedIndex.value])
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      showPicker.value = false
      focusedIndex.value = 0
      return
    }
  }

  // Backspace 整块删除 field-tag
  if (e.key === 'Backspace') {
    const result = findFieldTagBeforeCursor()
    if (result) {
      e.preventDefault()
      deleteFieldTag(result.fieldTag, result.zwspNode)
      return
    }
  }

  // Delete 键整块删除后面的 field-tag
  if (e.key === 'Delete') {
    const result = findFieldTagAfterCursor()
    if (result) {
      e.preventDefault()
      deleteFieldTag(result.fieldTag, result.zwspNode)
      return
    }
  }
}

// 查找光标前的 field-tag
function findFieldTagBeforeCursor(): { fieldTag: HTMLElement; zwspNode?: Text } | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return null

  const range = sel.getRangeAt(0)
  if (!range.collapsed) return null

  const node = range.startContainer
  console.log("🚀 ~ AtFieldEditor.vue:322 ~ findFieldTagBeforeCursor ~ node:", node)

  const offset = range.startOffset

  console.log('offset', offset);
  

  if (node.nodeType !== Node.TEXT_NODE) return null

  const textNode = node as Text

  // 情况1：光标在文本节点开头 offset=0，前一个兄弟是 field-tag
  if (offset === 0) {
    console.log('00000000000');
    
    let prev = textNode.previousSibling
    // 如果前一个节点是零宽空格且再前一个是 field-tag，说明这是尾随的零宽空格
    if (prev && prev.nodeType === Node.TEXT_NODE && prev.textContent === '\u200B') {
      console.log('11111111111111111');
      
      const fieldTag = prev.previousSibling
      if (fieldTag && fieldTag.nodeType === Node.ELEMENT_NODE && (fieldTag as HTMLElement).classList.contains('field-tag')) {
        return { fieldTag: fieldTag as HTMLElement, zwspNode: prev as Text }
      }
    }
    // 如果前一个是 field-tag（后面没有零宽空格的情况）
    if (prev && prev.nodeType === Node.ELEMENT_NODE && (prev as HTMLElement).classList.contains('field-tag')) {
      console.log('22222222');
      
      return { fieldTag: prev as HTMLElement }
    }
  }

  // 情况2：光标在只含零宽空格的文本节点中 offset=1（即零宽空格后面）
  if (offset === 1 && textNode.textContent === '\u200B') {
    console.log('33333333');
    
    const prev = textNode.previousSibling
    if (prev && prev.nodeType === Node.ELEMENT_NODE && (prev as HTMLElement).classList.contains('field-tag')) {
      console.log('444444444S');
      
      return { fieldTag: prev as HTMLElement, zwspNode: textNode }
    }
  }

  return null
}

// 查找光标后的 field-tag
function findFieldTagAfterCursor(): { fieldTag: HTMLElement; zwspNode?: Text } | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return null

  const range = sel.getRangeAt(0)
  if (!range.collapsed) return null

  const node = range.startContainer
  const offset = range.startOffset

  if (node.nodeType !== Node.TEXT_NODE) return null

  const textNode = node as Text
  const text = textNode.textContent || ''

  // 情况1：光标在文本节点末尾，后一个兄弟是零宽空格，再后面是 field-tag
  if (offset === text.length) {
    let next = textNode.nextSibling
    if (next && next.nodeType === Node.TEXT_NODE && next.textContent === '\u200B') {
      const fieldTag = next.nextSibling
      if (fieldTag && fieldTag.nodeType === Node.ELEMENT_NODE && (fieldTag as HTMLElement).classList.contains('field-tag')) {
        return { fieldTag: fieldTag as HTMLElement, zwspNode: next as Text }
      }
    }
    // 如果后一个是 field-tag
    if (next && next.nodeType === Node.ELEMENT_NODE && (next as HTMLElement).classList.contains('field-tag')) {
      return { fieldTag: next as HTMLElement }
    }
  }

  // 情况2：光标在零宽空格文本节点中 offset=0
  if (offset === 0 && textNode.textContent === '\u200B') {
    const next = textNode.nextSibling
    if (next && next.nodeType === Node.ELEMENT_NODE && (next as HTMLElement).classList.contains('field-tag')) {
      return { fieldTag: next as HTMLElement, zwspNode: textNode }
    }
  }

  return null
}

// 删除 field-tag 及其关联的零宽空格节点
function deleteFieldTag(fieldTag: HTMLElement, zwspNode?: Text) {
  // 先记录删除位置的前一个节点，用于后续光标定位
  const prevNode = fieldTag.previousSibling

  fieldTag.remove()
  if (zwspNode) {
    zwspNode.remove()
  }

  // 清理残留的孤立零宽空格和空文本节点
  cleanupEmptyNodes()
  // 如果编辑器内容只剩空白，彻底清空以触发 :empty 伪类
  if (editorRef.value && isEditorEmpty(editorRef.value)) {
    editorRef.value.innerHTML = ''
  }

  // 重新定位光标：尽量留在删除位置（前一个节点的末尾），而不是编辑器开头
  const sel = window.getSelection()
  if (sel && editorRef.value) {
    const range = document.createRange()

    if (prevNode && prevNode.parentNode) {
      // 前一个节点还在，把光标放在它末尾
      if (prevNode.nodeType === Node.TEXT_NODE) {
        const text = prevNode.textContent || ''
        range.setStart(prevNode, text.length)
      } else {
        range.setStartAfter(prevNode)
      }
    } else if (editorRef.value.firstChild) {
      // 没有前一个节点，编辑器还有内容，定位到开头
      const first = editorRef.value.firstChild
      if (first.nodeType === Node.TEXT_NODE) {
        range.setStart(first, 0)
      } else {
        range.setStartBefore(first)
      }
    } else {
      // 编辑器完全为空
      range.setStart(editorRef.value, 0)
    }

    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  nextTick(() => editorRef.value?.focus())
}

// 判断编辑器是否实质为空（只剩零宽空格或空文本节点）
function isEditorEmpty(el: HTMLElement): boolean {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').replace(/\u200B/g, '')
      if (text.length > 0) return false
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if ((node as HTMLElement).classList.contains('field-tag')) return false
      if ((node as HTMLElement).textContent?.replace(/\u200B/g, '')) return false
    } else {
      return false
    }
  }
  return true
}

// 粘贴时过滤为纯文本
function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

// 清理孤立的零宽空格节点（field-tag 被删除后残留的）
function cleanupEmptyNodes() {
  if (!editorRef.value) return
  const walker = document.createTreeWalker(
    editorRef.value,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  )
  const nodesToRemove: Text[] = []
  let textNode: Text | null
  while ((textNode = walker.nextNode() as Text | null)) {
    const text = textNode.textContent || ''
    // 只处理纯零宽空格的文本节点
    if (!/^\u200B+$/.test(text)) continue

    const prev = textNode.previousSibling
    // 如果前一个兄弟不是 field-tag，说明是孤立的零宽空格，需要清理
    const isAfterFieldTag =
      prev &&
      prev.nodeType === Node.ELEMENT_NODE &&
      (prev as HTMLElement).classList.contains('field-tag')
    if (!isAfterFieldTag) {
      nodesToRemove.push(textNode)
    }
  }
  nodesToRemove.forEach((n) => n.remove())
}

// 保存：解析编辑器内容为结构化数据
function handleSave() {
  if (!editorRef.value) return

  const segments: Segment[] = []
  let currentText = ''

  function flushText() {
    // 去除零宽空格
    const cleaned = currentText.replace(/\u200B/g, '')
    if (cleaned) {
      segments.push({ type: 'text', value: cleaned })
    }
    currentText = ''
  }

  editorRef.value.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      currentText += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.classList.contains('field-tag')) {
        flushText()
        const key = el.dataset.key || ''
        const label = el.textContent?.replace(/^@/, '') || key
        segments.push({ type: 'field', value: key, label })
      } else {
        currentText += el.textContent || ''
      }
    }
  })

  flushText()

  const text = segments.map(s => {
    if (s.type === 'text') return s.value
    return `@${s.value}`
  }).join('')

  output.value = { segments, text }
  emit('save', output.value)
}
</script>

<style scoped>
.field-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-wrapper {
  position: relative;
}

.editor {
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 18px;
  line-height: 1.6;
  color: #303133;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  white-space: pre-wrap;
  word-break: break-word;
  caret-color: #ff4d4f;
}

.editor:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.25);
}

.editor:empty::before {
  content: '输入 @ 调起字段选择器...';
  color: #c0c4cc;
  pointer-events: none;
}

/* 深度选择器：影响编辑器内部的 field-tag */
:deep(.field-tag) {
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: default;
  user-select: none;
  vertical-align: middle;
  line-height: 1.4;
}

.field-picker {
  position: absolute;
  z-index: 100;
  min-width: 180px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.picker-header {
  padding: 10px 14px;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.picker-list {
  max-height: 220px;
  overflow-y: auto;
}

.field-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.field-option:hover,
.field-option.active {
  background: #f0f4ff;
}

.field-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
}

.field-label {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.field-key {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  padding: 10px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.output-panel {
  background: #f9fafc;
  border-radius: 8px;
  padding: 16px;
}

.output-panel h4 {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.output-section {
  margin-bottom: 12px;
}

.output-section:last-child {
  margin-bottom: 0;
}

.output-section strong {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.output-section pre {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #303133;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
