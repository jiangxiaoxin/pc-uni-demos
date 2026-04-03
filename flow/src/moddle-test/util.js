export function getComps(modeler) {
    const elementFactory = modeler.get("elementFactory");
      const moddle = modeler.get("moddle");
      const elementRegistry = modeler.get("elementRegistry");
      const modeling = modeler.get("modeling");
      const bpmnFactory = modeler.get("bpmnFactory");

    return {
        elementFactory,
        moddle,
        elementRegistry,
        modeling,
        bpmnFactory

    }
}

export const template2 = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.1.0" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" name="未定义的流程" isExecutable="false">
    
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;