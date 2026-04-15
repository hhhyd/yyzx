<!-- src/views/outApply.vue -->
<template>
  <div style="background: white; padding: 20px; border-radius: 8px;">
    <h2>退住申请</h2>

    <!-- 搜索区域 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
      <el-input v-model="searchName" placeholder="客户姓名" style="width: 200px;" />
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <!-- 两个表格并列 -->
    <div style="display: flex; gap: 20px;">
      <!-- 左侧：客户信息 -->
      <div style="flex: 1; border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="background: #ADD8E6; color: white; padding: 10px; font-weight: bold;">客户信息</div>
        <el-table :data="displayCustomerData" style="width: 100%">
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="bed" label="床号" width="100" />
          <el-table-column prop="nursingLevel" label="护理级别" width="100" />
        </el-table>
        <!-- 左侧分页 -->
        <div style="padding: 10px; display: flex; justify-content: flex-end;">
          <el-pagination
            v-model:current-page="customerCurrentPage"
            v-model:page-size="customerPageSize"
            :total="customerTotal"
            layout="total, prev, pager, next ,jumper"
            :size="'small'"
            @current-change="handleCustomerPageChange"
          />
        </div>
      </div>

      <!-- 右侧：退住申请 -->
      <div style="flex: 1; border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="background: #ADD8E6; color: white; padding: 10px; font-weight: bold;">退住申请</div>
        <el-table :data="displayApplyData" style="width: 100%">
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="name" label="客户姓名" width="100" />
          <el-table-column prop="checkInTime" label="入住时间" width="120" />
          <el-table-column prop="checkOutTime" label="退住时间" width="120" />
          <el-table-column prop="type" label="退住类型" width="100" />
          <el-table-column prop="reason" label="退住原因" width="120" />
          <el-table-column prop="approveTime" label="审批时间" width="120" />
          <el-table-column prop="status" label="审批状态" width="100" />
          <el-table-column prop="bed" label="床位" width="100" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === '已提交'" 
                size="small" 
                type="primary" 
                @click="openApproveModal(row)"
              >
                审批
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 右侧分页 -->
        <div style="padding: 10px; display: flex; justify-content: flex-end;">
          <el-pagination
            v-model:current-page="applyCurrentPage"
            v-model:page-size="applyPageSize"
            :total="applyTotal"
            layout="total, prev, pager, next ,jumper"
            :size="'small'"
            @current-change="handleApplyPageChange"
          />
        </div>
      </div>
    </div>

    <!-- 审批模态框 -->
    <el-dialog
      :title="modalTitle"
      v-model="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="审批意见" prop="comment">
          <el-input v-model="form.comment" type="textarea" :rows="4" placeholder="请输入审批意见" />
        </el-form-item>
        <el-form-item label="审批状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="通过" value="通过" />
            <el-option label="不通过" value="不通过" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'

export default {
  name: 'OutApply',
  data() {
    return {
      searchName: '',
      // 左侧客户信息数据
      customerData: [
        { id: 1, name: '孙瑞英', age: 68, gender: '女', bed: '2012-1', nursingLevel: '二级' },
        { id: 2, name: '张帆', age: 77, gender: '男', bed: '1014-1', nursingLevel: '三级' },
        { id: 3, name: '苗月兰', age: 67, gender: '女', bed: '2005-1', nursingLevel: '二级' },
        { id: 4, name: '李建国', age: 82, gender: '男', bed: '3001-1', nursingLevel: '一级' },
        { id: 5, name: '王秀英', age: 75, gender: '女', bed: '3001-2', nursingLevel: '二级' },
        { id: 6, name: '李四', age: 82, gender: '男', bed: '3001-1', nursingLevel: '一级' },
        { id: 7, name: '李李', age: 82, gender: '男', bed: '3001-1', nursingLevel: '一级' }
      ],
      // 右侧退住申请数据
      applyData: [
        { id: 1, name: '孙瑞英', checkInTime: '2023-11-10', checkOutTime: '2023-11-15', type: '正常退住', reason: '家里有安排', approveTime: '', status: '已提交', bed: '1201-1' },
        { id: 2, name: '孙瑞英', checkInTime: '2023-11-10', checkOutTime: '2023-11-20', type: '保留床位', reason: '回家看看', approveTime: '2023-12-30', status: '不通过', bed: '1201-1' },
        { id: 3, name: '孙瑞英', checkInTime: '2023-11-10', checkOutTime: '2023-12-30', type: '死亡退住', reason: '因病去世', approveTime: '2023-12-30', status: '通过', bed: '1201-1' },
        { id: 4, name: '张帆', checkInTime: '2024-01-01', checkOutTime: '2024-02-01', type: '正常退住', reason: '回家休养', approveTime: '', status: '已提交', bed: '1014-1' },
        { id: 5, name: '苗月兰', checkInTime: '2024-01-15', checkOutTime: '2024-01-30', type: '保留床位', reason: '外出旅游', approveTime: '', status: '已提交', bed: '2005-1' },
        { id: 6, name: '李四', checkInTime: '2024-01-15', checkOutTime: '2024-01-30', type: '保留床位', reason: '外出旅游', approveTime: '', status: '已提交', bed: '2005-1' }
      ],
      
      // 左侧分页参数
      customerCurrentPage: 1,
      customerPageSize: 5,
      
      // 右侧分页参数
      applyCurrentPage: 1,
      applyPageSize: 5,
      
      dialogVisible: false,
      modalTitle: '',
      form: {
        comment: '',
        status: ''
      },
      rules: {
        comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }],
        status: [{ required: true, message: '请选择审批状态', trigger: 'change' }]
      },
      currentRow: null
    }
  },
  computed: {
    // 左侧筛选后的数据
    filteredCustomerData() {
      if (!this.searchName) {
        return this.customerData;
      }
      return this.customerData.filter(item => item.name.includes(this.searchName));
    },
    // 左侧显示的数据（分页后）
    displayCustomerData() {
      const start = (this.customerCurrentPage - 1) * this.customerPageSize
      const end = start + this.customerPageSize
      return this.filteredCustomerData.slice(start, end)
    },
    // 左侧总数
    customerTotal() {
      return this.filteredCustomerData.length
    },
    
    // 右侧筛选后的数据（根据搜索姓名）
    filteredApplyData() {
      if (!this.searchName) {
        return this.applyData;
      }
      return this.applyData.filter(item => item.name.includes(this.searchName));
    },
    // 右侧显示的数据（分页后）
    displayApplyData() {
      const start = (this.applyCurrentPage - 1) * this.applyPageSize
      const end = start + this.applyPageSize
      return this.filteredApplyData.slice(start, end)
    },
    // 右侧总数
    applyTotal() {
      return this.filteredApplyData.length
    }
  },
  watch: {
    // 监听搜索条件变化，重置分页
    searchName() {
      this.customerCurrentPage = 1
      this.applyCurrentPage = 1
    }
  },
  methods: {
    handleSearch() {
      console.log('搜索:', this.searchName);
      this.customerCurrentPage = 1
      this.applyCurrentPage = 1
      if (this.searchName) {
        const count = this.filteredCustomerData.length
        ElMessage.success(`找到 ${count} 条客户记录`)
      }
    },
    
    // 左侧分页变化
    handleCustomerPageChange(page) {
      this.customerCurrentPage = page
    },
    
    // 右侧分页变化
    handleApplyPageChange(page) {
      this.applyCurrentPage = page
    },
    
    openApproveModal(row) {
      this.modalTitle = '审批申请'
      this.dialogVisible = true
      // 保存当前要审批的行数据
      this.currentRow = JSON.parse(JSON.stringify(row)) // 深拷贝
      this.form = {
        comment: '',
        status: ''
      }
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    
    // 对话框关闭时的回调
    handleDialogClose() {
      this.form = {
        comment: '',
        status: ''
      }
      this.currentRow = null
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },
    
    submitApprove() {
      // 检查表单引用
      if (!this.$refs.formRef) {
        console.error('表单引用不存在')
        ElMessage.error('表单初始化失败，请刷新页面重试')
        return
      }
      
      // 检查是否有要审批的数据
      if (!this.currentRow) {
        ElMessage.error('未找到要审批的记录')
        return
      }
      
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 查找要更新的数据索引
          const index = this.applyData.findIndex(item => item.id === this.currentRow.id)
          
          if (index !== -1) {
            // 获取当前时间
            const now = new Date()
            const approveTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
            
            // 创建更新后的数据对象
            const updatedRow = {
              ...this.applyData[index], // 使用原数据
              status: this.form.status,
              approveTime: approveTime
            }
            
            // 使用数组替换方式更新数据（Vue 2 响应式）
            this.applyData.splice(index, 1, updatedRow)
            
            // 显示成功消息
            ElMessage.success(`审批${this.form.status === '通过' ? '通过' : '不通过'}成功`)
            
            // 关闭对话框
            this.dialogVisible = false
            
            // 重置表单
            this.form = {
              comment: '',
              status: ''
            }
            this.currentRow = null
          } else {
            ElMessage.error('未找到对应的申请记录')
          }
        } else {
          ElMessage.warning('请填写完整的审批信息')
        }
      })
    }
  }
}
</script>

<style scoped>
.el-table {
  font-size: 14px;
}
</style>