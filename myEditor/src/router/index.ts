import { createRouter, createWebHistory } from 'vue-router'
import EditorView from '../views/EditorView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/frame',
      name: 'frame',
      component: () => import('../views/MyFrame.vue')
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('../views/Preview.vue')
    }, 
    {
      path: "/render",
      name: "render",
      component: () => import('../views/Render.vue')
    },
    {
      path: "/drag",
      name: "drag",
      component: () => import('../views/DragEditor.vue')
    }
  ],
})

export default router
