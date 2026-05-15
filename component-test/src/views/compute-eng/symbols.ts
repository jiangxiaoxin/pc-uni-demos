export const NODE_CONFIGS_KEY = Symbol("compute-node-configs");
export const GET_GRAPH_DATA_FN_KEY = Symbol("GET_GRAPH_DATA_FN_KEY");

export const down_policy_all = "all"
export const down_policy_first = "first"
export const down_policy_options = [
    {
        value: down_policy_all,
        label: '全部满足的下游都执行'
    },
    {
        value: down_policy_first,
        label: '按优先级只执行第一个'
    }
]
export const execute_engine_aviator = 'AVIATOR'
export const execute_engine_assign = 'ASSIGN'
export const execute_engine_options = [
    {
        value: execute_engine_aviator,
        label: 'Aviator条件判断'
    },
    {
        value: execute_engine_assign,
        label: 'Aviator赋值'
    },
]

export const calc_mode_direct = "direct"
export const calc_mode_math = "math"
export const calc_mode_options = [
    {
        value: calc_mode_direct,
        label: '直接取值'
    },
    {
        value: calc_mode_math,
        label: '数学运算'
    }
]