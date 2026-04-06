import { getComps, template2 } from "./util";

export default function demo2(modeler) {
  const { elementFactory, elementRegistry, modeling, moddle, bpmnFactory } =
    getComps(modeler);

  modeler.importXML(template2).then(() => {
    const process = elementRegistry.get("Process_1");

    const startEvent = elementFactory.createShape({
      type: "bpmn:StartEvent",
    });

    // 通过 modeling 命令添加到图中
    modeling.createShape(
      startEvent,
      { x: 200, y: 100 }, // 位置
      process, // 父元素（根流程）
    );

    modeling.updateProperties(startEvent, {
      name: "我是开始",
    });

    modeling.updateProperties(startEvent, { time: new Date().toString() });

    modeling.updateProperties(startEvent, {
      name: "最后的姓名",
      time: Date.now(),
    });

    // ========== 使用原生 BPMN extensionElements ==========
    
    // 1. 创建一个 UserTask
    const userTask = elementFactory.createShape({
      type: "bpmn:UserTask",
    });
    
    modeling.createShape(
      userTask,
      { x: 400, y: 200 },
      process,
    );
    
    modeling.updateProperties(userTask, {
      name: "审批任务",
    });

    // 方式一：使用原生 BPMN 的 Documentation 存储自定义 JSON 数据
    // Documentation 是 BPMN 标准元素，所有引擎都支持
    const documentation = moddle.create("bpmn:Documentation", {
      text: JSON.stringify({
        formKey: {
          routerName: "approvalForm",
          formAuth: {},
          readOnly: true,
          groupType: "ASSIGNEE"
        },
        assignee: "${assignee}",
        operations: [
          { id: "op_001", label: "同意", type: "agree", buttonStyle: "primary" },
          { id: "op_002", label: "拒绝", type: "refuse", buttonStyle: "danger" }
        ],
        copyItems: [
          { id: "hr", type: "user" }
        ]
      }, null, 2)
    });

    // 创建 extensionElements 包含 Documentation
    const extensionElements = moddle.create("bpmn:ExtensionElements", {
      values: [documentation]
    });

    // 应用到元素
    modeling.updateProperties(userTask, {
      extensionElements: extensionElements
    });

    // 方式二：为 SequenceFlow 添加 condition
    const sequenceFlow = elementFactory.createConnection({
      type: "bpmn:SequenceFlow",
      source: startEvent,
      target: userTask
    });
    
    modeling.createConnection(
      startEvent,
      userTask,
      sequenceFlow,
      process
    );

    // 创建条件表达式（标准 BPMN 元素）
    const conditionExpression = moddle.create("bpmn:FormalExpression", {
      body: "${operationType == 'agree'}"
    });

    modeling.updateProperties(sequenceFlow, {
      conditionExpression: conditionExpression,
      name: "同意"
    });

    // 方式三：使用元素的 $attrs 直接添加自定义属性（会作为 XML 属性写入）
    // 这些属性虽然不是标准 BPMN，但可以被引擎解析
    modeling.updateProperties(userTask, {
      // 标准属性
      assignee: "${assignee}",
      dueDate: "${dateTime().plusDays(3).toDate()}",
      // 使用 $attrs 添加任意命名空间属性（如果引擎支持）
      $attrs: {
        "custom:formKey": JSON.stringify({
          routerName: "approvalForm",
          readOnly: true
        }),
        "custom:version": "1.0"
      }
    });

    // 方式四：创建多个 Documentation 元素来组织不同数据
    const docOperations = moddle.create("bpmn:Documentation", {
      id: "doc_operations",
      text: JSON.stringify([
        { label: "同意", value: "agree", style: "primary" },
        { label: "拒绝", value: "refuse", style: "danger" },
        { label: "转交", value: "transfer", style: "default" }
      ])
    });

    const docConfig = moddle.create("bpmn:Documentation", {
      id: "doc_config",
      text: JSON.stringify({
        autoComplete: false,
        allowTransfer: true,
        allowDelegate: true
      })
    });

    // 更新 extensionElements，添加更多 documentation
    const currentExtension = userTask.businessObject.extensionElements;
    if (currentExtension) {
      currentExtension.values.push(docOperations, docConfig);
    }

    modeler.saveXML({ format: true }).then(({ xml }) => {
      console.info(xml);
      
      // 保存 XML 到文件
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bpmn-${Date.now()}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  });
}
