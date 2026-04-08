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
  };
}

export const nodeTypes: NodeType[] = [
  {
    type: "in-node",
    name: "输入",
    title: "数据输入",
    icon: "database",
    color: "#1890ff",
    anchors: { in: false, out: true }, // 只有输出
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "out-node",
    name: "输出",
    title: "数据输出",
    icon: "export",
    color: "#52c41a",
    anchors: { in: true, out: false }, // 只有输入
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "join-node",
    name: "横向连接",
    title: "JOIN",
    icon: "join",
    color: "#722ed1",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "union-node",
    name: "追加合并",
    title: "UNION",
    icon: "merge",
    color: "#2f54eb",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "group-node",
    name: "分组汇总",
    title: "GROUP BY",
    icon: "functions",
    color: "#eb2f96",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "where-node",
    name: "数据筛选",
    title: "WHERE",
    icon: "filter",
    color: "#fa8c16",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "field-node",
    name: "字段设置",
    title: "AS",
    icon: "text",
    color: "#13c2c2",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
  {
    type: "distinct-node",
    name: "去重",
    title: "DISTINCT",
    icon: "cut",
    color: "#fa541c",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: Number_180,
      height: Number_40,
    },
  },
];

/**
 * 根据类型获取节点配置
 */
export function getNodeTypeConfig(type: string): NodeType | undefined {
  return nodeTypes.find((node) => node.type === type);
}
