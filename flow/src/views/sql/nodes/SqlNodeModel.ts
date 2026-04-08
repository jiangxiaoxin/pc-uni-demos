import { type BaseNodeModel, type Model, LogicFlow } from "@logicflow/core";
import { VueNodeModel } from "@logicflow/vue-node-registry";

/**
 * SQL 节点通用 Model
 * 根据节点类型自动设置不同的锚点和连接规则
 */
export default class SqlNodeModel extends VueNodeModel {
  initNodeData(data: LogicFlow.NodeConfig): void {
    super.initNodeData(data);

    const nodeType = this.type;

    // 通用连接规则
    this.sourceRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    this.sourceRules.push({
      message: "该节点不能连接其他节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        // in-node 不能有输出连接
        if (nodeType === "in-node") {
          return false;
        }
        return true;
      },
    });

    this.targetRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    this.targetRules.push({
      message: "该节点不能作为连接目标",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        // out-node 不能有输入连接
        if (nodeType === "out-node") {
          return false;
        }
        return true;
      },
    });

    this.targetRules.push({
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (!target) return true;
        const incoming = target.graphModel.getNodeIncomingNode(target.id);
        const alreadyConnected = incoming.some((node) => node.id === source?.id);
        return !alreadyConnected;
      },
    });

    this.sourceRules.push({
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (!source) return true;
        const outgoing = source.graphModel.getNodeOutgoingNode(source.id);
        const alreadyConnected = outgoing.some((node) => node.id === target?.id);
        return !alreadyConnected;
      },
    });
  }

  /**
   * 根据节点类型设置不同的锚点
   * - in-node: 只有输入锚点（左侧）
   * - out-node: 只有输出锚点（右侧）
   * - 其他: 左侧输入，右侧输出
   */
  getDefaultAnchor(): Model.AnchorConfig[] {
    const { width, height, x, y, id, type } = this as any;

    const inAnchor = {
      x: x - width / 2,
      y: y,
      id: `${id}-in`,
      name: `${id}-in`,
      cusType: "in" as const,
      edgeAddable: false, // 不能从输入锚点拖出连线
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
        // 输入节点只有输出锚点（因为它是数据源，输出数据）
        return [outAnchor];
      case "out-node":
        // 输出节点只有输入锚点（因为它是数据终点，接收数据）
        return [inAnchor];
      default:
        // 中间节点有输入和输出
        return [inAnchor, outAnchor];
    }
  }

  /**
   * 设置目标锚点
   * 当连线连接到该节点时，自动选择正确的锚点
   */
  getTargetAnchor(position: LogicFlow.Point): Model.AnchorInfo {
    const { type } = this as any;

    const anchors = this.anchors || [];

    switch (type) {
      case "in-node":
        // 输入节点没有输入锚点，返回默认
        return super.getTargetAnchor(position);
      case "out-node":
        // 输出节点只有输入锚点
        const inIndex = anchors.findIndex((item) => item.cusType === "in");
        if (inIndex !== -1) {
          return {
            index: inIndex,
            anchor: anchors[inIndex],
          };
        }
        return super.getTargetAnchor(position);
      default:
        // 中间节点，选择输入锚点
        const inputIndex = anchors.findIndex((item) => item.cusType === "in");
        if (inputIndex !== -1) {
          return {
            index: inputIndex,
            anchor: anchors[inputIndex],
          };
        }
        return super.getTargetAnchor(position);
    }
  }

  /**
   * 自定义节点 hover 样式
   * 从 properties 中读取颜色设置 outline
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
