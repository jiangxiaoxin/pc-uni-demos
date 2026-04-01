<template>
  <div class="xml-parser-view">
    <h1>BPMN XML 解析器</h1>
    <div class="actions">
      <button class="parse-btn" @click="parseXmlFile">解析 XML 文件</button>
      <button class="generate-btn" @click="generateXmlFile">生成 XML 文件</button>
    </div>

    <!-- 弹框显示解析结果 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>XML 解析结果</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <pre v-if="parseResult && !generatedXml">{{ formattedResult }}</pre>
          <pre v-else-if="generatedXml" class="xml-content">{{ generatedXml }}</pre>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeModal">确定</button>
        </div>
      </div>
    </div>

    <!-- 导航链接 -->
    <div class="nav-links">
      <router-link to="/">流程编辑器</router-link>
      <router-link to="/view">流程查看器</router-link>
      <router-link to="/xml" class="active">XML 解析</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { json2xml, createExampleData, createThreeApprovalProcess, type ParseResult } from '../utils/xmlutils'

interface ParsedNode {
  id: string
  type: string
  name?: string
  sourceRef?: string
  targetRef?: string
  assignee?: string
  formKey?: string
  outgoing?: string[]
  incoming?: string[]
  operations?: Array<{
    id: string
    label: string
    type: string
  }>
  copyItems?: string[]
}

interface ParsedProcess {
  id: string
  name: string
  isExecutable: boolean
  nodes: ParsedNode[]
  flows: ParsedNode[]
}

// 使用从 xmlutils 导入的类型

const showModal = ref(false)
const parseResult = ref<ParseResult | null>(null)
const generatedXml = ref('')

const formattedResult = computed(() => {
  if (!parseResult.value) return ''
  return JSON.stringify(parseResult.value, null, 2)
})

const formattedXml = computed(() => {
  if (!generatedXml.value) return ''
  return generatedXml.value
})

// 解析 XML 文件
async function parseXmlFile() {
  try {
    // 使用动态导入获取 XML 文件内容
    const xmlContent = await import('../demo.xml?raw').then(m => m.default)
    
    // 使用 DOMParser 解析 XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
    
    // 解析数据
    const result = parseBpmnXml(xmlDoc)
    parseResult.value = result
    
    // 控制台输出
    console.log('XML 解析结果:', result)
    console.log('流程信息:', result.process)
    console.log('节点列表:', result.process.nodes)
    console.log('连线列表:', result.process.flows)
    
    // 显示弹框
    showModal.value = true
  } catch (error) {
    console.error('解析 XML 失败:', error)
    alert('解析 XML 失败，请查看控制台')
  }
}

// 解析 BPMN XML
function parseBpmnXml(xmlDoc: Document): ParseResult {
  console.log("🚀 ~ XmlParserView.vue:122 ~ parseBpmnXml ~ xmlDoc:", xmlDoc)

  const definitions = xmlDoc.documentElement
  console.log("🚀 ~ XmlParserView.vue:125 ~ parseBpmnXml ~ definitions:", definitions)


  
  // 解析 definitions 属性
  const definitionsData = {
    id: definitions.getAttribute('id') || '',
    targetNamespace: definitions.getAttribute('targetNamespace') || ''
  }
  
  // 解析 process
  const processElement = definitions.querySelector('process')
  const process: ParsedProcess = {
    id: processElement?.getAttribute('id') || '',
    name: processElement?.getAttribute('name') || '',
    isExecutable: processElement?.getAttribute('isExecutable') === 'true',
    nodes: [],
    flows: []
  }
  
  if (processElement) {
    // 解析开始事件
    const startEvents = processElement.querySelectorAll('startEvent')
    startEvents.forEach(el => {
      process.nodes.push({
        id: el.getAttribute('id') || '',
        type: 'startEvent',
        name: el.getAttribute('name') || '',
        outgoing: Array.from(el.querySelectorAll('outgoing')).map(o => o.textContent || '')
      })
    })
    
    // 解析用户任务
    const userTasks = processElement.querySelectorAll('userTask')
    userTasks.forEach(el => {
      const node: ParsedNode = {
        id: el.getAttribute('id') || '',
        type: 'userTask',
        name: el.getAttribute('name') || '',
        assignee: el.getAttributeNS('http://flowable.org/bpmn', 'assignee') || '',
        formKey: el.getAttributeNS('http://flowable.org/bpmn', 'formKey') || '',
        incoming: Array.from(el.querySelectorAll('incoming')).map(i => i.textContent || ''),
        outgoing: Array.from(el.querySelectorAll('outgoing')).map(o => o.textContent || '')
      }
      
      // 解析操作列表
      const operationList = el.querySelector('operationList')
      if (operationList) {
        node.operations = Array.from(operationList.querySelectorAll('formOperation')).map(op => ({
          id: op.getAttribute('id') || '',
          label: op.getAttribute('label') || '',
          type: op.getAttribute('type') || ''
        }))
      }
      
      // 解析抄送列表
      const copyItemList = el.querySelector('copyItemList')
      if (copyItemList) {
        node.copyItems = Array.from(copyItemList.querySelectorAll('copyItem')).map(item => 
          item.getAttribute('id') || ''
        ).filter(Boolean)
      }
      
      process.nodes.push(node)
    })
    
    // 解析中间抛出事件
    const intermediateEvents = processElement.querySelectorAll('intermediateThrowEvent')
    intermediateEvents.forEach(el => {
      process.nodes.push({
        id: el.getAttribute('id') || '',
        type: 'intermediateThrowEvent',
        name: el.getAttribute('name') || '',
        incoming: Array.from(el.querySelectorAll('incoming')).map(i => i.textContent || '')
      })
    })
    
    // 解析顺序流（连线）
    const sequenceFlows = processElement.querySelectorAll('sequenceFlow')
    sequenceFlows.forEach(el => {
      process.flows.push({
        id: el.getAttribute('id') || '',
        type: 'sequenceFlow',
        sourceRef: el.getAttribute('sourceRef') || '',
        targetRef: el.getAttribute('targetRef') || ''
      })
    })
  }
  
  // 解析图表信息（DI）
  const diagramElement = definitions.querySelector('BPMNDiagram')
  let diagram = undefined
  
  if (diagramElement) {
    const planeElement = diagramElement.querySelector('BPMNPlane')
    diagram = {
      id: diagramElement.getAttribute('id') || '',
      planeId: planeElement?.getAttribute('id') || '',
      shapes: [],
      edges: []
    }
    
    // 解析形状
    const shapes = diagramElement.querySelectorAll('BPMNShape')
    shapes.forEach(el => {
      const bounds = el.querySelector('Bounds')
      const shape: any = {
        id: el.getAttribute('id') || '',
        bpmnElement: el.getAttribute('bpmnElement') || ''
      }
      if (bounds) {
        shape.bounds = {
          x: parseFloat(bounds.getAttribute('x') || '0'),
          y: parseFloat(bounds.getAttribute('y') || '0'),
          width: parseFloat(bounds.getAttribute('width') || '0'),
          height: parseFloat(bounds.getAttribute('height') || '0')
        }
      }
      diagram?.shapes.push(shape)
    })
    
    // 解析边
    const edges = diagramElement.querySelectorAll('BPMNEdge')
    edges.forEach(el => {
      const waypoints = Array.from(el.querySelectorAll('waypoint')).map(wp => ({
        x: parseFloat(wp.getAttribute('x') || '0'),
        y: parseFloat(wp.getAttribute('y') || '0')
      }))
      diagram?.edges.push({
        id: el.getAttribute('id') || '',
        bpmnElement: el.getAttribute('bpmnElement') || '',
        waypoints
      })
    })
  }
  
  return {
    definitions: definitionsData,
    process,
    diagram
  }
}

function closeModal() {
  showModal.value = false
  // 重置 generatedXml，以便下次显示正确的标题
  setTimeout(() => {
    generatedXml.value = ''
  }, 300)
}

// 生成 XML 文件
function generateXmlFile() {
  // 创建3个审批节点的流程数据
  const data = createThreeApprovalProcess()
  const xml = json2xml(data)
  generatedXml.value = xml
  parseResult.value = data
  
  // 控制台输出
  console.log('生成的 3 审批节点流程 XML:')
  console.log(xml)
  console.log('流程数据:', data)
  
  // 显示弹框
  showModal.value = true
}
</script>

<style scoped>
.xml-parser-view {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}



.parse-btn {
  padding: 12px 32px;
  font-size: 16px;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.parse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.parse-btn:active {
  transform: translateY(0);
}

/* 弹框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px 24px;
  overflow: auto;
  flex: 1;
}

.modal-body pre {
  margin: 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-body pre.xml-content {
  background: #f0f4f8;
  color: #2d3748;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 24px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: #5a6fd6;
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
</style>
