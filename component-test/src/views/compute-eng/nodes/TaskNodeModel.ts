import { LogicFlow } from "@logicflow/core";
import { VueNodeModel } from "@logicflow/vue-node-registry";

export default class TaskNodeModel extends VueNodeModel {
  initNodeData(data: LogicFlow.NodeConfig): void {
    super.initNodeData(data);

    // 任务节点不能连接其他节点
    this.sourceRules.push({
      message: "任务节点不能连接其他节点",
      validate: () => false,
    });

    // 其他节点不能连接到任务节点
    this.targetRules.push({
      message: "任务节点不能作为连接目标",
      validate: () => false,
    });
  }

  getDefaultAnchor(): any[] {
    // 任务节点不显示锚点
    return [];
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
