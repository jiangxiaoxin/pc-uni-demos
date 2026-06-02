import { type BaseNodeModel, type Model, LogicFlow } from "@logicflow/core";
import { VueNodeModel } from "@logicflow/vue-node-registry";
import { NODE_TYPE, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from "../menus";

export default class FlowNodeModel extends VueNodeModel {
  setAttributes(): void {
    const props = this.getProperties();
    this.width = props.width || DEFAULT_NODE_WIDTH;
    this.height = props.height || DEFAULT_NODE_HEIGHT;
  }

  initNodeData(data: LogicFlow.NodeConfig): void {
    super.initNodeData(data);

    const nodeType = this.type;

    // ========== sourceRules: 控制该节点能否作为起点连接出去 ==========

    // 规则1: 节点不能连接自己
    this.sourceRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    // 规则2: 结束节点不能连接其他节点（它是终点）
    this.sourceRules.push({
      message: "结束节点不能连接其他节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        if (nodeType === NODE_TYPE.END) {
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
        const alreadyConnected = outgoing.some(
          (node) => node.id === target?.id,
        );
        return !alreadyConnected;
      },
    });

    // ========== targetRules: 控制其他节点能否连接到这个节点 ==========

    // 规则4: 节点不能连接自己
    this.targetRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    // 规则5: 节点之间不能多次连接
    this.targetRules.push({
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (!target) return true;
        const incoming = target.graphModel.getNodeIncomingNode(target.id);
        const alreadyConnected = incoming.some(
          (node) => node.id === source?.id,
        );
        return !alreadyConnected;
      },
    });
  }

  getDefaultAnchor(): Model.AnchorConfig[] {
    const { x, y, id, type } = this as any;
    const props = this.getProperties();
    const width = props.width || DEFAULT_NODE_WIDTH;
    const height = props.height || DEFAULT_NODE_HEIGHT;

    const inAnchor = {
      x: x,
      y: y - height / 2,
      id: `${id}-in`,
      name: `${id}-in`,
      cusType: "in" as const,
      edgeAddable: false,
    };

    const outAnchor = {
      x: x,
      y: y + height / 2,
      id: `${id}-out`,
      name: `${id}-out`,
      cusType: "out" as const,
    };

    switch (type) {
      case NODE_TYPE.START:
        return [inAnchor, outAnchor];
      case NODE_TYPE.END:
        return [inAnchor];
      default:
        return [inAnchor, outAnchor];
    }
  }

  getTargetAnchor(position: LogicFlow.Point): Model.AnchorInfo {
    const anchors = this.anchors || [];
    const inputIndex = anchors.findIndex((item) => item.cusType === "in");
    if (inputIndex !== -1) {
      return {
        index: inputIndex,
        anchor: anchors[inputIndex],
      };
    }
    return super.getTargetAnchor(position);
  }

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
