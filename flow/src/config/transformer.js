import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import source from "./peizhi.json" with { type: "json" }

const BPMN_TYPE = Object.freeze({
  "start-node": "startEvent",
  "end-node": "endEvent",
  "my-logic-node": "userTask",
  "copy-node": "userTask",
})

const DEFAULT_NODE_WIDTH = 100
const DEFAULT_NODE_HEIGHT = 80
const DEFAULT_EVENT_SIZE = 36

// 将动态内容写入 XML 之前先做转义，避免属性和值把 XML 结构破坏掉。
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
/**
 * 如果不满足条件就报错
 * @param {*} condition 
 * @param {*} message 
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function resolveBpmnType(nodeType) {
  const bpmnType = BPMN_TYPE[nodeType]
  assert(bpmnType, `Unsupported node type: ${nodeType}`)
  return bpmnType
}

function edgeId(id) {
  return `Flow_${String(id).replace(/-/g, "_")}`
}

function nodeId(node) {
  const bpmnType = resolveBpmnType(node.type)
  return isEventType(bpmnType)
    ? `Event_${node.id}`
    : `Activity_${node.id}`
}

function isEventType(bpmnType) {
  return bpmnType === "startEvent" || bpmnType === "endEvent"
}

function getNodeName(node) {
  const title = node?.properties?.title
  return typeof title === "string" && title.trim() ? title.trim() : ""
}

function toFiniteNumber(value, fallback, fieldName) {
  if (value === undefined || value === null || value === "") {
    return fallback
  }

  const num = Number(value)
  assert(Number.isFinite(num), `Invalid number for ${fieldName}: ${value}`)
  return num
}

function getNodeCenter(node) {
  return {
    x: toFiniteNumber(node?.x, 0, `node ${node.id} x`),
    y: toFiniteNumber(node?.y, 0, `node ${node.id} y`),
  }
}

// 导出 BPMN 时，任务节点统一使用固定尺寸，开始/结束事件使用标准圆形尺寸。
function getNodeSize(node) {
  const bpmnType = resolveBpmnType(node.type)

  return isEventType(bpmnType)
    ? { width: DEFAULT_EVENT_SIZE, height: DEFAULT_EVENT_SIZE, shape: "circle" }
    : { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT, shape: "rect" }
}

function getNodeBounds(node) {
  const { x, y } = getNodeCenter(node)
  const { width, height } = getNodeSize(node)

  return {
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
  }
}

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

  throw new Error(`Edge ${edge.id} is missing pointsList and start/end points`)
}

// 按“节点中心 -> 参考点”的方向，把点投影到导出后节点的边界上。
// 这样在节点尺寸发生变化后，边的端点仍然会贴在节点边缘。
function projectPointToNodeBoundary(node, referencePoint) {
  const center = getNodeCenter(node)
  const { width, height, shape } = getNodeSize(node)
  const dx = referencePoint.x - center.x
  const dy = referencePoint.y - center.y

  if (dx === 0 && dy === 0) {
    return { x: center.x + width / 2, y: center.y }
  }

  if (shape === "circle") {
    const radius = width / 2
    const distance = Math.hypot(dx, dy)

    return {
      x: center.x + (dx / distance) * radius,
      y: center.y + (dy / distance) * radius,
    }
  }

  const halfWidth = width / 2
  const halfHeight = height / 2
  const scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight)

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  }
}

// 只重算边的首尾两个 waypoint，中间拐点保持不变。
// 这样既能保留原来的折线路径，又能让边重新吸附到转换后的节点边界。
// 之所以要这么做，是因为logicflow 中的节点尺寸是一个，而到bpmn里节点尺寸又变成了另外一个，如果不修正，会导致节点和边在bpmn的渲染器里不贴合。
function getAdjustedEdgeWaypoints(edge, nodeMap) {
  const waypoints = getEdgeWaypoints(edge)
  assert(waypoints.length >= 2, `edge ${edge.id} must have at least 2 waypoints`)

  const sourceNode = nodeMap.get(edge.sourceNodeId)
  const targetNode = nodeMap.get(edge.targetNodeId)

  assert(sourceNode, `edge ${edge.id} source node not found`)
  assert(targetNode, `edge ${edge.id} target node not found`)

  const adjustedWaypoints = waypoints.map((point) => ({ ...point }))
  adjustedWaypoints[0] = projectPointToNodeBoundary(sourceNode, adjustedWaypoints[1])
  adjustedWaypoints[adjustedWaypoints.length - 1] = projectPointToNodeBoundary(
    targetNode,
    adjustedWaypoints[adjustedWaypoints.length - 2]
  )

  return adjustedWaypoints
}

function validateInput({ nodes, edges, flowName, flowId }) {
  assert(Array.isArray(nodes), "nodes must be an array")
  assert(Array.isArray(edges), "edges must be an array")
  assert(typeof flowId === "string" && flowId.trim(), "flowId must be a non-empty string")
  assert(typeof flowName === "string" && flowName.trim(), "flowName must be a non-empty string")

  const nodeIds = new Set()
  for (const node of nodes) {
    assert(node && typeof node === "object", "each node must be an object")
    assert(typeof node.id === "string" && node.id.trim(), "node.id must be a non-empty string")
    assert(!nodeIds.has(node.id), `duplicate node id: ${node.id}`)
    nodeIds.add(node.id)
    resolveBpmnType(node.type)
    getNodeBounds(node)
  }

  const edgeIds = new Set()
  for (const edge of edges) {
    assert(edge && typeof edge === "object", "each edge must be an object")
    assert(typeof edge.id === "string" && edge.id.trim(), "edge.id must be a non-empty string")
    assert(!edgeIds.has(edge.id), `duplicate edge id: ${edge.id}`)
    edgeIds.add(edge.id)
    assert(nodeIds.has(edge.sourceNodeId), `edge ${edge.id} source node not found: ${edge.sourceNodeId}`)
    assert(nodeIds.has(edge.targetNodeId), `edge ${edge.id} target node not found: ${edge.targetNodeId}`)
    getEdgeWaypoints(edge)
  }
}

function buildFlowIndex(edges) {
  const inc = {}
  const out = {}

  for (const { id, sourceNodeId, targetNodeId } of edges) {
    const fid = edgeId(id)
    ;(out[sourceNodeId] ??= []).push(fid)
    ;(inc[targetNodeId] ??= []).push(fid)
  }

  return { inc, out }
}

function renderProcessNode(node, inc = [], out = []) {
  const type = resolveBpmnType(node.type)
  const isEvent = isEventType(type)
  const id = nodeId(node)
  const name = getNodeName(node)
  const attrs = [`id="${escapeXml(id)}"`]

  if (name) {
    attrs.push(`name="${escapeXml(name)}"`)
  }

  const lines = []
  if (!isEvent) {
    lines.push(
      `            <bpmn2:extensionElements>`,
      `                <flowable:variableList />`,
      `                <flowable:operationList />`,
      `            </bpmn2:extensionElements>`
    )
  }

  inc.forEach((fid) => lines.push(`            <bpmn2:incoming>${escapeXml(fid)}</bpmn2:incoming>`))
  out.forEach((fid) => lines.push(`            <bpmn2:outgoing>${escapeXml(fid)}</bpmn2:outgoing>`))

  return lines.length
    ? `        <bpmn2:${type} ${attrs.join(" ")}>
${lines.join("\n")}
        </bpmn2:${type}>`
    : `        <bpmn2:${type} ${attrs.join(" ")} />`
}

function renderSequenceFlow(edge, nodeIdMap) {
  const sourceRef = nodeIdMap.get(edge.sourceNodeId)
  const targetRef = nodeIdMap.get(edge.targetNodeId)

  assert(sourceRef, `edge ${edge.id} sourceRef not found`)
  assert(targetRef, `edge ${edge.id} targetRef not found`)

  return `        <bpmn2:sequenceFlow id="${escapeXml(edgeId(edge.id))}" sourceRef="${escapeXml(sourceRef)}" targetRef="${escapeXml(targetRef)}" />`
}

function renderShape(node) {
  const id = nodeId(node)
  const bounds = getNodeBounds(node)

  return [
    `            <bpmndi:BPMNShape id="${escapeXml(id)}_di" bpmnElement="${escapeXml(id)}">`,
    `                <dc:Bounds x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" />`,
    `            </bpmndi:BPMNShape>`,
  ].join("\n")
}

function renderEdge(edge, nodeMap) {
  const eid = edgeId(edge.id)
  const waypoints = getAdjustedEdgeWaypoints(edge, nodeMap)
    .map(({ x, y }) => `                <di:waypoint x="${x}" y="${y}" />`)
    .join("\n")

  return [
    `            <bpmndi:BPMNEdge id="${escapeXml(eid)}_di" bpmnElement="${escapeXml(eid)}">`,
    waypoints,
    `            </bpmndi:BPMNEdge>`,
  ].join("\n")
}

export function transformer(input) {
  validateInput(input)

  const { nodes, edges, flowName, flowId, isExecutable } = input
  // 同时保留原始节点数据和转换后的 BPMN 节点 id：
  // nodeMap 用于几何计算，nodeIdMap 用于 sequenceFlow 的 sourceRef / targetRef。
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const nodeIdMap = new Map(nodes.map((node) => [node.id, nodeId(node)]))
  const { inc, out } = buildFlowIndex(edges)

  const processXml = [
    ...nodes.map((node) => renderProcessNode(node, inc[node.id], out[node.id])),
    ...edges.map((edge) => renderSequenceFlow(edge, nodeIdMap)),
  ].join("\n")

  const diagramXml = [
    ...edges.map((edge) => renderEdge(edge, nodeMap)),
    ...nodes.map(renderShape),
  ].join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
    xmlns:flowable="http://flowable.org/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
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
  console.log(`Saved to ${filename}`)
}
