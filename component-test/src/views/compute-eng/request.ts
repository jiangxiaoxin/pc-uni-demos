export function getDetail() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        nodes: [
          {
            id: "task_1",
            type: "task",
            x: 500,
            y: 100,
            properties: {
              name: "任务节点",
              title: "我代表整个任务",
              color: "#fa8c16",
              icon: "📋",
              hoverOutlineColor: "#fa8c16",
              width: 260,
              height: 64,
            },
          },
          {
            id: "start_1",
            type: "start",
            x: 200,
            y: 100,
            properties: {
              name: "开始节点",
              title: "开始",
              color: "#52c41a",
              icon: "▶",
              hoverOutlineColor: "#52c41a",
              width: 160,
              height: 36,
            },
          },
          {
            id: "action_1",
            type: "action",
            x: 200,
            y: 220,
            properties: {
              name: "动作节点",
              title: "处理数据",
              color: "#1890ff",
              icon: "⚡",
              hoverOutlineColor: "#1890ff",
              width: 160,
              height: 36,
            },
          },
          {
            id: "action_2",
            type: "action",
            x: 200,
            y: 340,
            properties: {
              name: "动作节点",
              title: "验证结果",
              color: "#1890ff",
              icon: "⚡",
              hoverOutlineColor: "#1890ff",
              width: 160,
              height: 36,
            },
          },
          {
            id: "end_1",
            type: "end",
            x: 200,
            y: 460,
            properties: {
              name: "结束节点",
              title: "结束",
              color: "#ff4d4f",
              icon: "■",
              hoverOutlineColor: "#ff4d4f",
              width: 160,
              height: 36,
            },
          },
        ],
        edges: [
          {
            id: "edge_1",
            type: "bezier",
            sourceNodeId: "start_1",
            targetNodeId: "action_1",
          },
          {
            id: "edge_2",
            type: "bezier",
            sourceNodeId: "action_1",
            targetNodeId: "action_2",
          },
          {
            id: "edge_3",
            type: "bezier",
            sourceNodeId: "action_2",
            targetNodeId: "end_1",
          },
        ],
        configs: {
          task_1: {
            age: 18,
            addr: "北京",
            birthday: "2020-01-01"
          }
        }
      });
    }, 1000);
  });
}
