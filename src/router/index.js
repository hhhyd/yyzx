import { createRouter, createWebHashHistory } from 'vue-router'
import login from '../views/login.vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const routes =[
    {
      path: '/',
      name: 'login',
      component:login,
    },
    {
       path: '/Breadcrumb',
      name: 'Breadcrumb',
      component:Breadcrumb,
    }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
