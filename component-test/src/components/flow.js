import flowNodes from './flow.json'

// 统一判断节点是否有可继续向下查找的子节点。
function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0
}

// 将一个节点及其所有后代按深度优先顺序展开，用于统计“已经走过”的完整节点集合。
function flattenNode(node) {
  const nodes = [node]

  if (hasChildren(node)) {
    for (const child of node.children) {
      nodes.push(...flattenNode(child))
    }
  }

  return nodes
}

// 在节点的子级中查找目标节点。
// BRANCH 的 children 是多条分支条件，目标只会命中其中一条分支，其他并列分支不算前置节点。
function findInChildren(node, targetId, beforeNodes) {
  if (!hasChildren(node)) return null

  if (node.type === 'BRANCH') {
    for (const branchCase of node.children) {
      const result = findInSequence([branchCase], targetId, beforeNodes)
      if (result) return result
    }

    return null
  }

  return findInSequence(node.children, targetId, beforeNodes)
}

// 在一个顺序节点列表中查找目标节点，并返回目标节点之前的所有前置节点。
// beforeNodes 表示进入当前列表之前已经确定的前置节点。
function findInSequence(nodes, targetId, beforeNodes) {
  const previousNodes = []

  for (const node of nodes) {
    const currentBeforeNodes = beforeNodes.concat(previousNodes)

    if (node.id === targetId) {
      return currentBeforeNodes
    }

    const childResult = findInChildren(
      node,
      targetId,
      // 进入子级前，当前节点本身也已经是子级节点的前置节点。
      currentBeforeNodes.concat(node),
    )

    if (childResult) {
      return childResult
    }

    previousNodes.push(...flattenNode(node))
  }

  return null
}

export function getPreviousNodes(id, nodes = flowNodes) {
  return findInSequence(nodes, id, []) ?? []
}

// 如果调用方只关心 id，可以直接使用这个方法。
export function getPreviousNodeIds(id, nodes = flowNodes) {
  return getPreviousNodes(id, nodes).map((node) => node.id)
}
