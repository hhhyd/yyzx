<template>
  <div class="record-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>护理记录</h2>
    </div>

    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchName"
        placeholder="请输入客户姓名"
        style="width: 250px; margin-right: 10px;"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 客户信息表格 -->
    <div class="table-wrapper">
      <h3>客户信息</h3>
      <el-table 
        :data="filteredCustomers" 
        style="width: 100%" 
        border
        highlight-current-row
        @row-click="handleCustomerSelect"
      >
        <el-table-column prop="index" label="序号" width="60" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="bedNo" label="床号" width="100" />
        <el-table-column prop="nursingLevel" label="护理级别" width="100" />
        <el-table-column label="选择" width="80">
          <template #default="{ row }">
            <el-radio 
              v-model="selectedCustomerId" 
              :label="row.id"
              @click.stop
            >
              选择
            </el-radio>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 护理记录表格 -->
    <div v-if="selectedCustomer" class="table-wrapper" style="margin-top: 20px;">
      <h3>{{ selectedCustomer.name }} 的护理记录</h3>
      <el-table :data="filteredRecords" style="width: 100%" border>
        <el-table-column prop="index" label="序号" width="60" />
        <el-table-column prop="nursingItemCode" label="护理项目编号" width="120" />
        <el-table-column prop="nursingItem" label="护理项目名称" width="120" />
        <el-table-column prop="nursingCount" label="护理数量" width="100" />
        <el-table-column prop="nursingContent" label="护理内容" width="200" :show-overflow-tooltip="true" />
        <el-table-column prop="nurseName" label="护理人员" width="120" />
        <el-table-column prop="nursePhone" label="护理人员手机" width="150" />
        <el-table-column prop="nursingTime" label="护理时间" width="150" />
        <el-table-column label="操作" width="100">
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              size="small"
              @click="removeRecord(row, $index)"
              plain
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 无选中客户时的提示 -->
    <div v-else class="no-selection">
      <el-empty description="请先选择客户查看护理记录" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Record',
  data() {
    return {
      // 搜索相关
      searchName: '',
      
      // 选中的客户ID
      selectedCustomerId: null,
      
      // 客户数据
      customers: [
        { id: 1, index: 1, name: '孙瑞英', age: 68, gender: '女', bedNo: '2012-1', nursingLevel: '二级' },
        { id: 2, index: 2, name: '张帆', age: 77, gender: '女', bedNo: '1014-1', nursingLevel: '一级' },
        { id: 3, index: 3, name: '王明', age: 72, gender: '男', bedNo: '2015-2', nursingLevel: '三级' },
        { id: 4, index: 4, name: '李华', age: 65, gender: '女', bedNo: '3010-1', nursingLevel: '二级' },
      ],
      
      // 所有护理记录数据（包含客户ID关联）
      allRecords: [
        { id: 1, index: 1, customerId: 1, nursingItemCode: 'HLXM0001', nursingItem: '吸氧', nursingCount: 1, nursingContent: '吸氧护理，确保氧气流量稳定', nurseName: '吴伟', nursePhone: '13517178987', nursingTime: '2023-11-24 08:30' },
        { id: 2, index: 2, customerId: 1, nursingItemCode: 'HLXM0002', nursingItem: '协助服药', nursingCount: 1, nursingContent: '协助服用降压药，观察30分钟', nurseName: '吴伟', nursePhone: '13517178987', nursingTime: '2023-11-24 12:00' },
        { id: 3, index: 3, customerId: 1, nursingItemCode: 'HLXM0003', nursingItem: '测量血压', nursingCount: 1, nursingContent: '测量血压，血压值为135/85mmHg', nurseName: '张莉', nursePhone: '13800138000', nursingTime: '2023-11-24 16:00' },
        { id: 4, index: 4, customerId: 2, nursingItemCode: 'HLXM0001', nursingItem: '吸氧', nursingCount: 1, nursingContent: '吸氧护理，观察呼吸情况', nurseName: '刘强', nursePhone: '13900139000', nursingTime: '2023-11-24 09:00' },
        { id: 5, index: 5, customerId: 2, nursingItemCode: 'HLXM0004', nursingItem: '协助进食', nursingCount: 1, nursingContent: '协助进食午餐，观察吞咽情况', nurseName: '刘强', nursePhone: '13900139000', nursingTime: '2023-11-24 12:30' },
        { id: 6, index: 6, customerId: 3, nursingItemCode: 'HLXM0005', nursingItem: '测量体温', nursingCount: 1, nursingContent: '测量体温，体温36.5℃，正常', nurseName: '陈芳', nursePhone: '13600136000', nursingTime: '2023-11-24 08:00' },
        { id: 7, index: 7, customerId: 3, nursingItemCode: 'HLXM0006', nursingItem: '身体清洁', nursingCount: 1, nursingContent: '协助晨间洗漱，更换衣物', nurseName: '陈芳', nursePhone: '13600136000', nursingTime: '2023-11-24 08:30' },
        { id: 8, index: 8, customerId: 4, nursingItemCode: 'HLXM0007', nursingItem: '康复训练', nursingCount: 1, nursingContent: '协助进行康复训练，15分钟', nurseName: '赵刚', nursePhone: '13500135000', nursingTime: '2023-11-24 10:00' },
      ],
      
      // 当前显示的护理记录（会隐藏被移除的记录）
      visibleRecords: []
    }
  },
  computed: {
    // 过滤后的客户数据
    filteredCustomers() {
      if (!this.searchName) {
        return this.customers;
      }
      return this.customers.filter(item => 
        item.name.toLowerCase().includes(this.searchName.toLowerCase())
      );
    },
    
    // 选中的客户对象
    selectedCustomer() {
      if (!this.selectedCustomerId) return null;
      return this.customers.find(c => c.id === this.selectedCustomerId);
    },
    
    // 过滤后的护理记录数据
    filteredRecords() {
      if (!this.selectedCustomer) return [];
      return this.visibleRecords.filter(record => 
        record.customerId === this.selectedCustomerId
      );
    }
  },
  methods: {
    // 查询处理
    handleSearch() {
      // 搜索逻辑已在computed中实现
    },
    
    // 重置处理
    handleReset() {
      this.searchName = '';
      this.selectedCustomerId = null;
      this.visibleRecords = [...this.allRecords];
    },
    
    // 客户行点击事件
    handleCustomerSelect(row) {
      this.selectedCustomerId = row.id;
      
      // 加载该客户的护理记录
      this.loadCustomerRecords(row.id);
    },
    
    // 加载客户的护理记录
    loadCustomerRecords(customerId) {
      // 初始化可见记录（过滤掉被隐藏的记录）
      this.visibleRecords = this.allRecords.filter(record => 
        record.customerId === customerId && !record.hidden
      );
      
      // 重新排序
      this.visibleRecords.forEach((record, index) => {
        record.index = index + 1;
      });
    },
    
    // 移除护理记录
    removeRecord(row, index) {
      this.$confirm('确定要移除这条护理记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 标记记录为隐藏
        const recordIndex = this.allRecords.findIndex(r => r.id === row.id);
        if (recordIndex !== -1) {
          this.allRecords[recordIndex].hidden = true;
        }
        
        // 从可见记录中移除
        this.visibleRecords.splice(index, 1);
        
        // 重新排序
        this.visibleRecords.forEach((record, idx) => {
          record.index = idx + 1;
        });
        
        this.$message.success('记录已移除');
      }).catch(() => {
        // 用户取消操作
      });
    }
  },
  created() {
    // 初始化可见记录
    this.visibleRecords = [...this.allRecords];
  }
}
</script>

<style scoped>
.record-page {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.table-wrapper h3 {
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.no-selection {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

/* 高亮选中的行 */
.el-table__body tr.current-row>td {
  background-color: #f0f9ff !important;
}
</style>