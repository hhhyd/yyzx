<template>
  <div style="background: white; padding: 20px; border-radius: 8px;">
    <h2>日常护理</h2>

    <!-- 搜索区域 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
      <el-input
        v-model="searchName"
        placeholder="请输入客户姓名"
        style="width: 250px;"
        @keyup.enter="handleSearch"  
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button> 
    </div>

    <!-- 表格 -->
    <el-table :data="displayData" style="width: 100%" border>  <!-- 改为displayData -->
      <el-table-column prop="index" label="序号" width="60" />
      <el-table-column prop="name" label="客户姓名" width="120" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="roomNo" label="房间号" width="100" />
      <el-table-column prop="bedNo" label="床号" width="100" />
      <el-table-column prop="floor" label="所属楼房" width="100" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="nursingLevel" label="护理级别" width="100" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleDailyCare(row)">日常护理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="margin-top: 20px; text-align: center;">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredData.length"  
        :page-sizes="[5, 10, 20, 50]" 
        layout="prev, pager, next, jumper, ->, total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    
  </div>
</template>

<script>
export default {
  name: 'Daily',
  data() {
    return {
      searchName: '',
      currentPage: 1,
      pageSize: 10,
      tableData: [
        { index: 1, name: '孙瑞英', age: 68, gender: '女', roomNo: '2012', bedNo: '2012-1', floor: '606', phone: '18167564213', nursingLevel: '二级' },
        { index: 2, name: '张帆', age: 77, gender: '女', roomNo: '1014', bedNo: '1014-1', floor: '606', phone: '17745189064', nursingLevel: '一级' },
        { index: 3, name: '王明', age: 72, gender: '男', roomNo: '2015', bedNo: '2015-2', floor: '606', phone: '13800138000', nursingLevel: '三级' },
        { index: 4, name: '李华', age: 65, gender: '女', roomNo: '3010', bedNo: '3010-1', floor: '606', phone: '13900139000', nursingLevel: '二级' },
        { index: 5, name: '刘强', age: 80, gender: '男', roomNo: '1012', bedNo: '1012-3', floor: '606', phone: '13700137000', nursingLevel: '一级' },
        { index: 6, name: '陈芳', age: 70, gender: '女', roomNo: '2018', bedNo: '2018-1', floor: '606', phone: '13600136000', nursingLevel: '二级' },
        { index: 7, name: '赵刚', age: 75, gender: '男', roomNo: '3012', bedNo: '3012-2', floor: '606', phone: '13500135000', nursingLevel: '三级' },
        { index: 8, name: '周敏', age: 68, gender: '女', roomNo: '1016', bedNo: '1016-1', floor: '606', phone: '13400134000', nursingLevel: '一级' },
        { index: 9, name: '吴伟', age: 73, gender: '男', roomNo: '2020', bedNo: '2020-3', floor: '606', phone: '13300133000', nursingLevel: '二级' },
        { index: 10, name: '郑秀', age: 69, gender: '女', roomNo: '3015', bedNo: '3015-1', floor: '606', phone: '13200132000', nursingLevel: '三级' },
        { index: 11, name: '孙瑞英', age: 71, gender: '女', roomNo: '2010', bedNo: '2010-2', floor: '606', phone: '13100131000', nursingLevel: '二级' },
        { index: 12, name: '张帆', age: 76, gender: '女', roomNo: '1018', bedNo: '1018-1', floor: '606', phone: '13000130000', nursingLevel: '一级' }
      ],
      isSearching: false  // 添加搜索状态标识
    }
  },
  computed: {
    // 过滤后的数据（根据搜索条件）
    filteredData() {
      if (!this.searchName.trim()) {
        this.isSearching = false
        return this.tableData
      }
      this.isSearching = true
      return this.tableData.filter(item => 
        item.name.includes(this.searchName.trim())
      )
    },
    
    // 当前页显示的数据（分页处理）
    displayData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData.slice(start, end)
    }
  },
  methods: {
    handleSearch() {
      // 搜索时重置到第一页
      this.currentPage = 1
      console.log('搜索:', this.searchName, '结果:', this.filteredData.length, '条')
      
      // 如果没有找到匹配的结果
      if (this.searchName.trim() && this.filteredData.length === 0) {
        this.$message.warning(`未找到姓名为 "${this.searchName}" 的客户`)
      }
    },
    
    // 添加重置方法
    handleReset() {
      this.searchName = ''
      this.currentPage = 1
      this.isSearching = false
      console.log('已重置搜索条件')
    },
    
    handleDailyCare(row) {
      this.$alert(`正在处理 ${row.name} 的日常护理`, '操作提示', {
        confirmButtonText: '确定',
        callback: action => {
          console.log('处理日常护理:', row)
        }
      })
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
    }
  },
  watch: {
    // 监听搜索关键词变化，为空时重置
    searchName(newVal) {
      if (!newVal.trim()) {
        this.isSearching = false
        this.currentPage = 1
      }
    }
  }
}
</script>

<style scoped>
/* 可选：自定义样式 */
.search-info {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}
</style>