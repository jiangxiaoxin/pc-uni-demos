import type { InputField } from "../types";

const NUMERIC_FIELD_TYPES = new Set([
  'number'
]);

const STRING_FIELD_TYPES = new Set([
  'string'
]);

const DATETIME_FIELD_TYPES = new Set([
  'datetime'
]);

export const isNumericFieldType = (type: string) => {
  return NUMERIC_FIELD_TYPES.has(type.toLowerCase()); // 转成小写方便统一处理
};

export const isStringFieldType = (type: string) => {
  return STRING_FIELD_TYPES.has(type.toLowerCase());
};

export const isDateTimeFieldType = (type: string) => {
  return DATETIME_FIELD_TYPES.has(type.toLowerCase());
};

// 定义 WhereRelation 类型
export type WhereRelation = 
  | "eq" 
  | "ne" 
  | "isEmpty" 
  | "notEmpty" 
  | "contains" 
  | "notContains" 
  | "startsWith" 
  | "endsWith" 
  | "in" 
  | "notIn" 
  | "gt" 
  | "lt" 
  | "gte" 
  | "lte" 
  | "range";

// 定义 SelectOption 类型
export interface SelectOption {
  label: string;
  value: string;
}

// 定义 LocalWhereCondition 接口
export interface LocalWhereCondition {
  key: string;
  fieldName: string;
  fieldType: string;
  relation: WhereRelation;
  value: string;
  rangeValue: [string, string];
}

// 获取默认的关系类型
export const getDefaultRelation = (fieldType: string): WhereRelation => {
  if (isNumericFieldType(fieldType) || isDateTimeFieldType(fieldType)) {
    return "eq";
  }
  if (isStringFieldType(fieldType)) {
    return "contains";
  }
  return "eq";
};

// 获取关系选项列表
export const getRelationOptions = (fieldType: string): SelectOption[] => {
  const common = [
    { label: "等于", value: "eq" },
    { label: "不等于", value: "ne" },
    { label: "为空", value: "isEmpty" },
    { label: "不为空", value: "notEmpty" },
  ];

  if (isStringFieldType(fieldType)) {
    return [
      ...common,
      { label: "包含", value: "contains" },
      { label: "不包含", value: "notContains" },
      { label: "以...开始", value: "startsWith" },
      { label: "以...结束", value: "endsWith" },
      { label: "等于任一一个", value: "in" },
      { label: "不等于任一一个", value: "notIn" },
    ];
  }

  if (isNumericFieldType(fieldType) || isDateTimeFieldType(fieldType)) {
    return [
      ...common,
      { label: "大于", value: "gt" },
      { label: "小于", value: "lt" },
      { label: "大于等于", value: "gte" },
      { label: "小于等于", value: "lte" },
      { label: "选择范围", value: "range" },
    ];
  }

  return common;
};

// 判断是否为无需值的关系类型
export const isNoValueRelation = (relation: WhereRelation): boolean => {
  return relation === "isEmpty" || relation === "notEmpty";
};

 export const generateId = () => {
    return `where-cond-${Math.ceil(Math.random() * 1000000)}-${Date.now().toString(36)}`;
  };


/**
   * 选择字段类型选择默认的关系
   * @param fields 前序节点传入的字段列表
   */
  export const buildDefaultCondition = (fields: InputField[]): LocalWhereCondition | null => {
    if (fields.length === 0) return null;
    const field = fields[0];
    const relation = getDefaultRelation(field.type);
    return {
      key: field.key,
      fieldName: field.name,
      fieldType: field.type,
      relation,
      value: "",
      rangeValue: ["", ""],
    };
  };