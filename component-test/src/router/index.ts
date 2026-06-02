import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/demo',
    name: 'ComponentDemo',
    component: () => import('../views/ComponentDemoView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/editor',
    name: 'FieldEditor',
    component: () => import('../views/FieldEditorView.vue'),
  },
  {
    path: '/cond',
    name: 'cond',
    component: () => import("../views/Cond.vue")
  }, {
    path: '/compute',
    name: 'compute',
    component: () => import("../views/compute-eng/index.vue")
  },
  {
    path: '/compute-resize-test',
    name: 'ComputeResizeTest',
    component: () => import("../views/compute-eng/ResizeEdgeTest.vue")
  },
  {
    path: '/dingflow',
    name: 'DingFlow',
    component: () => import('../views/dingflow/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
