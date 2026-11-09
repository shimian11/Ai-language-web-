import { createPinia } from 'pinia'
import { createApp } from 'vue'

import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/styles/element-overrides.scss'
import './assets/styles/reset.css'
import './assets/styles/tokens.css'
// 访客端全局样式（纸感实体；作用域 .visitor-page，不影响后台）
import './assets/styles/visitor.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
