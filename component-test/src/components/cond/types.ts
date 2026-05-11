export type Logic = 'and' | 'or'

export type ValueType = 'string' | 'number' | 'date' | 'boolean' | 'enum'

export interface FieldOption {
  key: string
  label: string
  type: ValueType
  enumOptions?: { value: string | number; label: string }[]
}

export interface OperatorOption {
  value: string
  label: string
  /** 此操作符不需要值（如 为空 / 不为空） */
  noValue?: boolean
}

export interface Condition {
  id: string
  type: 'condition'
  field: string
  operator: string
  value: unknown
}

export interface ConditionGroup {
  id: string
  type: 'group'
  logic: Logic
  children: CondNode[]
}

export type CondNode = Condition | ConditionGroup

export const OPERATORS_BY_TYPE: Record<ValueType, OperatorOption[]> = {
  string: [
    { value: 'eq', label: '等于' },
    { value: 'neq', label: '不等于' },
    { value: 'contains', label: '包含' },
    { value: 'startsWith', label: '以...开头' },
    { value: 'endsWith', label: '以...结尾' },
    { value: 'isEmpty', label: '为空', noValue: true },
    { value: 'isNotEmpty', label: '不为空', noValue: true },
  ],
  number: [
    { value: 'eq', label: '=' },
    { value: 'neq', label: '≠' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '≥' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '≤' },
  ],
  date: [
    { value: 'eq', label: '等于' },
    { value: 'gt', label: '晚于' },
    { value: 'lt', label: '早于' },
  ],
  boolean: [
    { value: 'eq', label: '是' },
  ],
  enum: [
    { value: 'eq', label: '是' },
    { value: 'neq', label: '不是' },
  ],
}

let idSeed = 0
export function genId(prefix: 'c' | 'g' = 'c'): string {
  idSeed += 1
  return `${prefix}_${Date.now().toString(36)}_${idSeed}`
}

export function defaultValueFor(field: FieldOption): unknown {
  switch (field.type) {
    case 'number':
      return 0
    case 'boolean':
      return true
    case 'enum':
      return field.enumOptions?.[0]?.value ?? ''
    case 'date':
      return ''
    default:
      return ''
  }
}

export function createCondition(field: FieldOption): Condition {
  const ops = OPERATORS_BY_TYPE[field.type]
  return {
    id: genId('c'),
    type: 'condition',
    field: field.key,
    operator: ops[0].value,
    value: defaultValueFor(field),
  }
}

export function createGroup(logic: Logic = 'and', children: CondNode[] = []): ConditionGroup {
  return {
    id: genId('g'),
    type: 'group',
    logic,
    children,
  }
}
