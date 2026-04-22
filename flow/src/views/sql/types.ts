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
  sourceId: string; // 表的id
  sourceName: string; // 表的name
  sourceAlias?: string; // 表的别名
  sourceType: "DB_TABLE";
  fieldKeys: {
    fieldKey: string;
    fieldAlias?: string;
    fieldType: String;
    fieldName: string;
  }[];

  [key: string]: any;
}

export interface BoundInputSource {
  sourceId: string;
  sourceName: string;
  fields: InputField[];
}

export interface FieldSettingPersistedItem {
  sourceFieldKey: string;
  alias: string;
  fieldType: string;
}

export interface FieldSettingItem extends FieldSettingPersistedItem {
  selected: boolean;
}

export interface GroupAggregateFieldItem {
  sourceFieldKey: string;
  alias: string;
  method: GroupAggregateMethod;
  type: string;
}

export interface InputPreviewResult {
  columns: InputField[];
  rows: Record<string, unknown>[];
}

export interface BaseNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface DistinctPreviewPayload extends BaseNodePreviewPayload {
  fields: string[];
}

export interface FieldNodePreviewPayload extends BaseNodePreviewPayload {}

export interface GroupNodePreviewPayload extends BaseNodePreviewPayload {}

export interface OutputPreviewPayload extends BaseNodePreviewPayload {}

export interface WhereNodePreviewPayload extends BaseNodePreviewPayload {}

export interface JoinNodePreviewPayload extends BaseNodePreviewPayload {}

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
  fieldKey: string;
  fieldType: string;
  operator: WhereRelation;
  value?:
    | number[]
    | string[]
    | [string, string]
    | [number, number]
    | null;
  valueType: 'LITERAL' // 暂时固定，后续扩展用
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

export const JOIN_TYPE = {
  INNER: "inner",
  OUTER: "outer",
  LEFT: "left",
  RIGHT: "right",
} as const;

export type JoinType = (typeof JOIN_TYPE)[keyof typeof JOIN_TYPE];

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

export type UnionMode = "union" | "unionAll";

export interface UnionFieldMapping {
  targetField: string;
  targetName: string;
  targetType: string;
  sourceMap: Record<string, string>;
}

export interface UnionConfig {
  mode: UnionMode;
  sourceNodeIds: string[];
  fieldMappings: UnionFieldMapping[];
}

export interface UnionNodePreviewPayload extends BaseNodePreviewPayload {}

import type { SqlGraphData } from "./nodeContext";

export interface EditorExpose {
  resize: () => void;
  // focusNode: (nodeId: string) => void;
  updateNodeTitle: (nodeId: string, title: string) => void;
  updateNodeProperties: (
    nodeId: string,
    properties: Record<string, unknown>,
  ) => void;
  getGraphData: () => SqlGraphData | undefined;
  saveToLocal: () => void;
  openPreview: () => void;
  // load: () => Promise<void>;
  renderGraph: (data: SqlGraphData) => Promise<void>;
}

export interface PropertyExpose {
  flushDraftProperties: () => void;
}

export interface SqlNodeData {
  id: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface NodeSelectPayload {
  node: SqlNodeData;
  incomingCount: number;
}

export interface ConnectionChangePayload {
  nodeId: string;
  incomingCount: number;
}
