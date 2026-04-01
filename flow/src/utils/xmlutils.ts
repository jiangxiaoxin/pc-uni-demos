/**
 * BPMN XML 工具函数
 * 提供 JSON 与 XML 之间的转换功能
 */

// 类型定义
export interface ParsedNode {
  id: string
  type: string
  name?: string
  sourceRef?: string
  targetRef?: string
  assignee?: string
  formKey?: string
  outgoing?: string[]
  incoming?: string[]
  operations?: Array<{
    id: string
    label: string
    type: string
    showOrder?: string
    variableList?: string
    buttonStyle?: string
    buttonPlain?: string
  }>
  copyItems?: string[]
}

export interface ParsedProcess {
  id: string
  name: string
  isExecutable: boolean
  nodes: ParsedNode[]
  flows: ParsedNode[]
}

export interface ParseResult {
  definitions: {
    id: string
    targetNamespace: string
  }
  process: ParsedProcess
  diagram?: {
    id: string
    planeId: string
    shapes: Array<{
      id: string
      bpmnElement: string
      bounds?: { x: number; y: number; width: number; height: number }
    }>
    edges: Array<{
      id: string
      bpmnElement: string
      waypoints: Array<{ x: number; y: number }>
    }>
  }
}

/**
 * 将解析后的 JSON 对象转换回 BPMN XML 字符串
 * @param data ParseResult 格式的 JSON 对象
 * @returns BPMN XML 字符串
 */
export function json2xml(data: ParseResult): string {
  const { definitions, process, diagram } = data
  
  // XML 头部
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  
  // definitions 开始标签
  xml += `<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`
  xml += `    xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"\n`
  xml += `    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"\n`
  xml += `    xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"\n`
  xml += `    xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn"\n`
  xml += `    id="${definitions.id}" targetNamespace="${definitions.targetNamespace}"\n`
  xml += `    xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">\n\n`
  
  // process 节点
  xml += `    <!-- process 是逻辑描述 -->\n`
  xml += `    <bpmn2:process id="${process.id}" name="${process.name}" isExecutable="${process.isExecutable}">\n\n`
  
  // 按类型分组处理节点
  const startEvents = process.nodes.filter(n => n.type === 'startEvent')
  const userTasks = process.nodes.filter(n => n.type === 'userTask')
  const intermediateEvents = process.nodes.filter(n => n.type === 'intermediateThrowEvent')
  const sequenceFlows = process.flows.filter(n => n.type === 'sequenceFlow')
  
  // 开始事件
  startEvents.forEach(node => {
    xml += `        <bpmn2:startEvent id="${node.id}"${node.name ? ` name="${node.name}"` : ''}>\n`
    if (node.outgoing && node.outgoing.length > 0) {
      node.outgoing.forEach(out => {
        xml += `            <bpmn2:outgoing>${out}</bpmn2:outgoing>\n`
      })
    }
    xml += `        </bpmn2:startEvent>\n\n`
  })
  
  // 用户任务
  userTasks.forEach(node => {
    const attrs: string[] = [`id="${node.id}"`]
    if (node.name) attrs.push(`name="${node.name}"`)
    if (node.formKey) attrs.push(`flowable:formKey="${escapeXml(node.formKey)}"`)
    if (node.assignee) attrs.push(`flowable:assignee="${node.assignee}"`)
    
    xml += `        <bpmn2:userTask ${attrs.join(' ')}>\n`
    
    // extensionElements
    if ((node.operations && node.operations.length > 0) || (node.copyItems && node.copyItems.length > 0)) {
      xml += `            <bpmn2:extensionElements>\n`
      xml += `                <flowable:variableList />\n`
      
      // 操作列表
      if (node.operations && node.operations.length > 0) {
        xml += `                <flowable:operationList>\n`
        node.operations.forEach(op => {
          const opAttrs = [
            `id="${op.id}"`,
            `label="${op.label}"`,
            `type="${op.type}"`,
            `showOrder="${op.showOrder || '0'}"`,
            `variableList="${op.variableList || '{}'}"`,
            `buttonStyle="${op.buttonStyle || 'primary'}"`,
            `buttonPlain="${op.buttonPlain || 'true'}"`
          ]
          xml += `                    <flowable:formOperation ${opAttrs.join(' ')} />\n`
        })
        xml += `                </flowable:operationList>\n`
      }
      
      // 抄送列表
      if (node.copyItems && node.copyItems.length > 0) {
        xml += `                <flowable:copyItemList>\n`
        node.copyItems.forEach(item => {
          xml += `                    <flowable:copyItem id="${item}" type="user" />\n`
        })
        xml += `                </flowable:copyItemList>\n`
      }
      
      xml += `            </bpmn2:extensionElements>\n`
    }
    
    // 入边
    if (node.incoming && node.incoming.length > 0) {
      node.incoming.forEach(inc => {
        xml += `            <bpmn2:incoming>${inc}</bpmn2:incoming>\n`
      })
    }
    
    // 出边
    if (node.outgoing && node.outgoing.length > 0) {
      node.outgoing.forEach(out => {
        xml += `            <bpmn2:outgoing>${out}</bpmn2:outgoing>\n`
      })
    }
    
    xml += `        </bpmn2:userTask>\n\n`
  })
  
  // 中间抛出事件
  intermediateEvents.forEach(node => {
    xml += `        <bpmn2:intermediateThrowEvent id="${node.id}"${node.name ? ` name="${node.name}"` : ''}>\n`
    if (node.incoming && node.incoming.length > 0) {
      node.incoming.forEach(inc => {
        xml += `            <bpmn2:incoming>${inc}</bpmn2:incoming>\n`
      })
    }
    xml += `        </bpmn2:intermediateThrowEvent>\n\n`
  })
  
  // 顺序流
  sequenceFlows.forEach(flow => {
    xml += `        <bpmn2:sequenceFlow id="${flow.id}" sourceRef="${flow.sourceRef}" targetRef="${flow.targetRef}" />\n`
  })
  
  xml += `    </bpmn2:process>\n`
  
  // 图表信息 (DI)
  if (diagram) {
    xml += `    <bpmndi:BPMNDiagram id="${diagram.id}">\n`
    // xml += `        <!-- BPMNDiagram 描述了图中有哪些节点，哪些边，他们的位置，尺寸信息 -->\n`
    // xml += `        <!-- BPMNPlane 的 bpmnElement 就是 上面process 的id，要对应起来 -->\n`
    // xml += `        <!-- BPMNEdge 是边，id 以flow开头。 waypoint 是边的控制点，两个的是开始和结束为止，多个的是中间有折线 -->\n`
    // xml += `        <!-- BPMNShape 是图中的节点， 任务型的id 是 Activity 开头， 开始和结束的节点，是以 Event 开头-->\n`
    xml += `        <bpmndi:BPMNPlane id="${diagram.planeId}" bpmnElement="${process.id}">\n`
    
    // 边 (edges)
    if (diagram.edges && diagram.edges.length > 0) {
      diagram.edges.forEach(edge => {
        xml += `            <bpmndi:BPMNEdge id="${edge.id}_di" bpmnElement="${edge.bpmnElement}">\n`
        if (edge.waypoints && edge.waypoints.length > 0) {
          edge.waypoints.forEach(wp => {
            xml += `                <di:waypoint x="${wp.x}" y="${wp.y}" />\n`
          })
        }
        xml += `            </bpmndi:BPMNEdge>\n`
      })
    }
    
    // 形状 (shapes)
    if (diagram.shapes && diagram.shapes.length > 0) {
      diagram.shapes.forEach(shape => {
        xml += `            <bpmndi:BPMNShape id="${shape.id}_di" bpmnElement="${shape.bpmnElement}">\n`
        if (shape.bounds) {
          xml += `                <dc:Bounds x="${shape.bounds.x}" y="${shape.bounds.y}" width="${shape.bounds.width}" height="${shape.bounds.height}" />\n`
        }
        xml += `            </bpmndi:BPMNShape>\n`
      })
    }
    
    xml += `        </bpmndi:BPMNPlane>\n`
    xml += `    </bpmndi:BPMNDiagram>\n`
  }
  
  xml += `</bpmn2:definitions>\n`
  
  return xml
}

/**
 * XML 特殊字符转义
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 创建示例数据（用于测试）- 原始2节点版本
 */
export function createExampleData(): ParseResult {
  return {
    definitions: {
      id: 'diagram_jyxtest',
      targetNamespace: 'http://flowable.org/bpmn'
    },
    process: {
      id: 'jyxtest',
      name: 'jyx测试流程',
      isExecutable: true,
      nodes: [
        {
          id: 'Event_007l2do',
          type: 'startEvent',
          name: '提交了就开始流程了',
          outgoing: ['Flow_0qaycz7']
        },
        {
          id: 'Activity_0sj1ckw',
          type: 'userTask',
          name: '组长审批',
          assignee: 'congqing',
          formKey: '{"routerName":"jyxtestform","formAuth":{},"readOnly":true,"groupType":"ASSIGNEE"}',
          incoming: ['Flow_0qaycz7'],
          outgoing: ['Flow_07xbu8i'],
          operations: [
            {
              id: '1774862917114',
              label: '同意',
              type: 'agree',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            },
            {
              id: '1774862921139',
              label: '拒绝',
              type: 'refuse',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            }
          ],
          copyItems: ['admin']
        },
        {
          id: 'Activity_06evtjy',
          type: 'userTask',
          name: '部门长审批',
          assignee: 'admin',
          formKey: '{"routerName":"jyxtestform","formAuth":{},"readOnly":true,"groupType":"ASSIGNEE"}',
          incoming: ['Flow_07xbu8i'],
          outgoing: ['Flow_06zw73t'],
          operations: [
            {
              id: '1774862859394',
              label: '同意',
              type: 'agree',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            },
            {
              id: '1774862867612',
              label: '拒绝',
              type: 'refuse',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            }
          ],
          copyItems: []
        },
        {
          id: 'Event_1j7qjim',
          type: 'intermediateThrowEvent',
          name: '终于结束了',
          incoming: ['Flow_06zw73t']
        }
      ],
      flows: [
        {
          id: 'Flow_0qaycz7',
          type: 'sequenceFlow',
          sourceRef: 'Event_007l2do',
          targetRef: 'Activity_0sj1ckw'
        },
        {
          id: 'Flow_07xbu8i',
          type: 'sequenceFlow',
          sourceRef: 'Activity_0sj1ckw',
          targetRef: 'Activity_06evtjy'
        },
        {
          id: 'Flow_06zw73t',
          type: 'sequenceFlow',
          sourceRef: 'Activity_06evtjy',
          targetRef: 'Event_1j7qjim'
        }
      ]
    },
    diagram: {
      id: 'BPMNDiagram_1',
      planeId: 'BPMNPlane_1',
      edges: [
        {
          id: 'Flow_0qaycz7',
          bpmnElement: 'Flow_0qaycz7',
          waypoints: [
            { x: 318, y: 190 },
            { x: 370, y: 190 }
          ]
        },
        {
          id: 'Flow_07xbu8i',
          bpmnElement: 'Flow_07xbu8i',
          waypoints: [
            { x: 470, y: 190 },
            { x: 530, y: 190 }
          ]
        },
        {
          id: 'Flow_06zw73t',
          bpmnElement: 'Flow_06zw73t',
          waypoints: [
            { x: 630, y: 190 },
            { x: 692, y: 190 }
          ]
        }
      ],
      shapes: [
        {
          id: 'Event_007l2do',
          bpmnElement: 'Event_007l2do',
          bounds: { x: 282, y: 172, width: 36, height: 36 }
        },
        {
          id: 'Activity_0sj1ckw',
          bpmnElement: 'Activity_0sj1ckw',
          bounds: { x: 370, y: 150, width: 100, height: 80 }
        },
        {
          id: 'Activity_06evtjy',
          bpmnElement: 'Activity_06evtjy',
          bounds: { x: 530, y: 150, width: 100, height: 80 }
        },
        {
          id: 'Event_1j7qjim',
          bpmnElement: 'Event_1j7qjim',
          bounds: { x: 692, y: 172, width: 36, height: 36 }
        }
      ]
    }
  }
}

/**
 * 创建3个审批节点的流程数据
 * 从开始 -> 审批1 -> 审批2 -> 审批3 -> 结束
 */
export function createThreeApprovalProcess(): ParseResult {
  const timestamp = Date.now()
  
  return {
    definitions: {
      id: `diagram_three_approval_${timestamp}`,
      targetNamespace: 'http://flowable.org/bpmn'
    },
    process: {
      id: `three_approval_process_${timestamp}`,
      name: '三级审批流程',
      isExecutable: true,
      nodes: [
        // 开始节点
        {
          id: 'StartEvent_1',
          type: 'startEvent',
          name: '提交申请',
          outgoing: ['Flow_start_to_approval1']
        },
        // 第一个审批节点
        {
          id: 'Activity_Approval_1',
          type: 'userTask',
          name: '直属领导审批',
          assignee: 'leader',
          formKey: '{"routerName":"approvalForm","formAuth":{},"readOnly":true,"groupType":"ASSIGNEE"}',
          incoming: ['Flow_start_to_approval1'],
          outgoing: ['Flow_approval1_to_approval2'],
          operations: [
            {
              id: `op_approve_1_${timestamp}`,
              label: '同意',
              type: 'agree',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            },
            {
              id: `op_reject_1_${timestamp}`,
              label: '拒绝',
              type: 'refuse',
              showOrder: '1',
              variableList: '{}',
              buttonStyle: 'danger',
              buttonPlain: 'true'
            },
            {
              id: `op_transfer_1_${timestamp}`,
              label: '转交',
              type: 'transfer',
              showOrder: '2',
              variableList: '{}',
              buttonStyle: 'default',
              buttonPlain: 'true'
            }
          ],
          copyItems: ['hr']
        },
        // 第二个审批节点
        {
          id: 'Activity_Approval_2',
          type: 'userTask',
          name: '部门经理审批',
          assignee: 'manager',
          formKey: '{"routerName":"approvalForm","formAuth":{},"readOnly":true,"groupType":"ASSIGNEE"}',
          incoming: ['Flow_approval1_to_approval2'],
          outgoing: ['Flow_approval2_to_approval3'],
          operations: [
            {
              id: `op_approve_2_${timestamp}`,
              label: '同意',
              type: 'agree',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            },
            {
              id: `op_reject_2_${timestamp}`,
              label: '拒绝',
              type: 'refuse',
              showOrder: '1',
              variableList: '{}',
              buttonStyle: 'danger',
              buttonPlain: 'true'
            },
            {
              id: `op_transfer_2_${timestamp}`,
              label: '转交',
              type: 'transfer',
              showOrder: '2',
              variableList: '{}',
              buttonStyle: 'default',
              buttonPlain: 'true'
            }
          ],
          copyItems: ['hr', 'admin']
        },
        // 第三个审批节点
        {
          id: 'Activity_Approval_3',
          type: 'userTask',
          name: '总经理审批',
          assignee: 'ceo',
          formKey: '{"routerName":"approvalForm","formAuth":{},"readOnly":true,"groupType":"ASSIGNEE"}',
          incoming: ['Flow_approval2_to_approval3'],
          outgoing: ['Flow_approval3_to_end'],
          operations: [
            {
              id: `op_approve_3_${timestamp}`,
              label: '同意',
              type: 'agree',
              showOrder: '0',
              variableList: '{}',
              buttonStyle: 'primary',
              buttonPlain: 'true'
            },
            {
              id: `op_reject_3_${timestamp}`,
              label: '拒绝',
              type: 'refuse',
              showOrder: '1',
              variableList: '{}',
              buttonStyle: 'danger',
              buttonPlain: 'true'
            }
          ],
          copyItems: []
        },
        // 结束节点
        {
          id: 'EndEvent_1',
          type: 'intermediateThrowEvent',
          name: '流程结束',
          incoming: ['Flow_approval3_to_end']
        }
      ],
      flows: [
        {
          id: 'Flow_start_to_approval1',
          type: 'sequenceFlow',
          sourceRef: 'StartEvent_1',
          targetRef: 'Activity_Approval_1'
        },
        {
          id: 'Flow_approval1_to_approval2',
          type: 'sequenceFlow',
          sourceRef: 'Activity_Approval_1',
          targetRef: 'Activity_Approval_2'
        },
        {
          id: 'Flow_approval2_to_approval3',
          type: 'sequenceFlow',
          sourceRef: 'Activity_Approval_2',
          targetRef: 'Activity_Approval_3'
        },
        {
          id: 'Flow_approval3_to_end',
          type: 'sequenceFlow',
          sourceRef: 'Activity_Approval_3',
          targetRef: 'EndEvent_1'
        }
      ]
    },
    diagram: {
      id: 'BPMNDiagram_ThreeApproval',
      planeId: 'BPMNPlane_ThreeApproval',
      edges: [
        {
          id: 'Flow_start_to_approval1',
          bpmnElement: 'Flow_start_to_approval1',
          waypoints: [
            { x: 218, y: 190 },
            { x: 270, y: 190 }
          ]
        },
        {
          id: 'Flow_approval1_to_approval2',
          bpmnElement: 'Flow_approval1_to_approval2',
          waypoints: [
            { x: 370, y: 190 },
            { x: 430, y: 190 }
          ]
        },
        {
          id: 'Flow_approval2_to_approval3',
          bpmnElement: 'Flow_approval2_to_approval3',
          waypoints: [
            { x: 530, y: 190 },
            { x: 590, y: 190 }
          ]
        },
        {
          id: 'Flow_approval3_to_end',
          bpmnElement: 'Flow_approval3_to_end',
          waypoints: [
            { x: 690, y: 190 },
            { x: 752, y: 190 }
          ]
        }
      ],
      shapes: [
        {
          id: 'StartEvent_1',
          bpmnElement: 'StartEvent_1',
          bounds: { x: 182, y: 172, width: 36, height: 36 }
        },
        {
          id: 'Activity_Approval_1',
          bpmnElement: 'Activity_Approval_1',
          bounds: { x: 270, y: 150, width: 100, height: 80 }
        },
        {
          id: 'Activity_Approval_2',
          bpmnElement: 'Activity_Approval_2',
          bounds: { x: 430, y: 150, width: 100, height: 80 }
        },
        {
          id: 'Activity_Approval_3',
          bpmnElement: 'Activity_Approval_3',
          bounds: { x: 590, y: 150, width: 100, height: 80 }
        },
        {
          id: 'EndEvent_1',
          bpmnElement: 'EndEvent_1',
          bounds: { x: 752, y: 172, width: 36, height: 36 }
        }
      ]
    }
  }
}

export default {
  json2xml,
  createExampleData
}
