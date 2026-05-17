export type FlowNodeKind = 'start' | 'action' | 'branch' | 'end'

export interface BaseFlowNode {
  id: string
  type: FlowNodeKind
  title: string
}

export interface SimpleFlowNode extends BaseFlowNode {
  type: 'start' | 'action' | 'end'
}

export interface BranchLine {
  id: string
  condition: string
  children: FlowNode[]
}

export interface BranchFlowNode extends BaseFlowNode {
  type: 'branch'
  branches: BranchLine[]
}

export type FlowNode = SimpleFlowNode | BranchFlowNode

let seed = 0

export function createId(prefix: string) {
  seed += 1
  return `${prefix}-${Date.now().toString(36)}-${seed}`
}

export function createStartNode(): SimpleFlowNode {
  return {
    id: createId('start'),
    type: 'start',
    title: '开始',
  }
}

export function createActionNode(title = '动作节点'): SimpleFlowNode {
  return {
    id: createId('action'),
    type: 'action',
    title,
  }
}

export function createEndNode(): SimpleFlowNode {
  return {
    id: createId('end'),
    type: 'end',
    title: '结束',
  }
}

export function createBranchLine(index: number): BranchLine {
  return {
    id: createId('branch-line'),
    condition: `分支条件 ${index}`,
    children: [],
  }
}

export function createBranchNode(): BranchFlowNode {
  return {
    id: createId('branch'),
    type: 'branch',
    title: '条件分支',
    branches: [createBranchLine(1), createBranchLine(2)],
  }
}

/**
 * 创建初始流程节点数组
 * @returns FlowNode[] 包含起始节点、动作节点、分支节点和结束节点的数组
 */
export function createInitialFlow(): FlowNode[] {
  return [
    createStartNode(),    // 创建起始节点
    createActionNode(),   // 创建动作节点
    createBranchNode(),   // 创建分支节点
    createEndNode(),      // 创建结束节点
  ]
}
