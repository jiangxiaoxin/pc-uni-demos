import { type BaseNodeModel, type Model, LogicFlow } from "@logicflow/core";
import { VueNodeModel } from "@logicflow/vue-node-registry";

/**
 * SQL 节点通用 Model
 *
 * 连线规则：
 * 1. in-node (数据输入): 只有输出锚点，只能连出到其他节点
 * 2. out-node (数据输出): 只有输入锚点，只能接收一条连接
 * 3. where-node, field-node, group-node, distinct-node: 单输入限制（1条）
 * 4. join-node (横向连接): 双输入限制（最多2条）
 * 5. union-node (追加合并): 多输入（不限制）
 */
export default class SqlNodeModel extends VueNodeModel {
  initNodeData(data: LogicFlow.NodeConfig): void {
    super.initNodeData(data);

    const nodeType = this.type;

    // ========== 源节点规则 (sourceRules): 控制该节点能否作为起点连接出去 ==========

    // 规则1: 节点不能连接自己
    this.sourceRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    // 规则2: out-node (数据输出) 不能连接其他节点（它是终点）
    this.sourceRules.push({
      message: "数据输出节点不能连接其他节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        if (nodeType === "out-node") {
          return false;
        }
        return true;
      },
    });

    // 规则3: 节点之间不能多次连接
    this.sourceRules.push({
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (!source) return true;
        const outgoing = source.graphModel.getNodeOutgoingNode(source.id);
        const alreadyConnected = outgoing.some((node) => node.id === target?.id);
        return !alreadyConnected;
      },
    });

    // ========== 目标节点规则 (targetRules): 控制其他节点能否连接到这个节点 ==========

    // 规则4: 节点不能连接自己
    this.targetRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    // 规则5: in-node (数据输入) 不能作为连接目标（它是起点）
    this.targetRules.push({
      message: "数据输入节点不能作为连接目标",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        if (nodeType === "in-node") {
          return false;
        }
        return true;
      },
    });

    // 规则6: out-node (数据输出) 只能有一个前置节点连接
    this.targetRules.push({
      message: "数据输出节点只能由一个前置节点连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (nodeType === "out-node" && target) {
          const incoming = target.graphModel.getNodeIncomingNode(target.id);
          // 如果已经有输入连接，则不能再连接
          return incoming.length === 0;
        }
        return true;
      },
    });

    // 规则7: 单输入节点 (where-node, field-node, group-node, distinct-node) 只允许一条边连接
    // 注意: join-node 和 union-node 是多输入节点，不在此限制
    this.targetRules.push({
      message: "节点输入连线超出限制",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        // 单输入节点列表（join-node 和 union-node 是多输入，不限制）
        const singleInputNodes = [
          "where-node",
          "field-node",
          "group-node",
          "distinct-node",
        ];
        if (singleInputNodes.includes(nodeType) && target) {
          const incoming = target.graphModel.getNodeIncomingNode(target.id);
          // 如果已经有输入连接，则不能再连接
          return incoming.length === 0;
        }
        return true;
      },
    });

    // 规则8: join-node (横向连接) 最多只能有 2 条边连接
    this.targetRules.push({
      message: "横向连接节点最多只能有两个前置节点连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (nodeType === "join-node" && target) {
          const incoming = target.graphModel.getNodeIncomingNode(target.id);
          // 如果已经有 2 个或更多输入连接，则不能再连接
          return incoming.length < 2;
        }
        return true;
      },
    });

    // 规则9: 节点之间不能多次连接
    this.targetRules.push({
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (!target) return true;
        const incoming = target.graphModel.getNodeIncomingNode(target.id);
        const alreadyConnected = incoming.some((node) => node.id === source?.id);
        return !alreadyConnected;
      },
    });
  }

  /**
   * 根据节点类型设置不同的锚点
   * - in-node: 只有输出锚点（右侧）
   * - out-node: 只有输入锚点（左侧）
   * - 其他: 左侧输入，右侧输出
   */
  getDefaultAnchor(): Model.AnchorConfig[] {
    const { x, y, id, type } = this as any;
    // 从 properties 获取宽高，或使用默认值
    const props = this.getProperties();
    const width = props.width || 180;
    const height = props.height || 40;

    const inAnchor = {
      x: x - width / 2,
      y: y,
      id: `${id}-in`,
      name: `${id}-in`,
      cusType: "in" as const,
      edgeAddable: false, // 输入锚点不能拖出连线（左侧只能接收）
    };

    const outAnchor = {
      x: x + width / 2,
      y: y,
      id: `${id}-out`,
      name: `${id}-out`,
      cusType: "out" as const,
    };

    switch (type) {
      case "in-node":
        // 数据输入节点只有输出锚点（右侧）
        return [outAnchor];
      case "out-node":
        // 数据输出节点只有输入锚点（左侧）
        return [inAnchor];
      default:
        // 中间节点有输入（左侧）和输出（右侧）
        return [inAnchor, outAnchor];
    }
  }

  /**
   * 设置目标锚点
   * 当连线连接到该节点时，自动选择正确的输入锚点
   */
  getTargetAnchor(position: LogicFlow.Point): Model.AnchorInfo {
    const { type } = this as any;
    const anchors = this.anchors || [];

    // 找到输入锚点（左侧）
    const inputIndex = anchors.findIndex((item) => item.cusType === "in");
    if (inputIndex !== -1) {
      return {
        index: inputIndex,
        anchor: anchors[inputIndex],
      };
    }

    // 如果没有输入锚点，使用父类默认行为
    return super.getTargetAnchor(position);
  }

  /**
   * 自定义节点 hover 样式
   */
  getOutlineStyle(): LogicFlow.OutlineTheme {
    const style = super.getOutlineStyle();
    const props = this.getProperties();

    if (props.color) {
      return Object.assign({}, style, {
        hover: {
          stroke: props.color,
        },
      });
    }

    return style;
  }
}
