<template>
  <div style="background: white; padding: 20px; border-radius: 8px;">
    <h2>退住申请</h2>
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <el-input v-model="searchName" placeholder="客户姓名" style="width: 200px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openAddApplyModal">登记</el-button>
      <el-button type="warning" @click="handleReset">重置</el-button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="background: #ADD8E6; color: white; padding: 10px; font-weight: bold;">客户信息</div>
        <el-table :data="displayCustomerData" style="width: 100%" @row-click="handleRowClick" highlight-current-row>
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="bed" label="床号" width="100" />
          <el-table-column prop="nursingLevel" label="护理级别" width="100" />
        </el-table>
        <div style="padding: 10px; display: flex; justify-content: flex-end;">
          <el-pagination
            v-model:current-page="customerCurrentPage"
            v-model:page-size="customerPageSize"
            :total="customerTotal"
            layout="total, prev, pager, next, jumper"
            :size="'small'"
            @current-change="handleCustomerPageChange"
          />
        </div>
      </div>

      <div style="border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="background: #ADD8E6; color: white; padding: 10px; font-weight: bold;">退住申请</div>
        <el-table :data="displayApplyData" style="width: 100%">
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="name" label="客户姓名" width="100" />
          <el-table-column prop="checkInTime" label="入住时间" width="120" />
          <el-table-column prop="checkOutTime" label="退住时间" width="120" />
          <el-table-column prop="type" label="退住类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="退住原因" width="120" />
          <el-table-column prop="approveTime" label="审批时间" width="120" />
          <el-table-column prop="status" label="审批状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="bed" label="床位" width="100" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button v-if="row.status === '已提交'" size="small" type="primary" @click="openApproveModal(row)">审批</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="padding: 10px; display: flex; justify-content: flex-end;">
          <el-pagination v-model:current-page="applyCurrentPage" v-model:page-size="applyPageSize" :total="applyTotal"
            layout="total, prev, pager, next, jumper" :size="'small'" @current-change="handleApplyPageChange"/>
        </div>
      </div>
    </div>

    <el-dialog title="新增退住申请" v-model="addDialogVisible" width="550px" @close="resetAddForm">
      <el-form :model="addForm" label-width="110px" :rules="addRules" ref="addFormRef">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="addForm.customerName" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="退住类型" prop="type">
          <el-select v-model="addForm.type" placeholder="请选择退住类型" style="width: 100%">
            <el-option label="正常退住" value="正常退住" />
            <el-option label="保留床位" value="保留床位" />
            <el-option label="死亡退住" value="死亡退住" />
            <el-option label="转院退住" value="转院退住" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="退住原因" prop="reason">
          <el-input v-model="addForm.reason" type="textarea" :rows="3" placeholder="请输入退住原因"/>
        </el-form-item>
        <el-form-item label="退住时间" prop="checkOutTime">
          <el-date-picker v-model="addForm.checkOutTime"  type="date" placeholder="选择退住时间" value-format="YYYY-MM-DD" style="width: 100%"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddApply">提交申请</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="modalTitle" v-model="dialogVisible" width="500px" @close="handleDialogClose">
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

export default {
  name: 'OutApply',
  data() {
    return {
      searchName: '',
      selectedCustomer: null, 
      customerData: [
        { id: 1, name: '张三', age: 68, gender: '女', bed: '1床', nursingLevel: '二级' },
        { id: 2, name: '王小明', age: 77, gender: '男', bed: '2床', nursingLevel: '二级' },
        { id: 3, name: '关二', age: 67, gender: '女', bed: '1床', nursingLevel: '二级' },
        { id: 4, name: '霍一', age: 82, gender: '男', bed: '1床', nursingLevel: '二级' },
        { id: 5, name: '吴吴', age: 75, gender: '女', bed: '1床', nursingLevel: '二级' },
        { id: 6, name: '李四', age: 82, gender: '男', bed: '2床', nursingLevel: '二级' },
        { id: 7, name: '方七', age: 82, gender: '男', bed: '2床', nursingLevel: '二级' },
        { id: 8, name: '杜五', age: 77, gender: '男', bed: '2床', nursingLevel: '二级' },
        { id: 9, name: '一二', age: 67, gender: '女', bed: '2床', nursingLevel: '二级' },
        { id: 10, name: '三四', age: 82, gender: '男', bed: '2床', nursingLevel: '二级' },
        { id: 11, name: '小七', age: 75, gender: '女', bed: '2床', nursingLevel: '二级' },
        { id: 12, name: '于九', age: 82, gender: '男', bed: '1床', nursingLevel: '二级' },
        { id: 13, name: '林六', age: 82, gender: '男', bed: '1床', nursingLevel: '二级' },
        { id: 14, name: '陈国栋', age:78, gender: '男',  bed: '1床',  nursingLevel: '一级' },
        { id: 15, name: '王淑芬', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 16, name: '刘志远', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 17, name: '赵玉兰', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 18, name: '周德明', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 19, name: '吴桂英', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 20, name: '郑文博', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 21, name: '孙丽华', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 22, name: '钱学森', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 23, name: '宋美云', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 24, name: '林凤英', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 25, name: '郭建华', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' },
        { id: 26, name: '唐秀珍', age:65, gender: '女',  bed: '2床', nursingLevel: '一级' }
      ],
      applyData: [
        { id: 1, name: '张三', checkInTime: '2023-11-10', checkOutTime: '2023-11-15', type: '正常退住', reason: '家里有安排', approveTime: '', status: '已提交', bed: '1201-1' },
        { id: 2, name: '王小明', checkInTime: '2023-11-10', checkOutTime: '2023-11-20', type: '保留床位', reason: '回家看看', approveTime: '2023-12-30', status: '不通过', bed: '1201-1' },
        { id: 3, name: '关二', checkInTime: '2023-11-10', checkOutTime: '2023-12-30', type: '死亡退住', reason: '因病去世', approveTime: '2023-12-30', status: '通过', bed: '1201-1' },
        { id: 4, name: '方七', checkInTime: '2024-01-01', checkOutTime: '2024-02-01', type: '正常退住', reason: '回家休养', approveTime: '', status: '已提交', bed: '1014-1' },
        { id: 5, name: '林六', checkInTime: '2024-01-15', checkOutTime: '2024-01-30', type: '保留床位', reason: '外出旅游', approveTime: '', status: '已提交', bed: '2005-1' }
      ],
      customerCurrentPage: 1,
      customerPageSize: 5,

      applyCurrentPage: 1,
      applyPageSize: 5,
      
      addDialogVisible: false,
      addForm: {
        customerId: '',
        customerName: '',
        type: '',
        reason: '',
        checkOutTime: ''
      },
      addRules: {
        type: [{ required: true, message: '请选择退住类型', trigger: 'change' }],
        reason: [{ required: true, message: '请输入退住原因', trigger: 'blur' }],
        checkOutTime: [{ required: true, message: '请选择退住时间', trigger: 'change' }]
      },
      
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
    filteredCustomerData() {
      if (!this.searchName) {
        return this.customerData;
      }
      return this.customerData.filter(item => item.name.includes(this.searchName));
    },
    displayCustomerData() {
      const start = (this.customerCurrentPage - 1) * this.customerPageSize
      const end = start + this.customerPageSize
      return this.filteredCustomerData.slice(start, end)
    },
    customerTotal() {
      return this.filteredCustomerData.length
    },
    filteredApplyData() {
      if (!this.searchName) {
        return this.applyData;
      }
      return this.applyData.filter(item => item.name.includes(this.searchName));
    },
    displayApplyData() {
      const start = (this.applyCurrentPage - 1) * this.applyPageSize
      const end = start + this.applyPageSize
      return this.filteredApplyData.slice(start, end)
    },
    applyTotal() {
      return this.filteredApplyData.length
    }
  },
  watch: {
    searchName() {
      this.customerCurrentPage = 1
      this.applyCurrentPage = 1
    }
  },
  methods: {
    handleReset() {
      this.searchName = ''
      this.selectedCustomer = null
      this.customerCurrentPage = 1
      this.applyCurrentPage = 1
      ElMessage.success('已重置搜索条件')
    },
    
    getStatusType(status) {
      const map = {
        '已提交': 'info',
        '通过': 'success',
        '不通过': 'danger'
      }
      return map[status] || 'info'
    },
    
    getTypeTagType(type) {
      const map = {
        '正常退住': 'success',
        '保留床位': 'warning',
        '死亡退住': 'danger',
        '转院退住': 'info',
        '其他': ''
      }
      return map[type] || 'info'
    },
    
    handleSearch() {
      console.log('搜索:', this.searchName);
      this.customerCurrentPage = 1
      this.applyCurrentPage = 1
      if (this.searchName && this.searchName.trim()) {
        const customerCount = this.filteredCustomerData.length
        const applyCount = this.filteredApplyData.length
        if (customerCount === 0 && applyCount === 0) {
          ElMessage.warning('未找到相关记录')
        } else {
          ElMessage.success(`找到 ${customerCount} 条客户记录，${applyCount} 条申请记录`)
        }
      } else if (!this.searchName || !this.searchName.trim()) {
        ElMessage.warning('请输入客户姓名')
      }
    },
    
    handleRowClick(row) {
      this.selectedCustomer = row
      ElMessage.info(`已选中客户：${row.name}`)
    },
    
    openAddApplyModal() {
      if (!this.selectedCustomer) {
        ElMessage.warning('请先在左侧表格中点击选择一个客户')
        return
      }
      this.addForm = {
        customerId: this.selectedCustomer.id,
        customerName: this.selectedCustomer.name,
        type: '',
        reason: '',
        checkOutTime: ''
      }
      this.addDialogVisible = true
    },
    
    submitAddApply() {
      if (!this.$refs.addFormRef) return
      
      this.$refs.addFormRef.validate((valid) => {
        if (valid) {
          const newId = this.applyData.length > 0 
            ? Math.max(...this.applyData.map(item => item.id)) + 1 
            : 1
          
          const newApply = {
            id: newId,
            name: this.addForm.customerName,
            checkInTime: this.getCheckInTimeByCustomerName(this.addForm.customerName),
            checkOutTime: this.addForm.checkOutTime,
            type: this.addForm.type,
            reason: this.addForm.reason,
            approveTime: '',
            status: '已提交',  
            bed: this.selectedCustomer.bed
          }
          
          this.applyData.unshift(newApply) 
          ElMessage.success('退住申请提交成功')
          this.addDialogVisible = false
          this.resetAddForm()
        }
      })
    },
    
    getCheckInTimeByCustomerName(name) {
      const customer = this.customerData.find(c => c.name === name)
      return '2024-01-01'
    },
    
    resetAddForm() {
      this.addForm = {
        customerId: '',
        customerName: '',
        type: '',
        reason: '',
        checkOutTime: ''
      }
      this.$nextTick(() => {
        if (this.$refs.addFormRef) {
          this.$refs.addFormRef.clearValidate()
        }
      })
    },
    
    handleCustomerPageChange(page) {
      this.customerCurrentPage = page
    },
    
    handleApplyPageChange(page) {
      this.applyCurrentPage = page
    },
    
    openApproveModal(row) {
      this.modalTitle = '退住申请审批'
      this.dialogVisible = true
      this.currentRow = JSON.parse(JSON.stringify(row))
      this.form = {
        comment: '',
        status: ''
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    
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
      if (!this.$refs.formRef) {
        console.error('表单引用不存在')
        ElMessage.error('表单初始化失败，请刷新页面重试')
        return
      }
      
      if (!this.currentRow) {
        ElMessage.error('未找到要审批的记录')
        return
      }
      
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const index = this.applyData.findIndex(item => item.id === this.currentRow.id)
          
          if (index !== -1) {
            const now = new Date()
            const approveTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
            
            const updatedRow = {
              ...this.applyData[index],
              status: this.form.status,
              approveTime: approveTime,
              approveComment: this.form.comment
            }
            
            this.applyData.splice(index, 1, updatedRow)
            ElMessage.success(`审批${this.form.status === '通过' ? '通过' : '不通过'}成功`)
            this.dialogVisible = false
            this.form = { comment: '', status: '' }
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

.el-table__row {
  cursor: pointer;
}

:deep(.el-table__row--current) {
  background-color: #ecf5ff !important;
}
</style>