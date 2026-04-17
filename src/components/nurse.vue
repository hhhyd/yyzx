<template>
  <div style="display: flex; height: 100%;">

    <div style="width: 300px; background-color: #ADD8E6; color: white;">
      <div style="display: flex; align-items: center; padding: 15px; min-width: 0; flex-shrink: 0;">
        <img src="../assets/logo.png" alt="" style="width: 60px; height: 60px; border-radius: 50%; margin-right: 5px; ">
      <div style="font-size: 25px; 
          font-weight: bold; 
          white-space: nowrap;  
          overflow: hidden;     
          text-overflow: ellipsis;">
        东软颐养
         </div>
      </div>
      <el-menu
        :default-active="activeIndex"
        background-color="#ADD8E6"
        text-color="#1A2C3E"
        active-text-color="#409EFF"
        @select="handleSelect"
        class="sidebar"
      >
        <el-sub-menu index="1">
          <template #title>健康管家</template>
          <el-menu-item index="1-1">日常护理</el-menu-item>
          <el-menu-item index="1-2">服务对象护理记录</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>客户管理</template>
          <el-menu-item index="2-1">外出申请</el-menu-item>
          <el-menu-item index="2-2">退住申请</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div style="flex: 1; display: flex; flex-direction: column;">

      <div style="padding: 15px 20px; background: #fff; border-bottom: 1px solid #e4e7ed;">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/nurse/daily' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div style="flex: 1; padding: 20px; background: #f0f2f5;">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumb',
  data() {
    return {
      activeIndex: '1-1'
    }
  },
  computed: {
    pageTitle() {
      const map = {
       '/nurse/daily': '日常护理',
        '/nurse/record': '服务对象护理记录',
        '/nurse/inApply': '外出申请',
        '/nurse/outApply': '退住申请'
      }
      return map[this.$route.path] || '页面'
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      const routeMap = {
        '1-1': '/nurse/daily',
        '1-2': '/nurse/record',
        '2-1': '/nurse/inApply',
        '2-2': '/nurse/outApply'
      }
      const path = routeMap[key]
      if (path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
:deep(.el-menu) {
  --el-menu-item-font-size: 20px;
  --el-menu-item-height: 60px;
  --el-menu-sub-item-height: 56px;
  --el-menu-base-level-padding: 24px;
}


:deep(.el-sub-menu__title) {
  font-size: 22px !important;
  font-weight: 600 !important;
  height: 60px !important;
  line-height: 60px !important;
}


:deep(.el-menu-item) {
  font-size: 20px !important;
  height: 56px !important;
  line-height: 56px !important;
  padding-left: 40px !important;
}
</style>