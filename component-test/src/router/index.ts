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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
