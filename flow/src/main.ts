import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 笑死了，antd 要设置好中文，要设置dayjs 和 antd 的locale
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const app = createApp(App)

app.use(router)
app.use(Antd)
app.mount('#app')
