
// topologyId: "", //TODO 后台生成，获取详情时后台返回
// version: "", //TODO 同上

import {
  condition_source_node,
  condition_source_point,
  condition_source_template,
} from "./condition/types";
import { NODE_TYPE } from "./menus";
import {
  calc_mode_direct,
  calc_mode_math,
  execute_engine_aviator,
  type TimeIntervalConfig,
  type TimerUnit,
} from "./symbols";
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

export function getIntervalMilliseconds(
  interval?: TimeIntervalConfig | null,
): number {
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

export function saveToServer(data) {
  const { nodes = [], edges = [], configs = {} } = data;
  data.operators = configs;
  debugger
  for (let i = 0; i < nodes.length; i++) {
    const { id, type, properties = {} } = nodes[i];
    const config = configs[id];
    if (!config) {
      continue;
    }
    if (type == NODE_TYPE.TASK) {
      delete data.operators[id]; // operators 里不要包含任务类型的节点
      saveTaskNode(config, data);
    } else {
      // 节点name 在 nodes properties 里
      saveNormalNode(config);
      config.operatorId = id;
      config.operatorName = properties.name;
      config.operatorType = type;
      const nextNodes = edges
        .filter((edge) => edge.sourceNodeId == id)
        .map((edge) => edge.targetNodeId);
      config.downStreams = nextNodes;
    }
  }
  delete data.configs
}

function saveNormalNode(nodeConfig: any) {
  nodeConfig.scheduleMode = nodeConfig.downPolicy;
  delete nodeConfig.downPolicy;
  nodeConfig.timerConfig = nodeConfig.timeConfig;
  delete nodeConfig.timeConfig;
  nodeConfig.timerConfig.maxRuns = nodeConfig.timerConfig.maxTimes;
  delete nodeConfig.timerConfig.maxTimes;
  nodeConfig.timerConfig.intervalMs = getIntervalMilliseconds(
    nodeConfig.timerConfig.interval,
  );
  nodeConfig.timerConfig.intervalValue = nodeConfig.timerConfig.interval.value;
  nodeConfig.timerConfig.intervalUnit = nodeConfig.timerConfig.interval.unit;
  delete nodeConfig.timerConfig.interval;

  nodeConfig.executionLogic = {
    engine: nodeConfig.executeEngine,
    conditionConfig: {},
  };
  delete nodeConfig.executeEngine;

  if (nodeConfig.executionLogic.engine == execute_engine_aviator) {
    formatStartConditionConfig([nodeConfig.condConfig]);
    nodeConfig.executionLogic.conditionConfig = nodeConfig.condConfig;
    delete nodeConfig.condConfig;
  } else {
    // 赋值
    // 赋值包括直接取值和计算取值两种
    const calcConfig = nodeConfig.calcConfig;
    delete nodeConfig.calcConfig;
    calcConfig.type = calcConfig.calcMode;
    delete nodeConfig.calcMode;
    if (calcConfig.type == calc_mode_direct) {
      calcConfig.sourceType = calcConfig.directSource.sourceType;
      calcConfig.valueType = calcConfig.directSource.valueType;
      calcConfig.field = calcConfig.directSource.value;
      nodeConfig.executionLogic.conditionConfig = calcConfig;
    }
    if (calcConfig.type == calc_mode_math) {
      calcConfig.myexpression = getMathExpression(calcConfig.mathConfig);
      const mathConfig = calcConfig.mathConfig;
      delete calcConfig.mathConfig;

      function formatMathConfig(children) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.type == "group") {
            child.type = "OPERATION"; // 固定值，表示这个是组
            child.operators = [];
            if (child.children && child.children.length > 0) {
              child.operators = child.children
                .map((one) => one.joinOperator)
                .filter((one) => !!one);
              formatMathConfig(child.children);
            }
          }
          if (child.type == "item") {
            child.type = "VALUE"; // 固定值，表示这个是项
            if (child.sourceType == source_type_field) {
              // 固定值，只要最后的value
            } else if (child.sourceType == source_type_point) {
              child.devicePointCode = child.value; // 只要选定的设备点位
              delete child.value;
            } else {
              // 取值字段 source_type_field
              // child.operatorId // 节点id
              // child.lifecycleId // 生命周期id
              // child.aggregateId // 聚合的id
            }
          }
        }
      }

      formatMathConfig([mathConfig]);

      nodeConfig.executionLogic.conditionConfig = mathConfig;
    }
    delete calcConfig.directSource;
    delete calcConfig.mathConfig;
  }
}

const formatStartConditionConfig = (children) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type == "group") {
      // 组的字段处理一下
      child.type = "LOGICAL";
      //TODO logic 改大写
      if (child.children && child.children.length > 0) {
        formatStartConditionConfig(child.children);
      }
    } else {
      // 这里就是项的处理
      //TODO type: condition 改大写
      child.sourceType = child.conditionSource;
      delete child.conditionSource;
      if (child.sourceType == condition_source_node) {
        if (child.lifecycleId && child.aggregateId) {
          delete child.operatorId;
        } else if (child.nodeId) {
          child.operatorId = child.nodeId;
          delete child.lifecycleId;
          delete child.aggregateId;
        } else {
          delete child.operatorId;
          delete child.lifecycleId;
          delete child.aggregateId;
        }
        delete child.nodeId;
        delete child.field;
        delete child.point;
        delete child.template;
      } else if (child.sourceType == condition_source_point) {
        child.devicePointCode = child.point;
        delete child.point;
        delete child.nodeId;
        delete child.field;
        delete child.operatorId;
        delete child.lifecycleId;
        delete child.aggregateId;
        delete child.template;
      } else if (child.sourceType == condition_source_template) {
        child.actionId = child.template;
        delete child.point;
        delete child.nodeId;
        delete child.field;
        delete child.operatorId;
        delete child.lifecycleId;
        delete child.aggregateId;
      }
    }
  }
};

function saveTaskNode(nodeConfig: any, allData: any) {
  const { lifecycleConfigs = [], devices = [] } = nodeConfig;
  debugger
  allData.lifecycles = lifecycleConfigs; // 因为任务类型的节点只有1个，所以可以直接赋值
  delete nodeConfig.lifecycleConfigs;
  allData.deviceIds = devices.map(one => one.id) // 保存的时候，只需要保存设备id。查详情时返回的是[{id:'', name: ''}]
  delete nodeConfig.devices
  lifecycleConfigs.forEach((lifecycle) => {
    const {
      id,
      name,
      startCondition = {},
      endConditions = [],
      aggregations = [],
    } = lifecycle;
    delete lifecycle.id;
    delete lifecycle.name;
    delete lifecycle.startCondition;
    delete lifecycle.endConditions;
    delete lifecycle.aggregations;
    lifecycle.lifecycleId = id;
    lifecycle.lifecycleName = name;

    formatStartConditionConfig([startCondition]);
    const terminateSignals = endConditions.map((endCondition) => {
      const newResult: any = {};
      const {
        id,
        name,
        priority,
        condition = {},
        triggerNodeIds = [],
      } = endCondition;
      newResult.signalId = id;
      newResult.signalName = name;
      newResult.priority = priority;
      newResult.triggerOperators = triggerNodeIds;
      formatStartConditionConfig([condition]);
      newResult.conditionConfig = condition;
      return newResult;
    });
    const aggregates = aggregations.map((aggregate) => {
      const newResult: any = {};
      const {
        id,
        displayName,
        aggregateFunction,
        sampleMetric,
        condition = [],
      } = aggregate;
      newResult.aggregateId = id;
      newResult.aggregateName = displayName;
      newResult.aggregateFunction = aggregateFunction;
      newResult.pointCode = sampleMetric;
      formatStartConditionConfig([condition]);
      newResult.sampleConditionConfig = condition;
      return newResult;
    });
    lifecycle.startConditionConfig = startCondition;
    lifecycle.terminateSignals = terminateSignals;
    lifecycle.aggregates = aggregates;
  });
}


