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
  }
}
