import { v4 as uuidv4 } from "uuid";

export type Logic = "AND" | "OR";

export const value_type_string = "STRING"
export const value_type_number = "NUMBER"
export const value_type_boolean = "BOOLEAN"

export type ValueType = typeof value_type_string | typeof value_type_number | typeof value_type_boolean;

export interface Condition {
  id: string;
  type: "CONDITION";
  [key: string]: any;
}

export interface ConditionGroup {
  id: string;
  type: "group";
  logic: Logic;
  children: CondNode[];
}

export type CondNode = Condition | ConditionGroup;

export const  value_type_options = [
    {
        value: 'STRING',
        label: '字符串'
    },
    {
        value: 'NUMBER',
        label: '数字'
    },
    {
        value: 'BOOLEAN',
        label: '布尔值'
    }
]

export const bool_options = [
  {
    value: 1,
    label:'真'
  },
  {
    value: 0,
    label:'假'
  }
]

export const OPERATORS = [
  { value: "EQ", label: "等于" },
  { value: "NE", label: "不等于" },
  { value: "GT", label: "大于" },
  { value: 'GE', label: "大于等于" },
  { value: "LT", label: "小于" },
  { value: 'LE', label: "小于等于" },
];

export function genId(prefix: "c" | "g" = "c"): string {
  return `${prefix}_${uuidv4()}`;
}

export const condition_source_customize = "customize";
export const condition_source_point = "DEVICE_POINT";
export const condition_source_template = "DEVICE_ACTION";
export const condition_source_node = "GRAPH_VARIABLE"
export const condition_source_options = [
  {
    value: condition_source_node,
    label: "图内节点变量"
  },
  // {
  //   value: condition_source_customize,
  //   label: "自定义字段",
  // },
  {
    value: condition_source_point,
    label: "设备点位",
  },
  {
    value: condition_source_template,
    label: "设备动作模板",
  },
];

export function createDefaultCondition(): Condition {
  return {
    id: genId("c"),
    type: "CONDITION",
    conditionSource: condition_source_options[0].value, // 条件来源
    field: "", // 字段
    operator: undefined, // 比较符
    valueType: undefined, // 值类型
    value: undefined, // 值
    point: "", // 设备点位
    template: undefined, // 设备动作模板
    nodeId: undefined, // 节点id
  };
}

export function createDefaultGroup(): ConditionGroup {
  return {
    id: genId("g"),
    type: "group",
    logic: "AND",
    children: [createDefaultCondition(), createDefaultCondition(),],
  };
}
