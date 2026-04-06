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

    const endEvent = elementFactory.createShape({
      type: "bpmn:EndEvent",
    });

    modeling.createShape(endEvent, { x: 400, y: 100 }, process);

    // 要想更新属性，必须先createShape 到 process，这样才不会报错 
    modeling.updateProperties(endEvent, {
      name: "我是个结束点",
    });

    modeling.connect(startEvent, endEvent);

    // modeler.saveXML({ format: true }).then(({ xml }) => {
    //   console.info(xml);
  
    //   // 保存 XML 到文件
    //   const blob = new Blob([xml], { type: "application/xml" });
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.download = `bpmn-${Date.now()}.xml`;
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   URL.revokeObjectURL(url);
    // });
  });
}
