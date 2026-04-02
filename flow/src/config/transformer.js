import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import source from "./peizhi.json" with { type: "json" }

const BPMN_TYPE = Object.freeze({
  "start-node": "startEvent",
  "end-node": "endEvent",
  "my-logic-node": "userTask",
  "copy-node": "serviceTask",
})

const DEFAULT_NODE_WIDTH = 100
const DEFAULT_NODE_HEIGHT = 80
const DEFAULT_EVENT_SIZE = 36
const DEFAULT_FORM_KEY = JSON.stringify({
  routerName: "jyxtestform",
  formAuth: {},
  readOnly: true,
  groupType: "ASSIGNEE",
})
const EXTRA_FLOW_GAP_X = 120
const EXTRA_FLOW_GAP_Y = 70

// 将动态内容写入 XML 之前先做转义，避免属性和值把 XML 结构破坏掉。
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// 统一断言入口，转换过程一旦发现结构不满足预期就立即中断，
// 避免生成“看起来像成功、实际上无法被流程引擎正确识别”的 BPMN。
function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

// 将编辑器里的节点类型映射为 BPMN 标准节点类型。
// 当前只支持本项目里已经约定好的几种节点；如果后续前端新增节点类型，
// 这里没有同步扩展，就会直接报错而不是静默导出错误结构。
function resolveBpmnType(nodeType) {
  const bpmnType = BPMN_TYPE[nodeType]
  assert(bpmnType, `不支持的节点类型: ${nodeType}`)
  return bpmnType
}

function isEventType(bpmnType) {
  return bpmnType === "startEvent" || bpmnType === "endEvent"
}

// Flowable / BPMN id 中尽量避免使用 "-"，统一替换成 "_"。
function edgeId(id) {
  return `Flow_${String(id).replace(/-/g, "_")}`
}

// 自动补边时没有原始 edge 可复用，这里按“节点 + 操作类型 + 操作 id”生成稳定 id。
function derivedFlowId(nodeId, operationType, operationId) {
  return edgeId(`${nodeId}_${operationType}_${operationId}`)
}

function nodeId(node) {
  const bpmnType = resolveBpmnType(node.type)
  return isEventType(bpmnType) ? `Event_${node.id}` : `Activity_${node.id}`
}

function getNodeName(node) {
  const title = node?.properties?.title
  return typeof title === "string" && title.trim() ? title.trim() : ""
}

// 所有数值字段统一在这里兜底和校验。
// 这样坐标、尺寸、waypoint 等一旦出现非法值，会在导出阶段直接暴露出来。
function toFiniteNumber(value, fallback, fieldName) {
  if (value === undefined || value === null || value === "") {
    return fallback
  }

  const num = Number(value)
  assert(Number.isFinite(num), `${fieldName} 不是合法数字: ${value}`)
  return num
}

function getNodeCenter(node) {
  return {
    x: toFiniteNumber(node?.x, 0, `node ${node.id} x`),
    y: toFiniteNumber(node?.y, 0, `node ${node.id} y`),
  }
}

// 任务节点统一使用固定尺寸，开始/结束事件使用 BPMN 标准事件尺寸。
function getNodeSize(node) {
  const bpmnType = resolveBpmnType(node.type)
  return isEventType(bpmnType)
    ? { width: DEFAULT_EVENT_SIZE, height: DEFAULT_EVENT_SIZE }
    : { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT }
}

function getNodeBounds(node) {
  const center = getNodeCenter(node)
  const size = getNodeSize(node)
  return {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
    width: size.width,
    height: size.height,
  }
}

function getBoundsCenter(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

function getBoundaryPoint(bounds, referencePoint) {
  const center = getBoundsCenter(bounds)
  const dx = referencePoint.x - center.x
  const dy = referencePoint.y - center.y

  if (dx === 0 && dy === 0) {
    return { x: center.x + bounds.width / 2, y: center.y }
  }

  if (bounds.width === DEFAULT_EVENT_SIZE && bounds.height === DEFAULT_EVENT_SIZE) {
    const radius = bounds.width / 2
    const distance = Math.hypot(dx, dy)
    return {
      x: center.x + (dx / distance) * radius,
      y: center.y + (dy / distance) * radius,
    }
  }

  const halfWidth = bounds.width / 2
  const halfHeight = bounds.height / 2
  const scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight)

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  }
}

// 根据节点中心点、尺寸和名称，为开始/结束事件生成标签框。
// 任务节点的名称默认直接由渲染器放在节点内部，所以这里只给事件补标签。
function getNodeLabelBounds(node, bounds) {
  const name = getNodeName(node)
  if (!name || !isEventType(resolveBpmnType(node.type))) {
    return null
  }

  const width = Math.max(54, name.length * 12)
  return {
    x: Math.round(bounds.x + bounds.width / 2 - width / 2),
    y: Math.round(bounds.y + bounds.height + 7),
    width,
    height: 14,
  }
}

// 规范化按钮配置，统一把前端里的 operationList 转成导出需要的结构。
// 这里也顺手把布尔值、showOrder、variableList 等字段转成 Flowable 习惯的字符串格式。
function normalizeOperation(operation, index) {
  assert(operation && typeof operation === "object", "operationList 项必须是对象")
  assert(typeof operation.id !== "undefined", "operation.id 不能为空")
  assert(typeof operation.type === "string" && operation.type.trim(), "operation.type 不能为空")

  return {
    id: String(operation.id),
    label: typeof operation.label === "string" && operation.label.trim() ? operation.label.trim() : operation.type,
    type: operation.type.trim(),
    showOrder: String(operation.showOrder ?? index),
    buttonStyle: typeof operation.buttonStyle === "string" && operation.buttonStyle.trim()
      ? operation.buttonStyle.trim()
      : "primary",
    buttonPlain: String(Boolean(operation.buttonPlain)),
    variableList: JSON.stringify(operation.variableList ?? {}),
  }
}

// 读取某个节点绑定的按钮配置，并校验同一个节点内不能出现重复的操作类型。
// 当前转换规则依赖“agree / refuse”这样的唯一语义；如果同一节点存在两个 agree，
// 代码将无法判断哪条边才是主链继续方向，所以这里直接报错。
function getNodeOperations(node, flowConfigs) {
  const config = flowConfigs?.[node.id]
  const operationList = Array.isArray(config?.operationList) ? config.operationList : []
  const operations = operationList.map(normalizeOperation)
  const typeSet = new Set()

  for (const operation of operations) {
    assert(!typeSet.has(operation.type), `节点 ${node.id} 存在重复的操作类型: ${operation.type}`)
    typeSet.add(operation.type)
  }

  return operations
}

// 优先使用 LogicFlow 里现成的折线路径数据。
// 如果 pointsList 缺失，则退回到 startPoint / endPoint；
// 两者都没有时，说明原始边数据已经不完整，无法安全导出。
function getEdgeWaypoints(edge) {
  if (Array.isArray(edge.pointsList) && edge.pointsList.length > 0) {
    return edge.pointsList.map((point, index) => ({
      x: toFiniteNumber(point?.x, 0, `edge ${edge.id} pointsList[${index}].x`),
      y: toFiniteNumber(point?.y, 0, `edge ${edge.id} pointsList[${index}].y`),
    }))
  }

  if (edge.startPoint && edge.endPoint) {
    return [
      {
        x: toFiniteNumber(edge.startPoint.x, 0, `edge ${edge.id} startPoint.x`),
        y: toFiniteNumber(edge.startPoint.y, 0, `edge ${edge.id} startPoint.y`),
      },
      {
        x: toFiniteNumber(edge.endPoint.x, 0, `edge ${edge.id} endPoint.x`),
        y: toFiniteNumber(edge.endPoint.y, 0, `edge ${edge.id} endPoint.y`),
      },
    ]
  }

  throw new Error(`边 ${edge.id} 缺少 pointsList 和 start/end point，无法生成折线`)
}

// 对“原始主链边”做端点修正。
// 因为编辑器里的节点尺寸和导出后 BPMN 节点尺寸不完全一样，
// 如果直接复用原始 waypoint，边会和节点边框脱离，所以这里只修正首尾两个点。
function adjustSourceEdgeWaypoints(edge, nodeLayoutMap) {
  const waypoints = getEdgeWaypoints(edge)
  assert(waypoints.length >= 2, `边 ${edge.id} 至少需要两个 waypoint`)

  const sourceBounds = nodeLayoutMap.get(edge.sourceNodeId)
  const targetBounds = nodeLayoutMap.get(edge.targetNodeId)
  assert(sourceBounds, `边 ${edge.id} 缺少 source 节点布局信息`)
  assert(targetBounds, `边 ${edge.id} 缺少 target 节点布局信息`)

  const adjusted = waypoints.map((point) => ({ ...point }))
  adjusted[0] = getBoundaryPoint(sourceBounds, adjusted[1])
  adjusted[adjusted.length - 1] = getBoundaryPoint(targetBounds, adjusted[adjusted.length - 2])
  return adjusted
}

// 给 sequenceFlow 的文字标签估算一个可用的包围盒。
// 这里不是像素级精确排版，而是给 bpmn-js / Flowable 一个足够合理的标签位置。
function estimateLabelBounds(text, points) {
  const middlePoint = points[Math.floor(points.length / 2)]
  const width = Math.max(44, text.length * 12)

  return {
    x: Math.round(middlePoint.x - width / 2),
    y: Math.round(middlePoint.y - 18),
    width,
    height: 14,
  }
}

// 原始 peizhi.json 里的边被认为是“主链边”，因此同一个节点最多只能有一条入边和一条出边。
// 拒绝流、补充流不会从这里读取，而是在后续步骤中按规则自动生成。
function buildSourceEdgeMaps(edges) {
  const bySource = new Map()
  const byTarget = new Map()

  for (const edge of edges) {
    assert(!bySource.has(edge.sourceNodeId), `源数据中节点 ${edge.sourceNodeId} 存在多条出边，不符合单主链规则`)
    assert(!byTarget.has(edge.targetNodeId), `源数据中节点 ${edge.targetNodeId} 存在多条入边，不符合单主链规则`)
    bySource.set(edge.sourceNodeId, edge)
    byTarget.set(edge.targetNodeId, edge)
  }

  return { bySource, byTarget }
}

// 从原始边里还原一条“开始 -> ... -> 结束”的主链路径。
// 当前转换器依赖这个前提：
// 1. 原始 peizhi.json 只描述主链
// 2. 审批按钮产生的条件分支不直接写在 peizhi.json 的 edges 中
// 3. 所有额外到结束节点的边由转换器自动补出
function buildMainPath(nodes, edges) {
  const startNode = nodes.find((node) => resolveBpmnType(node.type) === "startEvent")
  const endNode = nodes.find((node) => resolveBpmnType(node.type) === "endEvent")

  assert(startNode, "未找到开始节点")
  assert(endNode, "未找到结束节点")

  const { bySource, byTarget } = buildSourceEdgeMaps(edges)
  const pathNodes = [startNode]
  const pathEdges = []
  let currentNode = startNode
  const visitedNodeIds = new Set([currentNode.id])

  while (currentNode.id !== endNode.id) {
    const nextEdge = bySource.get(currentNode.id)
    assert(nextEdge, `源数据中节点 ${currentNode.id} 缺少主链出边`)

    const nextNode = nodes.find((node) => node.id === nextEdge.targetNodeId)
    assert(nextNode, `边 ${nextEdge.id} 指向的目标节点不存在`)
    assert(byTarget.get(nextNode.id)?.id === nextEdge.id, `节点 ${nextNode.id} 的主链入边关系不合法`)
    assert(!visitedNodeIds.has(nextNode.id), `检测到环路，节点 ${nextNode.id} 被重复访问`)

    pathEdges.push(nextEdge)
    pathNodes.push(nextNode)
    visitedNodeIds.add(nextNode.id)
    currentNode = nextNode
  }

  assert(pathNodes.length === nodes.length, "当前源数据不是一条单一的开始到结束主链，无法按既定规则导出")

  return { pathNodes, pathEdges }
}

// 按业务规则生成真正要写入 BPMN 的 sequenceFlow：
// 1. 开始节点沿用原始主链边到第一个审批节点
// 2. 每个审批节点的 agree 指向下一个节点
// 3. 每个审批节点的 refuse 自动补一条到结束节点的边
// 4. 最后一个审批节点的 agree / refuse 都指向结束节点
//
// 这里是本文件最核心的规则提取逻辑，也是把 peizhi.json 转成 Flowable BPMN 的关键。
function buildGeneratedFlows(pathNodes, pathEdges, flowConfigs) {
  const flows = []
  const endNode = pathNodes[pathNodes.length - 1]

  if (pathEdges.length > 0) {
    flows.push({
      id: edgeId(pathEdges[0].id),
      sourceNodeId: pathNodes[0].id,
      targetNodeId: pathNodes[1].id,
      sourceEdge: pathEdges[0],
      operationType: null,
      name: "",
      routeSlot: 0,
    })
  }

  for (let index = 1; index < pathNodes.length - 1; index += 1) {
    const node = pathNodes[index]
    const nextNode = pathNodes[index + 1]
    const mainEdge = pathEdges[index]
    const operations = getNodeOperations(node, flowConfigs)

    if (operations.length === 0) {
      assert(mainEdge, `节点 ${node.id} 缺少主链边，无法继续导出`)
      flows.push({
        id: edgeId(mainEdge.id),
        sourceNodeId: node.id,
        targetNodeId: nextNode.id,
        sourceEdge: mainEdge,
        operationType: null,
        name: "",
        routeSlot: 0,
      })
      continue
    }

    const agreeOperation = operations.find((operation) => operation.type === "agree")
    assert(agreeOperation, `节点 ${node.id} 缺少 agree 按钮，无法确定“到下一个节点”的主链`)

    let derivedSlot = 0
    for (const operation of operations) {
      const targetNode = operation.type === "agree" ? nextNode : endNode
      const useSourceEdge = operation.type === "agree"
      flows.push({
        id: useSourceEdge ? edgeId(mainEdge.id) : derivedFlowId(node.id, operation.type, operation.id),
        sourceNodeId: node.id,
        targetNodeId: targetNode.id,
        sourceEdge: useSourceEdge ? mainEdge : null,
        operationType: operation.type,
        operationLabel: operation.label,
        name: `${getNodeName(node)}${operation.label}`,
        routeSlot: useSourceEdge ? 0 : derivedSlot++,
      })
    }
  }

  return flows
}

// 生成 incoming / outgoing 索引，后面写 BPMN 节点时直接按索引输出。
function buildFlowIndex(flows) {
  const incoming = {}
  const outgoing = {}

  for (const flow of flows) {
    ;(outgoing[flow.sourceNodeId] ??= []).push(flow.id)
    ;(incoming[flow.targetNodeId] ??= []).push(flow.id)
  }

  return { incoming, outgoing }
}

// 生成节点的 BPMN DI 布局。
// 这里默认直接沿用编辑器中的中心点，只替换成 BPMN 约定的尺寸；
// 这样节点数量增加时，布局仍然能跟着原始画布自然扩展。
function buildNodeLayout(nodes) {
  const layout = new Map()
  for (const node of nodes) {
    const bounds = getNodeBounds(node)
    const label = getNodeLabelBounds(node, bounds)
    layout.set(node.id, label ? { ...bounds, label } : bounds)
  }
  return layout
}

// 自动补出的边没有现成的折线数据，需要自己生成路径。
// 当前策略是把自动补边统一往右侧绕出，再折回目标节点，
// 目的是尽量避免与主链重叠，也尽量减少和其他拒绝流相互压线。
function buildDerivedWaypoints(flow, nodeLayoutMap, maxRight) {
  const sourceBounds = nodeLayoutMap.get(flow.sourceNodeId)
  const targetBounds = nodeLayoutMap.get(flow.targetNodeId)
  const sourceCenter = getBoundsCenter(sourceBounds)
  const targetCenter = getBoundsCenter(targetBounds)
  const routeX = Math.max(
    maxRight + EXTRA_FLOW_GAP_X + flow.routeSlot * 50,
    sourceBounds.x + sourceBounds.width + EXTRA_FLOW_GAP_X
  )
  const verticalBias = flow.routeSlot * EXTRA_FLOW_GAP_Y
  const startReference = { x: routeX, y: sourceCenter.y + verticalBias }
  const endReference = { x: routeX, y: targetCenter.y + verticalBias }
  const start = getBoundaryPoint(sourceBounds, startReference)
  const end = getBoundaryPoint(targetBounds, endReference)
  const points = [
    start,
    { x: routeX, y: start.y },
  ]

  if (Math.abs(start.y - end.y) > 0.5) {
    points.push({ x: routeX, y: end.y })
  }

  points.push(end)
  return points
}

// 统一生成所有 sequenceFlow 的 DI 坐标：
// 原始主链边保留原路径并修正端点；
// 自动补出的边按通用布线路径生成。
function buildFlowLayout(flows, nodeLayoutMap) {
  const layout = new Map()
  const allBounds = Array.from(nodeLayoutMap.values())
  const maxRight = Math.max(...allBounds.map((bounds) => bounds.x + bounds.width))

  for (const flow of flows) {
    const points = flow.sourceEdge
      ? adjustSourceEdgeWaypoints(flow.sourceEdge, nodeLayoutMap)
      : buildDerivedWaypoints(flow, nodeLayoutMap, maxRight)

    layout.set(flow.id, {
      points,
      label: flow.name ? estimateLabelBounds(flow.name, points) : null,
    })
  }

  return layout
}

// 将节点上的按钮配置渲染成 Flowable 扩展里的 operationList。
function renderOperationList(operations) {
  if (operations.length === 0) {
    return `                <flowable:operationList />`
  }

  const lines = operations.map((operation) => {
    return `                    <flowable:formOperation id="${escapeXml(operation.id)}" label="${escapeXml(operation.label)}" type="${escapeXml(operation.type)}" showOrder="${escapeXml(operation.showOrder)}" variableList="${escapeXml(operation.variableList)}" buttonStyle="${escapeXml(operation.buttonStyle)}" buttonPlain="${escapeXml(operation.buttonPlain)}" />`
  })

  return [
    `                <flowable:operationList>`,
    ...lines,
    `                </flowable:operationList>`,
  ].join("\n")
}

// 渲染 BPMN 节点本体。
// 任务节点会带 formKey、variableList、copyItemList 和 operationList；
// 事件节点只保留标准的 incoming / outgoing。
function renderProcessNode(node, flowConfigs, incoming = [], outgoing = []) {
  const type = resolveBpmnType(node.type)
  const id = nodeId(node)
  const name = getNodeName(node)
  const attrs = [`id="${escapeXml(id)}"`]

  if (name) {
    attrs.push(`name="${escapeXml(name)}"`)
  }

  if (type === "userTask") {
    attrs.push(`flowable:formKey="${escapeXml(DEFAULT_FORM_KEY)}"`)
  }

  const lines = []

  if (!isEventType(type)) {
    const operations = getNodeOperations(node, flowConfigs)
    lines.push(
      `            <bpmn2:extensionElements>`,
      `                <flowable:variableList />`,
      `                <flowable:copyItemList />`,
      renderOperationList(operations),
      `            </bpmn2:extensionElements>`
    )
  }

  incoming.forEach((flowId) => lines.push(`            <bpmn2:incoming>${escapeXml(flowId)}</bpmn2:incoming>`))
  outgoing.forEach((flowId) => lines.push(`            <bpmn2:outgoing>${escapeXml(flowId)}</bpmn2:outgoing>`))

  return `        <bpmn2:${type} ${attrs.join(" ")}>
${lines.join("\n")}
        </bpmn2:${type}>`
}

// 渲染 sequenceFlow。
// 对按钮驱动出来的边，自动补充 Flowable 的 customCondition 和 conditionExpression，
// 让流程引擎能够根据 operationType 判断流向。
function renderSequenceFlow(flow, nodeIdMap) {
  const attrs = [
    `id="${escapeXml(flow.id)}"`,
    `sourceRef="${escapeXml(nodeIdMap.get(flow.sourceNodeId))}"`,
    `targetRef="${escapeXml(nodeIdMap.get(flow.targetNodeId))}"`,
  ]

  if (flow.name) {
    attrs.push(`name="${escapeXml(flow.name)}"`)
  }

  if (!flow.operationType) {
    return `        <bpmn2:sequenceFlow ${attrs.join(" ")} />`
  }

  return [
    `        <bpmn2:sequenceFlow ${attrs.join(" ")}>`,
    `            <bpmn2:extensionElements>`,
    `                <flowable:customCondition type="operation" operationType="${escapeXml(flow.operationType)}" />`,
    `            </bpmn2:extensionElements>`,
    `            <bpmn2:conditionExpression xsi:type="bpmn2:tFormalExpression">\${operationType == '${escapeXml(flow.operationType)}'}</bpmn2:conditionExpression>`,
    `        </bpmn2:sequenceFlow>`,
  ].join("\n")
}

// 渲染节点的 DI 信息；开始/结束事件会带额外的标签框。
function renderShape(node, nodeLayoutMap) {
  const id = nodeId(node)
  const bounds = nodeLayoutMap.get(node.id)
  const lines = [
    `            <bpmndi:BPMNShape id="${escapeXml(id)}_di" bpmnElement="${escapeXml(id)}">`,
    `                <dc:Bounds x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" />`,
  ]

  if (bounds.label) {
    lines.push(
      `                <bpmndi:BPMNLabel>`,
      `                    <dc:Bounds x="${bounds.label.x}" y="${bounds.label.y}" width="${bounds.label.width}" height="${bounds.label.height}" />`,
      `                </bpmndi:BPMNLabel>`
    )
  }

  lines.push(`            </bpmndi:BPMNShape>`)
  return lines.join("\n")
}

// 渲染边的 DI 信息；如果该边带名称，则同时补 BPMNLabel。
function renderEdge(flow, flowLayoutMap) {
  const layout = flowLayoutMap.get(flow.id)
  assert(layout, `边 ${flow.id} 缺少图形布局信息`)

  const lines = [
    `            <bpmndi:BPMNEdge id="${escapeXml(flow.id)}_di" bpmnElement="${escapeXml(flow.id)}">`,
    ...layout.points.map((point) => `                <di:waypoint x="${point.x}" y="${point.y}" />`),
  ]

  if (layout.label) {
    lines.push(
      `                <bpmndi:BPMNLabel>`,
      `                    <dc:Bounds x="${layout.label.x}" y="${layout.label.y}" width="${layout.label.width}" height="${layout.label.height}" />`,
      `                </bpmndi:BPMNLabel>`
    )
  }

  lines.push(`            </bpmndi:BPMNEdge>`)
  return lines.join("\n")
}

// 输入校验集中放在这里，避免转换流程中途才发现数据缺失。
// 这里只校验“结构是否合法”，不校验更高层的业务规则；
// 业务规则由 buildMainPath / buildGeneratedFlows 继续约束。
function validateInput({ nodes, edges, flowName, flowId, flowConfigs }) {
  assert(Array.isArray(nodes), "nodes 必须是数组")
  assert(Array.isArray(edges), "edges 必须是数组")
  assert(typeof flowId === "string" && flowId.trim(), "flowId 不能为空")
  assert(typeof flowName === "string" && flowName.trim(), "flowName 不能为空")
  assert(!flowConfigs || typeof flowConfigs === "object", "flowConfigs 必须是对象")

  const nodeIds = new Set()
  for (const node of nodes) {
    assert(node && typeof node === "object", "每个 node 都必须是对象")
    assert(typeof node.id === "string" && node.id.trim(), "node.id 不能为空")
    assert(!nodeIds.has(node.id), `存在重复的节点 id: ${node.id}`)
    nodeIds.add(node.id)
    resolveBpmnType(node.type)
    getNodeBounds(node)
  }

  const edgeIds = new Set()
  for (const edge of edges) {
    assert(edge && typeof edge === "object", "每个 edge 都必须是对象")
    assert(typeof edge.id === "string" && edge.id.trim(), "edge.id 不能为空")
    assert(!edgeIds.has(edge.id), `存在重复的边 id: ${edge.id}`)
    edgeIds.add(edge.id)
    assert(nodeIds.has(edge.sourceNodeId), `边 ${edge.id} 的 source 节点不存在: ${edge.sourceNodeId}`)
    assert(nodeIds.has(edge.targetNodeId), `边 ${edge.id} 的 target 节点不存在: ${edge.targetNodeId}`)
    getEdgeWaypoints(edge)
  }
}

// 转换主入口：
// 1. 校验输入
// 2. 还原主链
// 3. 根据按钮规则补充流程边
// 4. 生成 process / DI 两部分 XML
export function transformer(input) {
  validateInput(input)

  const { nodes, edges, flowName, flowId, isExecutable, flowConfigs = {} } = input
  const { pathNodes, pathEdges } = buildMainPath(nodes, edges)
  const generatedFlows = buildGeneratedFlows(pathNodes, pathEdges, flowConfigs)
  const nodeIdMap = new Map(pathNodes.map((node) => [node.id, nodeId(node)]))
  const { incoming, outgoing } = buildFlowIndex(generatedFlows)
  const nodeLayoutMap = buildNodeLayout(pathNodes)
  const flowLayoutMap = buildFlowLayout(generatedFlows, nodeLayoutMap)

  const processXml = [
    ...pathNodes.map((node) => renderProcessNode(node, flowConfigs, incoming[node.id], outgoing[node.id])),
    ...generatedFlows.map((flow) => renderSequenceFlow(flow, nodeIdMap)),
  ].join("\n")

  const diagramXml = [
    ...generatedFlows.map((flow) => renderEdge(flow, flowLayoutMap)),
    ...pathNodes.map((node) => renderShape(node, nodeLayoutMap)),
  ].join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:flowable="http://flowable.org/bpmn"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="diagram_${escapeXml(flowId)}"
  targetNamespace="http://flowable.org/bpmn"
  xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="${escapeXml(flowId)}" name="${escapeXml(flowName)}" isExecutable="${Boolean(isExecutable)}">
${processXml}
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${escapeXml(flowId)}">
${diagramXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`
}

export function saveBpmnFile(xml, outputPath = `bpmn_${Date.now()}.bpmn`) {
  fs.writeFileSync(outputPath, xml, "utf8")
  return outputPath
}

const currentFile = fileURLToPath(import.meta.url)
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === currentFile

// 只有直接执行该文件时才写出 bpmn 文件，被其他模块引用时不产生副作用。
if (isDirectRun) {
  const result = transformer(source)
  const filename = saveBpmnFile(result)
  console.log(`BPMN 文件已生成: ${filename}`)
}
