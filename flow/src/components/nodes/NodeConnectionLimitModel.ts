import { type BaseNodeModel, type Model, LogicFlow } from "@logicflow/core";
import { VueNodeModel } from "@logicflow/vue-node-registry";

// 限制节点的连接
// 节点需要再进一步自定义的，可以继承自 NodeConnectionLimitModel
// 别的节点不能连开始
// 结束节点不能连别的
// 节点不能连自己
export default class NodeConnectionLimitModel extends VueNodeModel {
  // 当前这个node作为source 时的要求
  getConnectedSourceRules(): Model.ConnectRule[] {
    const rules = super.getConnectedSourceRules();

    rules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    rules.push({
      message: "结束节点不能连接其他节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        // debugger;
        return source.type != "end-node";
      },
    });

    return rules;
  }

  // 当前这个node 作为target 时的要求
  getConnectedTargetRules(): Model.ConnectRule[] {
    const rules = super.getConnectedTargetRules();

    rules.push({
      // 禁止连接自己
      message: "节点不能连接自己",
      validate: (source, target) => {
        return source !== target;
      },
    });

    rules.push({
      message: "其他节点不能连接开始节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        // debugger;
        return target.type != "start-node";
      },
    });

    return rules;
  }

  // 自定义节点hover时的样式
  getOutlineStyle(): LogicFlow.OutlineTheme {
    const style = super.getOutlineStyle();

    const props = this.getProperties(); // 获取的就是 add 时设置的properties 对象
    // console.log(
    //   "🚀 ~ NodeConnectionLimitModel.ts:60 ~ NodeConnectionLimitModel ~ getOutlineStyle ~ props:",
    //   props,
    // );
    if (props.hoverOutlineColor) {
      const newStyle = Object.assign({}, style, {
        hover: {
          stroke: props.hoverOutlineColor,
        },
      });
      return newStyle;
    }
    return style;
  }
}
