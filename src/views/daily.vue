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
      <!-- 新增的增加按钮 -->
      <el-button type="success" @click="openAddDialog">增加</el-button>
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
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary"
              @click="openDailyCareDialog(row)"
            >
              日常护理
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 日常护理弹框 -->
    <el-dialog
      title="客户护理信息"
      v-model="dialogVisible"
      width="600px"
      @close="closeDialog"
    >
      <!-- 弹框内容 -->
      <div v-if="selectedCustomer.name">
        <!-- ... 弹框内容保持不变 ... -->
      </div>
      
      <!-- 弹框底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </span>
    </el-dialog>

    <!-- 新增客户弹框 -->
    <el-dialog
      title="新增客户信息"
      v-model="addDialogVisible"
      width="500px"
      @close="closeAddDialog"
    >
      <el-form 
        :model="newCustomerForm" 
        :rules="formRules" 
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="客户姓名" prop="name">
          <el-input 
            v-model="newCustomerForm.name" 
            placeholder="请输入客户姓名"
          />
        </el-form-item>
        
        <el-form-item label="年龄" prop="age">
          <el-input-number
            v-model="newCustomerForm.age"
            :min="0"
            :max="120"
            placeholder="请输入年龄"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-select 
            v-model="newCustomerForm.gender" 
            placeholder="请选择性别"
            style="width: 100%;"
          >
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="房间号" prop="roomNo">
          <el-input 
            v-model="newCustomerForm.roomNo" 
            placeholder="请输入房间号"
          />
        </el-form-item>
        
        <el-form-item label="床号" prop="bedNo">
          <el-input 
            v-model="newCustomerForm.bedNo" 
            placeholder="请输入床号"
          />
        </el-form-item>
        
        <el-form-item label="所属楼房" prop="floor">
          <el-input 
            v-model="newCustomerForm.floor" 
            placeholder="请输入所属楼房"
          />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input 
            v-model="newCustomerForm.phone" 
            placeholder="请输入联系电话"
          />
        </el-form-item>
        
        <el-form-item label="护理级别" prop="nursingLevel">
          <el-select 
            v-model="newCustomerForm.nursingLevel" 
            placeholder="请选择护理级别"
            style="width: 100%;"
          >
            <el-option label="一级" value="一级" />
            <el-option label="二级" value="二级" />
            <el-option label="三级" value="三级" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNewCustomer">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DailyCareStyle',
  data() {
    return {
      tableData: [
        { index: 1, name: '孙瑞英', age: 68, gender: '女', roomNo: '2012', bedNo: '2012-1', floor: '606', phone: '18167564213', nursingLevel: '二级' },
        { index: 2, name: '张帆', age: 77, gender: '女', roomNo: '1014', bedNo: '1014-1', floor: '606', phone: '17745189064', nursingLevel: '一级' },
        { index: 3, name: '王明', age: 72, gender: '男', roomNo: '2015', bedNo: '2015-2', floor: '606', phone: '13800138000', nursingLevel: '三级' },
        { index: 4, name: '李华', age: 65, gender: '女', roomNo: '3010', bedNo: '3010-1', floor: '606', phone: '13900139000', nursingLevel: '二级' },
        { index: 5, name: '刘强', age: 80, gender: '男', roomNo: '1012', bedNo: '1012-3', floor: '606', phone: '13700137000', nursingLevel: '一级' }
      ],
      searchName: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      selectedCustomer: {},
      nursingItems: [
        { name: '测量血压', frequency: '每日2次', time: '08:00, 20:00', status: '已完成' },
        { name: '测量体温', frequency: '每日2次', time: '08:00, 20:00', status: '已完成' },
        { name: '用药提醒', frequency: '每日3次', time: '08:00, 12:00, 20:00', status: '待完成' },
        { name: '身体清洁', frequency: '每日1次', time: '09:00', status: '待完成' },
        { name: '康复训练', frequency: '每日1次', time: '15:00', status: '待完成' },
      ],
      
      // 新增弹框控制
      addDialogVisible: false,
      
      // 新增客户表单数据
      newCustomerForm: {
        name: '',
        age: null,
        gender: '',
        roomNo: '',
        bedNo: '',
        floor: '',
        phone: '',
        nursingLevel: ''
      },
      
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入客户姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        roomNo: [
          { required: true, message: '请输入房间号', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        nursingLevel: [
          { required: true, message: '请选择护理级别', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredData() {
      if (!this.searchName.trim()) {
        return this.tableData
      }
      return this.tableData.filter(item => 
        item.name.includes(this.searchName.trim())
      )
    },
    displayData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData.slice(start, end)
    }
  },
  methods: {
    handleSearch() {
      this.currentPage = 1
    },
    handleReset() {
      this.searchName = ''
      this.currentPage = 1
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    
    // 日常护理弹框相关方法
    openDailyCareDialog(row) {
      this.selectedCustomer = row
      this.dialogVisible = true
    },
    closeDialog() {
      this.dialogVisible = false
      this.selectedCustomer = {}
    },
    getNursingLevelTag(level) {
      switch(level) {
        case '一级': return 'danger'
        case '二级': return 'warning'
        case '三级': return 'success'
        default: return 'info'
      }
    },
    
    // 新增客户相关方法
    openAddDialog() {
      this.addDialogVisible = true
    },
    closeAddDialog() {
      this.$refs.addFormRef?.resetFields()
      this.newCustomerForm = {
        name: '',
        age: null,
        gender: '',
        roomNo: '',
        bedNo: '',
        floor: '',
        phone: '',
        nursingLevel: ''
      }
    },
    submitNewCustomer() {
      this.$refs.addFormRef.validate((valid) => {
        if (valid) {
          // 生成新的序号
          const maxIndex = this.tableData.length > 0 
            ? Math.max(...this.tableData.map(item => item.index))
            : 0
          
          // 创建新客户对象
          const newCustomer = {
            index: maxIndex + 1,
            name: this.newCustomerForm.name,
            age: this.newCustomerForm.age,
            gender: this.newCustomerForm.gender,
            roomNo: this.newCustomerForm.roomNo,
            bedNo: this.newCustomerForm.bedNo,
            floor: this.newCustomerForm.floor,
            phone: this.newCustomerForm.phone,
            nursingLevel: this.newCustomerForm.nursingLevel
          }
          
          // 添加到表格数据（添加到最前面）
          this.tableData.unshift(newCustomer)
          
          // 重置表单并关闭弹框
          this.$message.success('客户信息添加成功！')
          this.closeAddDialog()
          this.addDialogVisible = false
          
          // 重置到第一页
          this.currentPage = 1
        } else {
          this.$message.error('请填写完整信息！')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.daily-care-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 1200px;
  margin: 40px auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pagination-wrapper {
  text-align: center;
}
</style>