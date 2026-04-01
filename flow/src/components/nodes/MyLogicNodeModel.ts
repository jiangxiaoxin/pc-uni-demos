import type { BaseNodeModel, LogicFlow, Model } from "@logicflow/core";
import NodeConnectionLimitModel from "./NodeConnectionLimitModel";

export default class MyLogicNodeModel extends NodeConnectionLimitModel {

  



  // 当这个节点作为source 时的限制
  getConnectedSourceRules(): Model.ConnectRule[] {
    const rules = super.getConnectedSourceRules();

    // a连b以后，a就不能再连b，b也不能再连a
    // 只做最简单的环的判断：不让a连b，b又连a，但如果b连着c，c连着d，d又连回a那就不管了
    const rule = {
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        const outIds = source?.graphModel
          .getNodeOutgoingNode(source.id)
          .map((node) => node.id); // 获取节点所有的下一级节点
        if (target && outIds?.indexOf(target.id) !== -1) {
          return false;
        }
        const inIds = source?.graphModel
          .getNodeIncomingNode(source.id)
          .map((node) => node.id); // 获取节点所有的上一级节点
        if (target && inIds?.indexOf(target.id) !== -1) {
          return false;
        }
        return true;
      },
    };

    rules.push(rule);

    return rules;
  }

  getConnectedTargetRules(): Model.ConnectRule[] {
    const rules = super.getConnectedTargetRules();

    // a作为此次连接的target，有什么要求？？
    const rule = {
      message: "节点之间不能多次连接",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        const outIds = target?.graphModel
          .getNodeOutgoingNode(target.id)
          .map((node) => node.id); // 获取节点所有的下一级节点

        if (source && outIds?.indexOf(source.id) !== -1) {
          return false;
        }

        const inIds = target?.graphModel
          .getNodeIncomingNode(target.id)
          .map((node) => node.id); // 获取节点所有的上一级节点
        if (source && inIds?.indexOf(source.id) !== -1) {
          return false;
        }
        return true;
      },
    };

    rules.push(rule);

    return rules;
  }

  
}
