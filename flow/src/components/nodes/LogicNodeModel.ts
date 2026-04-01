import { type BaseNodeModel, type Model, LogicFlow } from "@logicflow/core";
import { VueNodeModel } from "@logicflow/vue-node-registry";

// 限制节点的连接.在这个model 里做了统一的连接限制
// 节点需要再进一步自定义的，可以继承自 BaseNodeModel
// 别的节点不能连开始
// 结束节点不能连别的
// 节点不能连自己
// 抄送节点不能连别的，抄送节点只能有一个接入点
export default class LogicNodeModel extends VueNodeModel {
  initNodeData(data: LogicFlow.NodeConfig): void {
    super.initNodeData(data);

    this.sourceRules.push({
      message: "节点不能连接自己",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source !== target;
      },
    });

    this.sourceRules.push({
      message: "结束节点不能连接其他节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        // debugger;
        return source.type != "end-node";
      },
    });

    this.sourceRules.push({
      message: "抄送节点不能连接其他节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        return source.type != "copy-node";
      },
    });

    this.sourceRules.push({
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
    });

    this.targetRules.push({
      // 禁止连接自己
      message: "节点不能连接自己",
      validate: (source, target) => {
        return source !== target;
      },
    });

    this.targetRules.push({
      message: "其他节点不能连接开始节点",
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        // debugger;
        return target.type != "start-node";
      },
    });

    this.targetRules.push({
      message: "抄送节点只能有一个接入点",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel) => {
        if (target?.type == "copy-node") {
          const incoming = target?.graphModel.getNodeIncomingNode(target.id);

          return !incoming?.length;
        }
        return true;
      },
    });

    this.targetRules.push({
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
    });
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
// 设置节点的锚点
  getDefaultAnchor(): Model.AnchorConfig[] {
    console.log('getDefaultAnchor11111', this);
    
    const {width, height, x, y, id, type} = this as any
    // console.log("🚀 ~ LogicNodeModel.ts:127 ~ LogicNodeModel ~ getDefaultAnchor ~ type:", type)
    const inAnchor = {
        x: x-width/2,
        y: y,
        id: `${id}-in`,
        name: `${id}-in`,
        cusType: 'in'
      }
      const outAnchor = {
        x: x+width/2,
        y: y,
        id: `${id}-out`,
        name: `${id}-out`,
        cusType: 'out'
      }
    if(type == "start-node"){
      return [
        outAnchor
      ]
    } else if(type == "end-node"){
      return [
        inAnchor
      ]
    } else if(type == 'copy-node') {
      return [
        inAnchor
      ]
    } else {
      return [inAnchor ,outAnchor]
    }

    // return super.getDefaultAnchor()
  }

  getTargetAnchor(position: LogicFlow.Point): Model.AnchorInfo {
    const {type} = this as any
    if(type == "start-node"){
      return super.getTargetAnchor(position);
    } else if(type == "end-node") {
        // debugger
      return super.getTargetAnchor(position);
        
    } else if(type == 'copy-node') {
      return super.getTargetAnchor(position);
    } else {
      

      // // this.anchors 为节点上所有锚点（已换算到画布坐标）
        const anchors = this.anchors || [];
        const incomeIndex = anchors.findIndex(item => item.cusType == 'in')
         return {
          index: incomeIndex,
          anchor: anchors[incomeIndex],
        };
    }
    // return super.getTargetAnchor(position);
  }
}
