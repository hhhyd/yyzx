<template>
  <div style="display: flex; height: 100vh;">
    <!-- 侧边栏 -->
    <div style="width: 200px; background-color: #ADD8E6; color: white;">
      <div style="display: flex; align-items: center; padding: 20px 20px 20px 10px;">
        <img src="../assets/logo.png" alt="" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 5px; ">
      <div style="text-align: center; padding: 20px; font-size: 18px; font-weight: bold;">
        东软颐养
         </div>
      </div>
      <el-menu
        :default-active="activeIndex"
        background-color="#ADD8E6"
        text-color="#1A2C3E"
        active-text-color="#409EFF"
        @select="handleSelect"
      >
        <el-sub-menu index="1">
          <template #title>客户管理</template>
          <el-menu-item index="1-1">入住登记</el-menu-item>
          <el-menu-item index="1-2">外出登记</el-menu-item>
          <el-menu-item index="1-3">退住登记</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>床位管理</template>
          <el-menu-item index="2-1">床位示意图</el-menu-item>
          <el-menu-item index="2-2">床位管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>护理管理</template>
          <el-menu-item index="3-1">护理级别</el-menu-item>
          <el-menu-item index="3-2">护理项目</el-menu-item>
          <el-menu-item index="3-3">客户护理设置</el-menu-item>
          <el-menu-item index="3-4">护理记录</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>健康管家</template>
          <el-menu-item index="4-1">设置服务对象</el-menu-item>
          <el-menu-item index="4-2">服务关注</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="5">
          <template #title>用户管理</template>
          <el-menu-item index="5-1">基础数据维护</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- 顶部面包屑 -->
      <div style="padding: 15px 20px; background: #fff; border-bottom: 1px solid #e4e7ed;">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/Breadcrumb/checkin' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <!-- ！！！关键：页面内容显示区域 ！！！ -->
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
        '/Breadcrumb/checkin': '入住登记',
        '/Breadcrumb/out-register': '外出登记',
        '/Breadcrumb/checkout': '退住登记',
        '/Breadcrumb/bed-map': '床位示意图',
        '/Breadcrumb/bed-management': '床位管理',
        '/Breadcrumb/nursing-level': '护理级别',
        '/Breadcrumb/nursing-project': '护理项目',
        '/Breadcrumb/customer-nursing': '客户护理设置',
        '/Breadcrumb/nursing-record': '护理记录',
        '/Breadcrumb/service-object': '设置服务对象',
        '/Breadcrumb/service-concern': '服务关注',
        '/Breadcrumb/user-list': '基础数据维护'
      }
      return map[this.$route.path] || '页面'
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      const routeMap = {
        '1-1': '/Breadcrumb/checkin',
        '1-2': '/Breadcrumb/out-register',
        '1-3': '/Breadcrumb/checkout',
        '2-1': '/Breadcrumb/bed-map',
        '2-2': '/Breadcrumb/bed-management',
        '3-1': '/Breadcrumb/nursing-level',
        '3-2': '/Breadcrumb/nursing-project',
        '3-3': '/Breadcrumb/customer-nursing',
        '3-4': '/Breadcrumb/nursing-record',
        '4-1': '/Breadcrumb/service-object',
        '4-2': '/Breadcrumb/service-concern',
        '5-1': '/Breadcrumb/user-list'
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
/* 去除默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>