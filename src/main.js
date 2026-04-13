import { createApp } from 'vue'
import { createPinia } from 'pinia'
import store from './store'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 注册所有图标
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())


app.use(store).use(router).use(ElementPlus).mount('#app')
