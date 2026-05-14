const data = {
    nodes: [
        {
            id: '1',
            x: 100,
            y: 100,
            type: 'start', // task end action 
            config: {}
        },
        {
            id: '2',
            x: 200,
            y: 100,
            type: 'action',
        },
        {
            id: '1111',
            x: 300,
            y: 100,
            type: 'task',
        }
    ],
    edges: [
        {
            source: 1,
            target: 2,
            // xxxxxx
        },
        {
            source: 1,
            target: 3
        }
    ],
    configs: { // nodeid----nodeconfig
        "1": {
            title: '算子名称',
            sortNo: '优先级',
            "下游调度策略": '',
            "执行引擎": '赋值', // 枚举
            "条件判断的配置": {
                id: '',
                type: 'group', // condition,
                logic: 'and', // or,
                str: 'a and (b or c) and (d and e and f)',
                children: [
                    {
                        id: '',
                        type: 'condition',
                        "条件来源"： '',
                        "字段": "",
                        "比较符"： “”，
                        “值类型”： “”，
                        “值”： “”，
                        “设备点位”： “”，
                        “设备动作：： ”“

                    }, // 条件
                    {}, // 条件组
                ]
            },
            "赋值的配置": {
                type: '直接取值',//计算
                “直接取值的配置”： {
                    “来源类型”： “”，
                    “字段”： “”，
                    “设备点位”： “”，
                    “值类型”： “”，
                    “值”： “”
                }，
                “运算的配置”：{
                    id: '',
                    type: 'group', // ,
                    children: [
                        {
                            id: '',
                            type: '变量',

                        }, 
                        {
                            id： ‘“，
                            type: '关系'// 加 减 乘 除 且 或
                        }，
                        {
                            id: '',
                            type: '变量',

                        }, 
                        {
                            id： ‘“，
                            type: '关系'
                        }，
                        {}, // 运算组
                    ]
                }
            }，
            "定时的配置": {}
        },
        "任务节点的id": {
            "定时的配置"： {}，
            “选择的设备”： [],
            "生命周期配置": {
                "开始条件"： {}，
                "结束条件"： [{
                    ...,
                    ..
                    ....

                   “结束后的动作”： [id,id,id,id] 
                },{},{}],
                "聚合的配置"： {
                    "名字"： “”，
                    “指标”： “”，
                    “集合函数”： “”，
                    “条件配置”
                }
            }
        }
    }
}


// relation: gt lt eq neq is_null is_empty add sub mul div 