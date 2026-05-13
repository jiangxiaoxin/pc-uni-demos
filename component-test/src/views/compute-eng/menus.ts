export const NODE_TYPE = {
  START: "start",
  ACTION: "action",
  END: "end",
} as const;

export type NodeTypeValue = (typeof NODE_TYPE)[keyof typeof NODE_TYPE];

export const DEFAULT_NODE_WIDTH = 160;
export const DEFAULT_NODE_HEIGHT = 36;

export interface NodeTypeConfig {
  type: NodeTypeValue;
  name: string;
  title: string;
  color: string;
  iconBgColor: string;
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

export const nodeTypes: NodeTypeConfig[] = [
  {
    type: NODE_TYPE.START,
    name: "开始节点",
    title: "开始",
    icon: "▶",
    color: "#52c41a",
    iconBgColor: "#52c41a1A",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    },
  },
  {
    type: NODE_TYPE.ACTION,
    name: "动作节点",
    title: "动作",
    icon: "⚡",
    color: "#1890ff",
    iconBgColor: "#1890ff1A",
    anchors: { in: true, out: true },
    defaultConfig: {
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    },
  },
  {
    type: NODE_TYPE.END,
    name: "结束节点",
    title: "结束",
    icon: "■",
    color: "#ff4d4f",
    iconBgColor: "#ff4d4f1A",
    anchors: { in: true, out: false },
    defaultConfig: {
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    },
  },
];

export function getNodeTypeConfig(type: string): NodeTypeConfig | undefined {
  return nodeTypes.find((node) => node.type === type);
}
