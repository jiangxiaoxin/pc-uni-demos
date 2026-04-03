import { createRouter, createWebHistory } from 'vue-router'
import FlowEditor from '../views/FlowEditor.vue'
import FlowViewer from '../views/FlowViewer.vue'
import XmlParserView from '../views/XmlParserView.vue'
import JsonToXmlView from '../views/JsonToXmlView.vue'
import moddle from '../views/moddle.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'FlowEditor',
      component: FlowEditor
    },
    {
      path: '/view',
      name: 'FlowViewer',
      component: FlowViewer
    },
    {
      path: '/xml',
      name: 'XmlParser',
      component: XmlParserView
    },
    {
      path: '/json-to-xml',
      name: 'JsonToXml',
      component: JsonToXmlView
    },
    {
      path: '/moddle',
      name: 'Moddle',
      component: moddle
    }
  ]
})

export default router
