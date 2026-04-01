import { createRouter, createWebHistory } from 'vue-router'
import FlowEditor from '../views/FlowEditor.vue'
import FlowViewer from '../views/FlowViewer.vue'
import XmlParserView from '../views/XmlParserView.vue'

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
    }
  ]
})

export default router
