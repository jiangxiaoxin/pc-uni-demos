export interface InputField {
  key: string;
  name: string;
  type: string;
}

export interface InputSource {
  id: string;
  name: string;
  description?: string;
  fields: InputField[];
  rows: Record<string, unknown>[];
}

export interface InputBindingPersisted {
  sourceId: string;
  fieldKeys: string[];
}

export interface BoundInputSource {
  sourceId: string;
  sourceName: string;
  fields: InputField[];
}

export interface FieldSettingPersistedItem {
  key: string;
  name: string;
}

export interface FieldSettingItem extends InputField {
  selected: boolean;
}

export interface GroupAggregateFieldPersistedItem {
  key: string;
  method: GroupAggregateMethod;
}

export interface GroupAggregateFieldItem extends InputField {
  method: GroupAggregateMethod;
}

export interface InputPreviewResult {
  columns: InputField[];
  rows: Record<string, unknown>[];
}

export interface DistinctPreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
  fields: string[];
}

export interface FieldNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface GroupNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface OutputPreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface WhereNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export type WhereLogic = "and" | "or";

export type WhereRelation =
  | "eq"
  | "ne"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "notEmpty"
  | "in"
  | "notIn"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "range";

export interface WhereConditionPersisted {
  key: string;
  relation: WhereRelation;
  value?: string | number | string[] | [string, string] | [number, number] | null;
}

export interface NodeConfigSnapshot {
  id: string;
  type: string;
  properties?: Record<string, unknown>;
  fromIds?: string[];
}

export interface NodeRequestPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export type JoinType = "inner" | "outer" | "left" | "right";

export interface JoinConditionPersisted {
  leftField: string;
  rightField: string;
}

export interface JoinConfig {
  joinType: JoinType;
  leftNodeId: string;
  rightNodeId: string;
  joinConditions: JoinConditionPersisted[];
}

export interface JoinNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export type GroupAggregateMethod =
  | "sum"
  | "avg"
  | "max"
  | "min"
  | "count"
  | "median"
  | "variance"
  | "stddev"
  | "distinctCount"
  | "earliest"
  | "latest";

export interface GroupAggregateMethodOption {
  label: string;
  value: GroupAggregateMethod;
}

export interface JoinUpstreamForm {
  id: string;
  name: string;
  fields: InputField[];
}
