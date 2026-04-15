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
/* 去除默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>