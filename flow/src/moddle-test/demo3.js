/**
 * 使用 flowable 命名空间的扩展示例
 * 
 * 前置要求：
 * 1. 确保 moddle.vue 中已配置 flowable moddleExtensions
 * 2. 确保 flowable.json 描述文件已创建
 * 
 * 配置示例（moddle.vue）：
 * import flowableModdle from "../moddle-test/flowable.json"
 * 
 * const modeler = new BpmnModeler({
 *   container: containerRef.value,
 *   moddleExtensions: {
 *     flowable: flowableModdle
 *   }
 * });
 */

import { getComps, template2 } from "./util";

export default function demo3(modeler) {
  const { elementFactory, elementRegistry, modeling, moddle, bpmnFactory } =
    getComps(modeler);

  modeler.importXML(template2).then(() => {
    const process = elementRegistry.get("Process_1");

    const startEvent = elementFactory.createShape({
      type: "bpmn:StartEvent",
    });

    modeling.createShape(
      startEvent,
      { x: 200, y: 100 },
      process,
    );

    modeling.updateProperties(startEvent, {
      name: "我是开始",
      time: Date.now(),
    });

    // ========== 使用 flowable:xxx 扩展 ==========
    
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

    try {
      // 创建 flowable:formOperation 元素
      const formOperation = moddle.create("flowable:FormOperation", {
        id: "op_001",
        label: "同意",
        type: "agree",
        showOrder: 0,
        variableList: "{}",
        buttonStyle: "primary",
        buttonPlain: "true"
      });

      const formOperation2 = moddle.create("flowable:FormOperation", {
        id: "op_002",
        label: "拒绝",
        type: "refuse",
        showOrder: 1,
        variableList: "{}",
        buttonStyle: "danger",
        buttonPlain: "true"
      });

      const operationList = moddle.create("flowable:operationList", {
        formOperation: [formOperation, formOperation2]
      });

      const variableList = moddle.create("flowable:variableList");
      
      const copyItem = moddle.create("flowable:CopyItem", {
        id: "hr",
        type: "user"
      });
      
      const copyItemList = moddle.create("flowable:copyItemList", {
        copyItem: [copyItem]
      });

      const extensionElements = moddle.create("bpmn:ExtensionElements", {
        values: [variableList, copyItemList, operationList]
      });

      modeling.updateProperties(userTask, {
        extensionElements: extensionElements,
        "flowable:assignee": "${assignee}",
        "flowable:formKey": JSON.stringify({
          routerName: "approvalForm",
          formAuth: {},
          readOnly: true,
          groupType: "ASSIGNEE"
        }),
        "flowable:dueDate": "${dateTime().plusDays(3).toDate()}"
      });

      // 创建带 flowable:customCondition 的连线
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

      const customCondition = moddle.create("flowable:customCondition", {
        type: "operation",
        operationType: "agree"
      });

      const flowExtension = moddle.create("bpmn:ExtensionElements", {
        values: [customCondition]
      });

      const conditionExpression = moddle.create("bpmn:FormalExpression", {
        body: "${operationType == 'agree'}"
      });

      modeling.updateProperties(sequenceFlow, {
        extensionElements: flowExtension,
        conditionExpression: conditionExpression,
        name: "同意"
      });

      console.log("Flowable 扩展元素创建成功！");

    } catch (error) {
      console.error("创建 flowable 扩展元素失败:", error.message);
      console.warn("提示：请确保 flowable.json 已正确配置到 moddleExtensions");
    }

    modeler.saveXML({ format: true }).then(({ xml }) => {
      console.info(xml);
      
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bpmn-flowable-${Date.now()}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  });
}
