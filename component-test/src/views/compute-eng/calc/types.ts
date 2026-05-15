export const source_type_fixed = 'FIXED_VALUE'
export const source_type_point = 'DEVICE_POINT'
export const source_type_field = 'FIELD'

export const source_type_options = [
  { value: source_type_fixed, label: '固定值' },
  { value: source_type_point, label: '设备点位' },
  { value: source_type_field, label: '取值字段' },
]

export {
  value_type_string,
  value_type_number,
  value_type_boolean,
  value_type_options,
  bool_options,
} from '../condition/types'

export interface DirectSourceConfig {
  sourceType: string
  valueType?: string
  value?: any
  point?: string
  field?: string
}

export interface CalcConfig {
  calcMode?: string
  directSource?: DirectSourceConfig
  mathConfig?: MathGroup
}

export function createDefaultCalc(): CalcConfig {
  return {
    calcMode: undefined,
    directSource: {
      sourceType: source_type_fixed,
      valueType: undefined,
      value: undefined,
      point: undefined,
      field: undefined,
    },
    mathConfig: undefined,
  }
}

/* ==================== 数学运算配置 ==================== */

import { v4 as uuidv4 } from 'uuid'

export type MathOperator = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'

export const math_operator_add: MathOperator = 'ADD'
export const math_operator_sub: MathOperator = 'SUBTRACT'
export const math_operator_mul: MathOperator = 'MULTIPLY'
export const math_operator_div: MathOperator = 'DIVIDE'

export const math_operator_options = [
  { value: math_operator_add, label: '加' },
  { value: math_operator_sub, label: '减' },
  { value: math_operator_mul, label: '乘' },
  { value: math_operator_div, label: '除' },
]

export interface MathItem {
  id: string
  type: 'item'
  sourceType: string
  value?: any
  point?: string
  field?: string
  joinOperator?: MathOperator  // 与下一项的运算关系
}

export interface MathGroup {
  id: string
  type: 'group'
  children: MathNode[]
  joinOperator?: MathOperator  // 与下一项的运算关系
}

export type MathNode = MathItem | MathGroup

export function genMathId(prefix: 'm' | 'mg' = 'm'): string {
  return `${prefix}_${uuidv4()}`
}

export function createDefaultMathItem(): MathItem {
  return {
    id: genMathId('m'),
    type: 'item',
    sourceType: source_type_fixed,
    value: undefined,
    point: undefined,
    field: undefined,
  }
}

export function createDefaultMathGroup(): MathGroup {
  return {
    id: genMathId('mg'),
    type: 'group',
    children: [
      { ...createDefaultMathItem(), joinOperator: math_operator_add },
      createDefaultMathItem(),
    ],
  }
}
