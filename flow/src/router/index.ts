import { createRouter, createWebHistory } from 'vue-router'
import FlowEditor from '../views/FlowEditor.vue'
import FlowViewer from '../views/FlowViewer.vue'

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
    }
  ]
})

export default router
