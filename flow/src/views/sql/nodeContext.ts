import type { InjectionKey } from "vue";
import type { NodeConfigSnapshot, NodeRequestPayload } from "./types";

export interface SqlGraphData {
  nodes?: Array<{
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }>;
  edges?: Array<{ sourceNodeId: string; targetNodeId: string }>;
}

export type GetNodeContext = (nodeId: string) => NodeRequestPayload | null;

export const sqlNodeContextKey: InjectionKey<GetNodeContext> = Symbol("sql-node-context");

export const buildNodeContext = (
  graph: SqlGraphData | undefined,
  nodeId: string,
): NodeRequestPayload | null => {
  if (!graph) return null;

  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  if (nodes.length === 0) return null;

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  if (!nodeMap.has(nodeId)) return null;

  const visited = new Set<string>();
  const predecessorOrder: string[] = [];

  const visit = (currentId: string) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    edges
      .filter((edge) => edge.targetNodeId === currentId)
      .forEach((edge) => {
        visit(edge.sourceNodeId);
        if (edge.sourceNodeId !== nodeId) {
          predecessorOrder.push(edge.sourceNodeId);
        }
      });
  };

  visit(nodeId);

  // 辅助函数：计算某个节点的直接前置节点id（fromIds）
  const getFromIds = (targetId: string): string[] => {
    const fromIds = edges
      .filter((edge) => edge.targetNodeId === targetId)
      .map((edge) => edge.sourceNodeId);
    return [...new Set(fromIds)];
  };

  const uniquePredecessorIds = [...new Set(predecessorOrder)];
  const upstreamNodes = uniquePredecessorIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map<NodeConfigSnapshot>((node) => ({
      id: node.id,
      type: node.type,
      // 这里构建的是传给下游预览/mock 逻辑的链路快照。
      // properties 需要拷贝，避免后续误操作时通过引用污染 LogicFlow 的真实节点状态。
      properties: { ...((node.properties || {}) as Record<string, unknown>) },
      fromIds: getFromIds(node.id),
    }));

  const currentNode = nodeMap.get(nodeId);
  return {
    nodeId,
    nodeType: currentNode?.type || "",
    upstreamNodes,
    currentNode: currentNode
      ? {
          id: currentNode.id,
          type: currentNode.type,
          properties: { ...((currentNode.properties || {}) as Record<string, unknown>) },
          fromIds: getFromIds(currentNode.id),
        }
      : null,
  };
};
