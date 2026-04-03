import { getComps, template2 } from "./util";

export default function demo(modeler) {
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

    modeler.saveXML({ format: true }).then(({ xml }) => console.info(xml));
  });
}
