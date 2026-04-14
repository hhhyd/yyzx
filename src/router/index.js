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
       component: () => import('../components/Breadcrumb.vue'),
       children:[
         {
           path: 'checkin',
           name: 'checkin',
           component: () => import('../views/checkin.vue'),
         }

       ] 
    }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
