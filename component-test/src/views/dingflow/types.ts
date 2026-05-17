export type FlowNodeKind = 'start' | 'action' | 'branch' | 'loop' | 'end'

/** 用户可以通过“下一步”按钮新增的节点类型。开始/结束节点由流程根配置固定维护。 */
export type AddableNodeKind = 'action' | 'branch' | 'loop'

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
  /** 当前分支上的节点序列。这里继续使用 FlowNode[]，因此分支和循环都能递归嵌套。 */
  children: FlowNode[]
}

/** 条件分支是复合节点：它本身占据主流程一个节点位，内部维护多条分支线。 */
export interface BranchFlowNode extends BaseFlowNode {
  type: 'branch'
  branches: BranchLine[]
}

/** 循环节点只有一条可编辑内容线，左侧回路线只负责视觉表达，不承载数据。 */
export interface LoopFlowNode extends BaseFlowNode {
  type: 'loop'
  children: FlowNode[]
}

export type FlowNode = SimpleFlowNode | BranchFlowNode | LoopFlowNode

let seed = 0

/** 生成本地唯一 id；颜色调试、v-for key、节点删除都依赖 id 稳定区分节点。 */
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
    // 新建分支节点必须至少有左右两支，否则不具备分支语义。
    branches: [createBranchLine(1), createBranchLine(2)],
  }
}

export function createLoopNode(): LoopFlowNode {
  return {
    id: createId('loop'),
    type: 'loop',
    title: '循环节点',
    children: [],
  }
}

/** 创建演示流程；真实业务接入时通常从后端配置反序列化为同样的数据结构。 */
export function createInitialFlow(): FlowNode[] {
  return [
    createStartNode(),
    createActionNode(),
    createBranchNode(),
    createEndNode(),
  ]
}
