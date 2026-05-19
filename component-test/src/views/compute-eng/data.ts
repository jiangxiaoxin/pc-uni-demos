const testData = {
  nodes: [
    {
      id: "task_1779087145695",
      type: "task",
      x: 391,
      y: 118,
      properties: {
        name: "任务节点",
        title: "任务",
        color: "#fa8c16",
        icon: "📋",
        hoverOutlineColor: "#fa8c16",
        width: 260,
        height: 64,
      },
    },
    {
      id: "action_1779087256586",
      type: "action",
      x: 506,
      y: 253,
      properties: {
        name: "动作节点",
        title: "动作1",
        color: "#1890ff",
        icon: "⚡",
        hoverOutlineColor: "#1890ff",
        width: 160,
        height: 36,
      },
    },
    {
      id: "action_1779087257894",
      type: "action",
      x: 453,
      y: 362,
      properties: {
        name: "动作节点",
        title: "动作2",
        color: "#1890ff",
        icon: "⚡",
        hoverOutlineColor: "#1890ff",
        width: 160,
        height: 36,
      },
    },
    {
      id: "start_1779087262094",
      type: "start",
      x: 712,
      y: 150,
      properties: {
        name: "开始节点",
        title: "开始1",
        color: "#52c41a",
        icon: "▶",
        hoverOutlineColor: "#52c41a",
        width: 160,
        height: 36,
      },
    },
    {
      id: "end_1779087270547",
      type: "end",
      x: 535,
      y: 474,
      properties: {
        name: "结束节点",
        title: "结束",
        color: "#ff4d4f",
        icon: "■",
        hoverOutlineColor: "#ff4d4f",
        width: 160,
        height: 36,
      },
    },
    {
      id: "start_1779096349492",
      type: "start",
      x: 151,
      y: 238,
      properties: {
        name: "开始节点",
        title: "开始2",
        color: "#52c41a",
        icon: "▶",
        hoverOutlineColor: "#52c41a",
        width: 160,
        height: 36,
      },
    },
    {
      id: "action_1779096351343",
      type: "action",
      x: 139,
      y: 368,
      properties: {
        name: "动作节点",
        title: "动作左边",
        color: "#1890ff",
        icon: "⚡",
        hoverOutlineColor: "#1890ff",
        width: 160,
        height: 36,
      },
    },
    {
      id: "action_1779096354859",
      type: "action",
      x: 256,
      y: 449,
      properties: {
        name: "动作节点",
        title: "动作右边",
        color: "#1890ff",
        icon: "⚡",
        hoverOutlineColor: "#1890ff",
        width: 160,
        height: 36,
      },
    },
    {
      id: "action_1779096476798",
      type: "action",
      x: 723,
      y: 366,
      properties: {
        name: "动作节点",
        title: "动作3",
        color: "#1890ff",
        icon: "⚡",
        hoverOutlineColor: "#1890ff",
        width: 160,
        height: 36,
      },
    },
  ],
  edges: [
    {
      id: "2c925840-d0b1-4e11-8947-6ceeebf50d09",
      type: "bezier",
      properties: {},
      sourceNodeId: "start_1779087262094",
      targetNodeId: "action_1779087256586",
      sourceAnchorId: "start_1779087262094-out",
      targetAnchorId: "action_1779087256586-in",
      startPoint: {
        x: 712,
        y: 168,
      },
      endPoint: {
        x: 506,
        y: 235,
      },
      pointsList: [
        {
          x: 712,
          y: 168,
        },
        {
          x: 712,
          y: 268,
        },
        {
          x: 506,
          y: 135,
        },
        {
          x: 506,
          y: 235,
        },
      ],
    },
    {
      id: "f1d352ca-8bc0-43c7-a825-981e35066147",
      type: "bezier",
      properties: {},
      sourceNodeId: "action_1779087256586",
      targetNodeId: "action_1779087257894",
      sourceAnchorId: "action_1779087256586-out",
      targetAnchorId: "action_1779087257894-in",
      startPoint: {
        x: 506,
        y: 271,
      },
      endPoint: {
        x: 453,
        y: 344,
      },
      pointsList: [
        {
          x: 506,
          y: 271,
        },
        {
          x: 506,
          y: 371,
        },
        {
          x: 453,
          y: 244,
        },
        {
          x: 453,
          y: 344,
        },
      ],
    },
    {
      id: "c83c22ae-553c-43e0-881b-20dfd236479c",
      type: "bezier",
      properties: {},
      sourceNodeId: "action_1779087257894",
      targetNodeId: "end_1779087270547",
      sourceAnchorId: "action_1779087257894-out",
      targetAnchorId: "end_1779087270547-in",
      startPoint: {
        x: 453,
        y: 380,
      },
      endPoint: {
        x: 535,
        y: 456,
      },
      pointsList: [
        {
          x: 453,
          y: 380,
        },
        {
          x: 453,
          y: 480,
        },
        {
          x: 535,
          y: 356,
        },
        {
          x: 535,
          y: 456,
        },
      ],
    },
    {
      id: "3c1844df-f826-48ed-9494-ba51d94d94db",
      type: "bezier",
      properties: {},
      sourceNodeId: "start_1779096349492",
      targetNodeId: "action_1779096351343",
      sourceAnchorId: "start_1779096349492-out",
      targetAnchorId: "action_1779096351343-in",
      startPoint: {
        x: 151,
        y: 256,
      },
      endPoint: {
        x: 139,
        y: 350,
      },
      pointsList: [
        {
          x: 151,
          y: 256,
        },
        {
          x: 151,
          y: 356,
        },
        {
          x: 139,
          y: 250,
        },
        {
          x: 139,
          y: 350,
        },
      ],
    },
    {
      id: "2f34f448-83e4-4a64-b885-34421d5922b5",
      type: "bezier",
      properties: {},
      sourceNodeId: "start_1779096349492",
      targetNodeId: "action_1779096354859",
      sourceAnchorId: "start_1779096349492-out",
      targetAnchorId: "action_1779096354859-in",
      startPoint: {
        x: 151,
        y: 256,
      },
      endPoint: {
        x: 256,
        y: 431,
      },
      pointsList: [
        {
          x: 151,
          y: 256,
        },
        {
          x: 151,
          y: 356,
        },
        {
          x: 256,
          y: 331,
        },
        {
          x: 256,
          y: 431,
        },
      ],
    },
    {
      id: "6965c3b7-a2b2-4611-9861-6ba52cc81972",
      type: "bezier",
      properties: {},
      sourceNodeId: "action_1779087256586",
      targetNodeId: "action_1779096476798",
      sourceAnchorId: "action_1779087256586-out",
      targetAnchorId: "action_1779096476798-in",
      startPoint: {
        x: 506,
        y: 271,
      },
      endPoint: {
        x: 723,
        y: 348,
      },
      pointsList: [
        {
          x: 506,
          y: 271,
        },
        {
          x: 506,
          y: 371,
        },
        {
          x: 723,
          y: 248,
        },
        {
          x: 723,
          y: 348,
        },
      ],
    },
  ],
  configs: {
    task_1779087145695: {
      lifecycleConfigs: [
        {
          id: "lifecycle_1779087279107_sxpm42",
          name: "",
          startCondition: {
            id: "g_4256c7e3-a9cd-4d40-aff3-688c7015866a",
            type: "group",
            logic: "and",
            children: [
              {
                id: "c_f180f346-abed-4475-96a7-02a10717ad7f",
                type: "condition",
                conditionSource: "GRAPH_VARIABLE",
                field: "",
                operator: "EQ",
                valueType: "STRING",
                value: "1111",
                point: "",
                nodeId: "action_1779087256586",
              },
            ],
          },
          endConditions: [
            {
              id: "end_condition_1779087292325_7oly3d",
              name: "",
              priority: null,
              condition: {
                id: "g_e9b3a029-1057-452e-a154-74ae493511c3",
                type: "group",
                logic: "and",
                children: [
                  {
                    id: "c_858b042e-d1fc-44a7-ae22-b1a04c351ed9",
                    type: "condition",
                    conditionSource: "GRAPH_VARIABLE",
                    field: "",
                    point: "",
                  },
                  {
                    id: "c_d584d32a-936e-4961-8adc-4773d5141d81",
                    type: "condition",
                    conditionSource: "GRAPH_VARIABLE",
                    field: "",
                    point: "",
                  },
                ],
              },
              triggerNodeIds: ["action_1779087256586", "action_1779087257894"],
            },
            {
              id: "end_condition_1779087293874_9jz3ty",
              name: "",
              priority: null,
              condition: {
                id: "g_13d990d3-64a1-40a7-8a7f-95ca1b917c83",
                type: "group",
                logic: "and",
                children: [
                  {
                    id: "c_1cfbe4a2-7bef-4d56-bdea-d8e92605b660",
                    type: "condition",
                    conditionSource: "GRAPH_VARIABLE",
                    field: "",
                    point: "",
                  },
                  {
                    id: "c_83dc38a1-6e4b-43bf-a177-098a11a21a79",
                    type: "condition",
                    conditionSource: "GRAPH_VARIABLE",
                    field: "",
                    point: "",
                  },
                ],
              },
              triggerNodeIds: [],
            },
          ],
          aggregations: [
            {
              id: "aggregation_1779087305670_n29s7x",
              displayName: "1111",
              sampleMetric: "mock-device-1",
              aggregateFunction: "COUNT",
              condition: {
                id: "g_b0c00760-8026-416f-8e15-a34d3fa7016a",
                type: "group",
                logic: "and",
                children: [
                  {
                    id: "c_d99c0f39-a876-4823-8119-79396b31b659",
                    type: "condition",
                    conditionSource: "DEVICE_POINT",
                    field: "",
                    operator: "EQ",
                    valueType: "STRING",
                    value: "111",
                    point: "mock-device-1",
                  },
                  {
                    id: "g_d5ffbe92-d1b3-4749-9bd0-550cb2fdff74",
                    type: "group",
                    logic: "or",
                    children: [
                      {
                        id: "c_fb5fe380-9347-42f8-8d19-94924b21b54f",
                        type: "condition",
                        conditionSource: "DEVICE_POINT",
                        field: "",
                        point: "mock-device-1",
                      },
                      {
                        id: "c_df0dd30f-c871-4635-b49b-6105f242c8d9",
                        type: "condition",
                        conditionSource: "DEVICE_POINT",
                        field: "",
                        operator: "EQ",
                        valueType: "STRING",
                        value: "3333",
                        point: "mock-device-1",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
      devices: [
        {
          id: "mock-device-1",
          name: "模拟设备1",
        },
        {
          id: "mock-device-6",
          name: "模拟设备6",
        },
        {
          id: "mock-device-7",
          name: "模拟设备7",
        },
        {
          id: "mock-device-8",
          name: "模拟设备8",
        },
        {
          id: "mock-device-9",
          name: "模拟设备9",
        },
        {
          id: "mock-device-10",
          name: "模拟设备10",
        },
      ],
    },
    action_1779087256586: {
      priority: 1,
      downPolicy: "all",
      executeEngine: "AVIATOR",
      condConfig: {
        id: "g_a2e2ad8a-c632-4d94-8630-51de33d5e860",
        type: "group",
        logic: "and",
        children: [
          {
            id: "c_218d5a87-1b85-4dd6-b30f-33ddf5be49fc",
            type: "condition",
            conditionSource: "GRAPH_VARIABLE",
            field: "",
            operator: "EQ",
            valueType: "STRING",
            value: "1",
            point: "",
            nodeId: "action_1779087256586",
          },
          {
            id: "c_d15b1ff8-3d5e-4266-92b4-0261b7d42331",
            type: "condition",
            conditionSource: "GRAPH_VARIABLE",
            field: "",
            operator: "EQ",
            valueType: "STRING",
            value: "2",
            point: "",
            nodeId: "action_1779087257894",
          },
          {
            id: "g_56476e46-4a4b-4f19-a0b9-c5b1ad93783f",
            type: "group",
            logic: "and",
            children: [
              {
                id: "c_f02febff-98fe-422d-a49e-1b76c716cf06",
                type: "condition",
                conditionSource: "GRAPH_VARIABLE",
                field: "",
                operator: "EQ",
                valueType: "STRING",
                value: "3",
                point: "",
                nodeId: "start_1779087262094",
              },
            ],
          },
        ],
      },
      calcConfig: null,
      timeConfig: {
        scope: "TASK",
        interval: {
          value: 1,
          unit: "second",
        },
        maxTimes: 2,
        concurrencyPolicy: "SERIAL",
      },
    },
    action_1779087257894: {
      priority: 2,
      downPolicy: "first",
      executeEngine: "ASSIGN",
      calcConfig: {
        calcMode: "direct",
        directSource: {
          sourceType: "FIXED_VALUE",
          valueType: "STRING",
          value: "4",
        },
      },
      condConfig: null,
    },
    start_1779087262094: {},
    start_1779096349492: {},
    action_1779096351343: {},
    action_1779096354859: {},
    action_1779096476798: {
      priority: 3,
      downPolicy: "all",
      executeEngine: "ASSIGN",
      calcConfig: {
        calcMode: "math",
        directSource: {
          sourceType: "FIXED_VALUE",
        },
        mathConfig: {
          id: "mg_4dcb75db-eb3d-41b9-a5eb-08528a8eddce",
          type: "group",
          children: [
            {
              id: "m_d5244d16-2724-4c8c-84ba-a3a82de8c1b1",
              type: "item",
              sourceType: "FIXED_VALUE",
              value: "1",
              joinOperator: "ADD",
            },
            {
              id: "m_607c21bf-c57a-4563-b7f9-7040aced81d5",
              type: "item",
              sourceType: "FIXED_VALUE",
              value: "2",
              joinOperator: "SUBTRACT",
            },
            {
              id: "mg_4a6b27b1-6407-4cdc-9f94-2a223e8ba995",
              type: "group",
              children: [
                {
                  id: "m_a114864e-97e8-414f-8056-cd37da38ea7d",
                  type: "item",
                  sourceType: "FIXED_VALUE",
                  value: "3",
                  joinOperator: "MULTIPLY",
                },
                {
                  id: "m_7f9087e7-2acd-4cc4-9f6c-af0511e190af",
                  type: "item",
                  sourceType: "FIXED_VALUE",
                  value: "4",
                },
              ],
            },
          ],
        },
      },
      condConfig: null,
    },
  },
  topologyId: "", //TODO 后台生成，获取详情时后台返回
  version: "", //TODO 同上
  
};


import { condition_source_node, condition_source_point, condition_source_template } from "./condition/types";
import {NODE_TYPE} from "./menus"
import { calc_mode_direct, calc_mode_math, execute_engine_aviator, type TimeIntervalConfig, type TimerUnit } from "./symbols";
import {
  source_type_field,
  source_type_fixed,
  source_type_point,
  type MathGroup,
  type MathItem,
  type MathNode,
  type MathOperator,
} from "./calc/types";

const MILLISECONDS_BY_TIMER_UNIT: Record<TimerUnit, number> = {
  millisecond: 1,
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export function getIntervalMilliseconds(interval?: TimeIntervalConfig | null): number {
  if (!interval?.value || interval.value < 0) {
    return 0;
  }

  return interval.value * MILLISECONDS_BY_TIMER_UNIT[interval.unit];
}

const MATH_OPERATOR_SYMBOLS: Record<MathOperator, string> = {
  ADD: "+",
  SUBTRACT: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
};

function toExpressionToken(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function getMathItemExpression(item: MathItem): string {
  if (item.sourceType === source_type_fixed) {
    return toExpressionToken(item.value);
  }

  if (item.sourceType === source_type_point) {
    return toExpressionToken(item.point);
  }

  if (item.sourceType === source_type_field) {
    return toExpressionToken(item.field);
  }

  return toExpressionToken(item.value ?? item.point ?? item.field);
}

function getMathNodeExpression(node: MathNode): string {
  if (node.type === "group") {
    return getMathGroupExpression(node, false);
  }

  return getMathItemExpression(node);
}

function getMathGroupExpression(group: MathGroup, isRoot = true): string {
  const expression = group.children
    .map((child, index) => {
      const nodeExpression = getMathNodeExpression(child);

      if (index === group.children.length - 1) {
        return nodeExpression;
      }

      const operator = MATH_OPERATOR_SYMBOLS[child.joinOperator ?? "ADD"];
      return `${nodeExpression} ${operator}`;
    })
    .join(" ")
    .trim();

  return isRoot ? expression : `(${expression})`;
}

export function getMathExpression(mathConfig?: MathGroup | null): string {
  if (!mathConfig) {
    return "";
  }

  return getMathGroupExpression(mathConfig);
}


function saveToServer(data) {
    const {nodes = [], edges = [], configs = {}} = data
    data.operators = configs
    for(let i=0;i<nodes.length;i++) {
        const {id, type, properties = {}} = nodes[i]
        const config = configs[id]
        if(!config) {
            continue
        }
        if(type == NODE_TYPE.TASK) {
          delete data.operators[id] // operators 里不要包含任务类型的节点
          saveTaskNode(config, data)
        } else {
          // 节点name 在 nodes properties 里
          saveNormalNode(config) 
          config.operatorId = id
          config.operatorName = properties.name
          config.operatorType = type
          const nextNodes = edges.filter(edge => edge.sourceNodeId == id).map(edge => edge.targetNodeId)
          config.downStreams = nextNodes
        }

    }
}



function saveNormalNode(nodeConfig: any) {
  nodeConfig.scheduleMode = nodeConfig.downPolicy
  delete nodeConfig.downPolicy
  nodeConfig.timerConfig = nodeConfig.timeConfig
  delete nodeConfig.timeConfig
  nodeConfig.timerConfig.maxRuns = nodeConfig.timerConfig.maxTimes
  delete nodeConfig.timerConfig.maxTimes
  nodeConfig.timerConfig.intervalMs = getIntervalMilliseconds(nodeConfig.timerConfig.interval)
  nodeConfig.timerConfig.intervalValue = nodeConfig.timerConfig.interval.value
  nodeConfig.timerConfig.intervalUnit = nodeConfig.timerConfig.interval.unit
  delete nodeConfig.timerConfig.interval

  nodeConfig.executionLogic = {
    engine: nodeConfig.executeEngine,
    conditionConfig: {},
  }
  delete nodeConfig.executeEngine

  if(nodeConfig.executionLogic.engine == execute_engine_aviator) {
    formatStartConditionConfig([nodeConfig.condConfig])
    nodeConfig.executionLogic.conditionConfig = nodeConfig.condConfig
    delete nodeConfig.condConfig
  } else {
    // 赋值
    // 赋值包括直接取值和计算取值两种
    const calcConfig = nodeConfig.calcConfig
    delete nodeConfig.calcConfig
    calcConfig.type = calcConfig.calcMode
    delete nodeConfig.calcMode
    if(calcConfig.type == calc_mode_direct) {
      calcConfig.sourceType = calcConfig.directSource.sourceType
      calcConfig.valueType = calcConfig.directSource.valueType
      calcConfig.field = calcConfig.directSource.value
      nodeConfig.executionLogic.conditionConfig = calcConfig
    }
    if(calcConfig.type == calc_mode_math) {
      calcConfig.myexpression = getMathExpression(calcConfig.mathConfig)
      const mathConfig = calcConfig.mathConfig
      delete calcConfig.mathConfig

      function formatMathConfig(children) {
        for(let i=0;i<children.length;i++) {
          const child = children[i]
          if(child.type == "group") {
            child.type = "OPERATION" // 固定值，表示这个是组
            child.operators = []
            if(child.children && child.children.length > 0) {
              child.operators = child.children.map(one => one.joinOperator).filter(one => !!one)
              formatMathConfig(child.children)
            }
            
          }
          if(child.type == "item") {
            child.type = "VALUE" // 固定值，表示这个是项
            if(child.sourceType == source_type_field) {
              // 固定值，只要最后的value
            } else if(child.sourceType == source_type_point) {
              child.devicePointCode = child.value // 只要选定的设备点位
              delete child.value
            } else {
              // 取值字段 source_type_field
              // child.operatorId // 节点id
              // child.lifecycleId // 生命周期id
              // child.aggregateId // 聚合的id
            }
          }
        }
      }

      formatMathConfig([mathConfig])

      nodeConfig.executionLogic.conditionConfig = mathConfig


    }
    delete calcConfig.directSource
    delete calcConfig.mathConfig

    
  }

}


 const formatStartConditionConfig = (children) => {
      for(let i=0;i<children.length;i++) {
        const child = children[i]
        if(child.type == 'group') {
          // 组的字段处理一下
          child.type = 'LOGICAL'
          //TODO logic 改大写
          if(child.children && child.children.length > 0) {
            formatStartConditionConfig(child.children)
          }
        } else {
          // 这里就是项的处理
          //TODO type: condition 改大写
          child.sourceType = child.conditionSource
          delete child.conditionSource
          if(child.sourceType == condition_source_node) {
            //TODO 图内变量时，还可以选择生命周期下的聚合定义
            child.operatorId = child.nodeId
            // child.lifecycleId // 生命周期id
            // child.aggregateId // 聚合的id
            delete child.nodeId
            delete child.field
            delete child.point
            delete child.template
          } else if(child.sourceType == condition_source_point) {
            child.devicePointCode = child.point
            delete child.point
            delete child.nodeId
            delete child.field
            delete child.operatorId
            delete child.template
          } else if(child.sourceType == condition_source_template) {
            child.actionId = child.template
            delete child.point
            delete child.nodeId
            delete child.field
            delete child.operatorId
          }

        }
      }
    }

function saveTaskNode(nodeConfig: any, allData:any) {
  const {lifecycleConfigs = []} = nodeConfig
  allData.lifecycles = lifecycleConfigs // 因为任务类型的节点只有1个，所以可以直接赋值
  delete nodeConfig.lifecycleConfigs
  lifecycleConfigs.forEach(lifecycle => {
    const {id, name, startCondition = {}, endConditions = [], aggregations = []} = lifecycle
    delete lifecycle.id
    delete lifecycle.name
    delete lifecycle.startCondition
    delete lifecycle.endConditions
    delete lifecycle.aggregations
    lifecycle.lifecycleId = id
    lifecycle.lifecycleName = name
    
  
    formatStartConditionConfig([startCondition])
    const terminateSignals = endConditions.map(endCondition => {
      const newResult:any = {}
      const {id, name, priority, condition = {},triggerNodeIds = []} = endCondition
      newResult.signalId = id
      newResult.signalName = name
      newResult.priority = priority
      newResult.triggerOperators = triggerNodeIds
      formatStartConditionConfig([condition])
      newResult.conditionConfig = condition
      return newResult
    })
    const aggregates = aggregations.map(aggregate => {
      const newResult: any = {}
      const {id,displayName,aggregateFunction,sampleMetric,condition = [] } = aggregate
      newResult.aggregateId = id
      newResult.aggregateName = displayName
      newResult.aggregateFunction = aggregateFunction
      newResult.pointCode = sampleMetric
      formatStartConditionConfig([condition])
      newResult.sampleConditionConfig = condition
      return newResult
    })
    lifecycle.startConditionConfig = startCondition
    lifecycle.terminateSignals = terminateSignals
    lifecycle.aggregates = aggregates
  })

}

saveToServer(testData)
