import { createRouter, createWebHashHistory } from 'vue-router'
import login from '../views/login.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import checkin from '../views/checkin.vue'

const routes =[
    {
      path: '/',
      name: 'login',
      component:login,
    },
    {
      path:'/nurse',
      name:'nurse',
      component: () => import('../components/nurse.vue'),
      redirect: '/Breadcrumb/daily',
       children:[
         {
           path: 'daily',
           name: 'Daily',
           component: () => import('../views/daily.vue'),
         },
          {
        path: 'record',
        name: 'Record',
        component: () => import('../views/record.vue'),
      },
      {
        path: 'inApply',
        name: 'inApply',
        component: () => import('../views/inApply.vue'),
      },
       {
        path: 'outApply',
        name: 'outApply',
        component: () => import('../views/outApply.vue'),
      },
    ]
    },
    {
       path: '/Breadcrumb',
       name: 'Breadcrumb',
       component: () => import('../components/Breadcrumb.vue'),
       redirect: '/Breadcrumb/checkin',
       children:[
         {
           path: 'checkin',
           name: 'checkin',
           component: () => import('../views/checkin.vue'),
         },
          {
        path: 'out-register',
        name: 'outRegister',
        component: () => import('../views/customer/out-register.vue'),
      },
      // 1-3 退住登记
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('../views/customer/checkout.vue'),
      },
      // 2-1 床位示意图
      {
        path: 'bed-map',
        name: 'bedMap',
        component: () => import('../views/bed/map.vue'),
      },
      // 2-2 床位管理
      {
        path: 'bed-management',
        name: 'bedManagement',
        component: () => import('../views/bed/management.vue'),
      },
      // 3-1 护理级别
      {
        path: 'nursing-level',
        name: 'nursingLevel',
        component: () => import('../views/nursing/level.vue'),
      },
      // 3-2 护理项目
      {
        path: 'nursing-project',
        name: 'nursingProject',
        component: () => import('../views/nursing/project.vue'),
      },
      // 3-3 客户护理设置
      {
        path: 'customer-nursing',
        name: 'customerNursing',
        component: () => import('../views/nursing/customer-setting.vue'),
      },
      // 3-4 护理记录
      {
        path: 'nursing-record',
        name: 'nursingRecord',
        component: () => import('../views/nursing/record.vue'),
      },
      // 4-1 设置服务对象
      {
        path: 'service-object',
        name: 'serviceObject',
        component: () => import('../views/health/service-object.vue'),
      },
      // 4-2 服务关注
      {
        path: 'service-concern',
        name: 'serviceConcern',
        component: () => import('../views/health/service-concern.vue'),
      },
      // 5-1 基础数据维护
      {
        path: 'user-list',
        name: 'userList',
        component: () => import('../views/user/index.vue'),
      }

       ] 
    }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
