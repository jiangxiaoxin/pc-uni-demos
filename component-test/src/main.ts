import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import antd from "ant-design-vue"
import 'ant-design-vue/dist/reset.css';

import VxeUIBase from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'

const app = createApp(App)
app.use(antd)
app.use(router)
app.use(VxeUIBase)
app.mount('#app')
