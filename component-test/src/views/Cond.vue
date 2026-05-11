<template>
  <div class="cond-view">
    <header class="header">
      <h1>条件编辑器</h1>
      <p class="subtitle">支持 AND/OR 切换、条件组无限嵌套</p>
    </header>

    <div class="layout">
      <section class="editor-panel">
        <div class="panel-header">
          <div class="panel-title">条件配置</div>
          <button class="check-btn" type="button" @click="runCheck">检测</button>
        </div>

        <div
          v-if="checkResult"
          class="check-result"
          :class="checkResult.ok ? 'check-ok' : 'check-err'"
        >
          <template v-if="checkResult.ok">
            <span class="check-icon">✓</span>
            <span>校验通过：所有条件组都包含子项</span>
          </template>
          <template v-else>
            <div class="check-title">
              <span class="check-icon">✗</span>
              <span>校验失败（{{ checkResult.errors.length }} 处空条件组）</span>
            </div>
            <ul class="check-list">
              <li v-for="(err, i) in checkResult.errors" :key="i">{{ err }}</li>
            </ul>
          </template>
        </div>

        <CondGroup v-model="root" :fields="fields" is-root />
      </section>

      <section class="output-panel">
        <div class="output-header">
          <span class="panel-title">输出 JSON</span>
          <button class="copy-btn" type="button" @click="copyJson">
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        <pre class="json-preview">{{ jsonText }}</pre>

        <div class="output-header" style="margin-top: 16px">
          <span class="panel-title">可读表达式</span>
        </div>
        <pre class="json-preview readable">{{ readableText }}</pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// import CondGroup from '../components/cond/CondGroup.vue'
import CondGroup from '@/components/cond2/CondGroup.vue'
import type { CondNode, ConditionGroup, FieldOption } from '../components/cond/types'
import { OPERATORS_BY_TYPE, createCondition, createGroup } from '../components/cond/types'

const fields: FieldOption[] = [
  { key: 'name', label: '姓名', type: 'string' },
  { key: 'age', label: '年龄', type: 'number' },
  { key: 'birthday', label: '生日', type: 'date' },
  { key: 'isVip', label: 'VIP', type: 'boolean' },
  {
    key: 'level',
    label: '等级',
    type: 'enum',
    enumOptions: [
      { value: 'L1', label: '初级' },
      { value: 'L2', label: '中级' },
      { value: 'L3', label: '高级' },
    ],
  },
  { key: 'city', label: '城市', type: 'string' },
]

// 初始示例：(age > 18 AND city contains "上海") OR (level = L3)
const root = ref<ConditionGroup>(
  createGroup('or', [
    createGroup('and', [
      { ...createCondition(fields[1]), operator: 'gt', value: 18 },
      { ...createCondition(fields[5]), operator: 'contains', value: '上海' },
    ]),
    { ...createCondition(fields[4]), operator: 'eq', value: 'L3' },
  ]),
)

const jsonText = computed(() => JSON.stringify(root.value, null, 2))

// 校验：所有 group 的 children 必须非空
type CheckResult = { ok: true } | { ok: false; errors: string[] }
const checkResult = ref<CheckResult | null>(null)

function collectEmptyGroups(node: CondNode, path: string, out: string[]) {
  if (node.type !== 'group') return
  if (node.children.length === 0) {
    out.push(`${path} 不能为空，至少需要一个条件或子组`)
  }
  node.children.forEach((child, idx) => {
    if (child.type === 'group') {
      collectEmptyGroups(child, `${path} > 第 ${idx + 1} 个子组`, out)
    }
  })
}

function runCheck() {
  const errors: string[] = []
  collectEmptyGroups(root.value, '根组', errors)
  checkResult.value = errors.length === 0 ? { ok: true } : { ok: false, errors }
}

// 树变化后清掉旧结果，避免显示过时校验
watch(root, () => { checkResult.value = null }, { deep: true })

const copied = ref(false)
async function copyJson() {
  try {
    await navigator.clipboard.writeText(jsonText.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    // 忽略复制失败
  }
}

// 把条件树渲染成人可读的表达式，调试很方便
const readableText = computed(() => nodeToString(root.value))

function nodeToString(node: CondNode): string {
  if (node.type === 'group') {
    if (node.children.length === 0) return '(空)'
    const sep = node.logic === 'and' ? ' AND ' : ' OR '
    const inner = node.children.map(nodeToString).join(sep)
    return node.children.length > 1 ? `(${inner})` : inner
  }
  const field = fields.find(f => f.key === node.field)
  const op = OPERATORS_BY_TYPE[field?.type ?? 'string'].find(o => o.value === node.operator)
  const fieldLabel = field?.label ?? node.field
  const opLabel = op?.label ?? node.operator
  if (op?.noValue) return `${fieldLabel} ${opLabel}`
  const v = field?.type === 'enum'
    ? field.enumOptions?.find(o => o.value === node.value)?.label ?? node.value
    : node.value
  return `${fieldLabel} ${opLabel} ${JSON.stringify(v)}`
}
</script>

<style scoped>
.cond-view {
  min-height: 100vh;
  padding: 32px 40px;
  background: linear-gradient(135deg, #f5f7ff 0%, #faf5ff 100%);
}

.header {
  margin-bottom: 24px;
}

.header h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.editor-panel,
.output-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.04);
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 14px;
  letter-spacing: 0.3px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-header .panel-title {
  margin-bottom: 0;
}

.check-btn {
  height: 28px;
  padding: 0 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
}

.check-btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.check-btn:active {
  transform: translateY(0);
}

.check-result {
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.check-result.check-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.check-result.check-err {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.check-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.check-icon {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.check-list {
  margin: 8px 0 2px;
  padding-left: 28px;
}

.check-list li {
  line-height: 1.7;
  font-size: 12.5px;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.output-header .panel-title {
  margin-bottom: 0;
}

.copy-btn {
  height: 24px;
  padding: 0 10px;
  background: #f0f4ff;
  color: #667eea;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: #667eea;
  color: #fff;
}

.json-preview {
  margin: 12px 0 0;
  padding: 12px 14px;
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  max-height: 360px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.json-preview.readable {
  background: #f7f9fc;
  color: #303133;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  border: 1px solid #e4e7ed;
}
</style>
