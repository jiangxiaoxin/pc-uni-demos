// SQL 节点类型定义

const Number_180 = 180;
const Number_40 = 40;

export interface NodeType {
  type: string;
  name: string;
  color: string;
  title: string;
  icon: string;
  anchors: {
    in: boolean;
    out: boolean;
  };
  defaultConfig: {
    width: number;
    height: number;
    requiredMinIncoming?: number;
    emptyLinkTip?: string;
  };
}

const node_empty_link_tip1 = "请将 1 个节点连接至本节点"
const node_empty_link_tip2 = "请将 2 个节点连接至本节点"
const node_empty_link_tip3 = "请将 2 个及以上节点连接至本节点"

export const nodeTypes: NodeType[] = [
  {
    type: "in-node",
    name: "数据输入",
    title: "数据输入",
    icon: "database",
    color: "#1890ff",
    anchors: { in: false, out: true }, // 只有输出
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 0,
    },
  },
  {
    type: "out-node",
    name: "数据输出",
    title: "数据输出",
    icon: "export",
    color: "#52c41a",
    anchors: { in: true, out: false }, // 只有输入
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 1,
      emptyLinkTip: node_empty_link_tip1,
    },
  },
  {
    type: "join-node",
    name: "横向连接",
    title: "横向连接",
    icon: "join",
    color: "#722ed1",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 2,
      emptyLinkTip: node_empty_link_tip2
    },
  },
  {
    type: "union-node",
    name: "追加合并",
    title: "追加合并",
    icon: "merge",
    color: "#2f54eb",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 2,
      emptyLinkTip: node_empty_link_tip3
    },
  },
  {
    type: "group-node",
    name: "分组汇总",
    title: "分组汇总",
    icon: "functions",
    color: "#eb2f96",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 1,
      emptyLinkTip: node_empty_link_tip1
    },
  },
  {
    type: "where-node",
    name: "数据筛选",
    title: "数据筛选",
    icon: "filter",
    color: "#fa8c16",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 1,
      emptyLinkTip: node_empty_link_tip1
    },
  },
  {
    type: "field-node",
    name: "字段设置",
    title: "字段设置",
    icon: "text",
    color: "#13c2c2",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 1,
      emptyLinkTip: node_empty_link_tip1
    },
  },
  {
    type: "distinct-node",
    name: "去重",
    title: "去重",
    icon: "cut",
    color: "#fa541c",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
      requiredMinIncoming: 1,
      emptyLinkTip: node_empty_link_tip1
    },
  },
];

/**
 * 根据类型获取节点配置
 */
export function getNodeTypeConfig(type: string): NodeType | undefined {
  return nodeTypes.find((node) => node.type === type);
}
