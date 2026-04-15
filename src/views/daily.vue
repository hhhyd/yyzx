<template>
  <div class="daily-care-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>日常护理</h2>
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
      <!-- 修改：增加按钮打开护理记录弹窗 -->
      <el-button type="success" @click="openNursingRecordDialog">增加</el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table :data="displayData" style="width: 100%" border>
        <el-table-column prop="index" label="序号" width="60" />
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="roomNo" label="房间号" width="100" />
        <el-table-column prop="bedNo" label="床号" width="100" />
        <el-table-column prop="floor" label="所属楼房" width="100" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="nursingLevel" label="护理级别" width="100" />
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-wrapper">
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

    <!-- 日常护理弹框 - 可以保留，但功能可以简化 -->
    <el-dialog
      title="客户护理信息"
      v-model="dialogVisible"
      width="600px"
      @close="closeDialog"
    >
      <div v-if="selectedCustomer.name" class="customer-info">
        <el-descriptions title="客户基本信息" :column="2" border>
          <el-descriptions-item label="客户姓名">{{ selectedCustomer.name }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ selectedCustomer.age }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedCustomer.gender }}</el-descriptions-item>
          <el-descriptions-item label="房间号">{{ selectedCustomer.roomNo }}</el-descriptions-item>
          <el-descriptions-item label="床号">{{ selectedCustomer.bedNo }}</el-descriptions-item>
          <el-descriptions-item label="所属楼房">{{ selectedCustomer.floor }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedCustomer.phone }}</el-descriptions-item>
          <el-descriptions-item label="护理级别">{{ selectedCustomer.nursingLevel }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 添加护理记录弹框 -->
    <el-dialog
      title="添加护理记录"
      v-model="addDialogVisible"
      width="500px"
      @close="closeAddDialog"
    >
      <el-form 
        :model="newNursingRecord"
        :rules="nursingRecordRules" 
        ref="nursingRecordRef"
        label-width="120px"
      >
        <el-form-item label="客户姓名" prop="customerName">
          <el-select
            v-model="newNursingRecord.customerName"
            filterable
            remote
            reserve-keyword
            placeholder="请输入客户姓名"
            :remote-method="searchCustomerByName"
            :loading="customerSearchLoading"
            style="width: 100%;"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="护理项目编号" prop="nursingItemCode">
          <el-input 
            v-model="newNursingRecord.nursingItemCode" 
            placeholder="请输入护理项目编号"
          />
        </el-form-item>
        
        <el-form-item label="护理项目" prop="nursingItem">
          <el-input 
            v-model="newNursingRecord.nursingItem" 
            placeholder="请输入护理项目"
          />
        </el-form-item>
        
        <el-form-item label="护理日期" prop="nursingDate">
          <el-date-picker
            v-model="newNursingRecord.nursingDate"
            type="datetime"
            placeholder="选择护理日期时间"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="护理数量" prop="nursingCount">
          <el-input-number
            v-model="newNursingRecord.nursingCount"
            :min="1"
            :max="100"
            placeholder="请输入护理数量"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="护理内容" prop="nursingContent">
          <el-input 
            v-model="newNursingRecord.nursingContent" 
            type="textarea"
            :rows="4"
            placeholder="请输入护理内容"
          />
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNursingRecord">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DailyCarePage',
  data() {
    return {
      // 搜索相关
      customerOptions: [], // 客户搜索结果
      customerSearchLoading: false,
      searchName: '',
      currentPage: 1,
      pageSize: 10,
      
      // 弹框控制
      dialogVisible: false,  // 客户信息弹框
      addDialogVisible: false,  // 护理记录弹框
      
      // 选中客户
      selectedCustomer: {},
      
      // 添加护理记录表单
      newNursingRecord: {
        customerName: '',
        nursingItemCode: '',
        nursingItem: '',
        nursingDate: new Date(),
        nursingCount: 1,
        nursingContent: ''
      },
      
      // 护理记录验证规则
      nursingRecordRules: {
        customerName: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
        nursingItemCode: [{ required: true, message: '护理项目编号不能为空', trigger: 'blur' }],
        nursingItem: [{ required: true, message: '护理项目不能为空', trigger: 'blur' }],
        nursingDate: [{ required: true, message: '护理日期不能为空', trigger: 'change' }],
        nursingCount: [{ required: true, message: '护理数量不能为空', trigger: 'blur' }],
        nursingContent: [{ required: true, message: '护理内容不能为空', trigger: 'blur' }]
      },
      
      // 原始数据
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
      ]
    }
  },
  computed: {
    // 过滤后的数据（根据搜索条件）
    filteredData() {
      if (!this.searchName) {
        return this.tableData;
      }
      return this.tableData.filter(item => 
        item.name.toLowerCase().includes(this.searchName.toLowerCase())
      );
    },
    // 当前页显示的数据
    displayData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredData.slice(start, end);
    }
  },
  methods: {
    searchCustomerByName(query) {
      if (query) {
        this.customerSearchLoading = true;
        // 模拟搜索：从 tableData 中过滤
        setTimeout(() => {
          this.customerOptions = this.tableData.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
          );
          this.customerSearchLoading = false;
        }, 200);
      } else {
        this.customerOptions = [];
      }
    },
    
    // 查询处理
    handleSearch() {
      this.currentPage = 1; // 重置到第一页
    },
    
    // 重置处理
    handleReset() {
      this.searchName = '';
      this.currentPage = 1;
    },
    
    // 打开日常护理弹框（查看客户信息）
    openDailyCareDialog(row) {
      this.selectedCustomer = { ...row };
      this.dialogVisible = true;
    },
    
    // 关闭日常护理弹框
    closeDialog() {
      this.dialogVisible = false;
      this.selectedCustomer = {};
    },
    
    // 打开添加护理记录弹框
    openNursingRecordDialog() {
      this.addDialogVisible = true;
    },
    
    // 关闭添加护理记录弹框
    closeAddDialog() {
      this.addDialogVisible = false;
      this.$refs.nursingRecordRef?.resetFields(); // 重置表单
      // 重置表单数据
      this.newNursingRecord = {
        customerName: '',
        nursingItemCode: '',
        nursingItem: '',
        nursingDate: new Date(),
        nursingCount: 1,
        nursingContent: ''
      };
    },
    
    // 提交护理记录
    submitNursingRecord() {
      this.$refs.nursingRecordRef.validate((valid) => {
        if (valid) {
          // 这里可以添加提交逻辑
          console.log('提交的护理记录:', this.newNursingRecord);
          this.$message.success('护理记录添加成功');
          this.closeAddDialog();
        }
      });
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1; // 重置到第一页
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val;
    }
  }
}
</script>

<style scoped>
.daily-care-page {
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

.pagination-wrapper {
  text-align: right;
  margin-top: 20px;
}

.customer-info {
  margin-top: 10px;
}
</style>