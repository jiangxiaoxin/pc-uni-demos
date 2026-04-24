<template>
  <div class="field-editor-view">
    <h2>@字段编辑器<span>在span之间</span>普通的文本</h2>
    <p class="desc">
      在编辑器中输入 <code>@</code> 符号调起字段选择器，选择字段后插入带颜色的标签。
      <br />
      删除时字段标签会整块删除，点击保存输出结构化数据。
    </p>

    <div class="demo-card">
      <h3>基础用法</h3>
      <AtFieldEditor @save="onSave" />
    </div>

    <div class="demo-card">
      <h3>自定义字段列表</h3>
      <AtFieldEditor
        :fields="customFields"
        @save="onCustomSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AtFieldEditor from '../components/AtFieldEditor.vue'
import type { EditorOutput, FieldOption } from '../components/AtFieldEditor.vue'

const customFields: FieldOption[] = [
  { key: 'orderNo', label: '订单号' },
  { key: 'customer', label: '客户名称' },
  { key: 'amount', label: '订单金额' },
  { key: 'date', label: '下单日期' },
  { key: 'status', label: '订单状态' },
]

function onSave(output: EditorOutput) {
  console.log('默认字段保存:', output)
}

function onCustomSave(output: EditorOutput) {
  console.log('自定义字段保存:', output)
}
</script>

<style scoped>
.field-editor-view {
  padding: 16px 0;
}

.field-editor-view h2 {
  font-size: 22px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.desc {
  color: #666;
  line-height: 1.8;
  margin-bottom: 24px;
}

.desc code {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #667eea;
  font-weight: 500;
}

.demo-card {
  background: #f9fafc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.demo-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #555;
}
</style>
