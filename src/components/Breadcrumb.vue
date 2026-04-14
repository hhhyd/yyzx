<template>
<el-menu :default-active="activeIndex"
  class="el-menu-demo"
  mode="horizontal"
  @select="handleSelect">
  <img src="" alt="">
  <div>东软颐养中心</div>
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
</template>
<script>
export default {
    name: 'Breadcrumb',

}

</script>