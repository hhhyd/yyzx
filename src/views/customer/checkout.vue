<template>
  <div style="padding: 20px;">
    <h2>退住登记</h2>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="name" label="客户姓名" />
      <el-table-column prop="room" label="房间号" />
      <el-table-column prop="checkoutDate" label="退住日期" />
      <el-table-column prop="status" label="审核状态" />
      <el-table-column label="操作">
        <template #default>
          <el-button type="primary" size="small">审核</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Checkout',
  data() {
    return {
      tableData: [
        { name: '张三', room: '606-101', checkoutDate: '2024-01-15', status: '待审核' },
        { name: '李四', room: '606-102', checkoutDate: '2024-01-16', status: '已通过' },
      ]
    }
  }
}
</script>