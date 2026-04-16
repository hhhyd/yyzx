<template>
  <div style="background: white; padding: 20px; border-radius: 8px;">
    <h2>外出登记</h2>
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <el-input v-model="searchName" placeholder="客户姓名" style="width: 200px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openAddApplyModal">登记</el-button>
      <el-button type="warning" @click="handleReset">重置</el-button>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="background: #ADD8E6; color: white; padding: 10px; font-weight: bold;">
          <span>客户信息</span>
        </div>
        <el-table :data="displayCustomerData" style="width: 100%" @row-click="handleRowClick" highlight-current-row>
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="bed" label="床号" width="100" />
          <el-table-column prop="nursingLevel" label="护理级别" width="100" />
        </el-table>
        <div style="padding: 10px; display: flex; justify-content: flex-end;">
          <el-pagination v-model:current-page="customerCurrentPage" v-model:page-size="customerPageSize" :total="customerTotal"
            layout="total, prev, pager, next, jumper" :size="'small'" @current-change="handleCustomerPageChange"/>
        </div>
      </div>

      <div style="border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="background: #ADD8E6; color: white; padding: 10px; font-weight: bold;">外出申请</div>
        <el-table :data="displayApplyData" style="width: 100%">
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="name" label="客户姓名" width="100" />
          <el-table-column prop="reason" label="外出事由" width="120" />
          <el-table-column prop="outTime" label="外出时间" width="120" />
          <el-table-column prop="expectedReturnTime" label="预计回院时间" width="120" />
          <el-table-column prop="actualReturnTime" label="实际回院时间" width="120">
            <template #default="{ row }">
              <span v-if="row.actualReturnTime">{{ row.actualReturnTime }}</span>
              <el-button v-else-if="row.status === '通过' && !row.actualReturnTime" size="small" type="warning" @click="openReturnModal(row)">
                登记回院
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="companion" label="陪同人" width="100" />
          <el-table-column prop="relation" label="与老人关系" width="100" />
          <el-table-column prop="companionPhone" label="陪同人电话" width="120" />
          <el-table-column prop="status" label="审批状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button v-if="row.status === '已提交'" size="small" type="primary" @click="openApproveModal(row)">审批</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="padding: 10px; display: flex; justify-content: flex-end;">
          <el-pagination v-model:current-page="applyCurrentPage" v-model:page-size="applyPageSize" :total="applyTotal"
            layout="total, prev, pager, next, jumper" :size="'small'"  @current-change="handleApplyPageChange"/>
        </div>
      </div>
    </div>

    <el-dialog title="新增外出申请" v-model="addDialogVisible" width="550px" @close="resetAddForm" >
      <el-form :model="addForm" label-width="110px" :rules="addRules" ref="addFormRef">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="addForm.customerName" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="外出事由" prop="reason">
          <el-input  v-model="addForm.reason" type="textarea" :rows="3" placeholder="请输入外出事由" />
        </el-form-item>
        <el-form-item label="外出时间" prop="outTime">
          <el-date-picker  v-model="addForm.outTime"  type="datetime"  placeholder="选择外出时间"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计回院时间" prop="expectedReturnTime">
          <el-date-picker  v-model="addForm.expectedReturnTime"  type="datetime"  placeholder="选择预计回院时间"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="陪同人" prop="companion">
          <el-input v-model="addForm.companion" placeholder="请输入陪同人姓名" />
        </el-form-item>
        <el-form-item label="与老人关系" prop="relation">
          <el-input v-model="addForm.relation" placeholder="请输入与老人关系" />
        </el-form-item>
        <el-form-item label="陪同人电话" prop="companionPhone">
          <el-input v-model="addForm.companionPhone" placeholder="请输入陪同人电话" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddApply">提交申请</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="modalTitle" v-model="dialogVisible"  width="500px" @close="handleDialogClose" >
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

    <el-dialog title="登记回院时间" v-model="returnDialogVisible" width="450px" @close="resetReturnForm">
      <el-form :model="returnForm" label-width="110px" :rules="returnRules" ref="returnFormRef">
        <el-form-item label="客户姓名" prop="name">
          <el-input v-model="returnForm.name" disabled />
        </el-form-item>
        <el-form-item label="实际回院时间" prop="actualReturnTime">
          <el-date-picker  v-model="returnForm.actualReturnTime"  type="datetime"  placeholder="选择实际回院时间"
           value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReturnTime">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'OutRegister',
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
        { id: 1, name: '张三', reason: '回家', outTime: '2023-11-13 10:00:00', expectedReturnTime: '2023-11-14 10:00:00', actualReturnTime: '2023-11-14 09:30:00', companion: '孙丽', relation: '子女', companionPhone: '13456786754', status: '通过' },
        { id: 2, name: '王小明', reason: '买东西', outTime: '2023-11-10 14:00:00', expectedReturnTime: '2023-11-11 16:00:00', actualReturnTime: '2023-11-11 15:30:00', companion: '孙丽', relation: '子女', companionPhone: '13456786754', status: '不通过' },
        { id: 3, name: '关二', reason: '学习', outTime: '2023-11-15 09:00:00', expectedReturnTime: '2023-11-15 17:00:00', actualReturnTime: '', companion: '孙丽', relation: '子女', companionPhone: '13456786754', status: '已提交' },
        { id: 4, name: '方七', reason: '看病', outTime: '2024-01-10 08:00:00', expectedReturnTime: '2024-01-10 12:00:00', actualReturnTime: '', companion: '张明', relation: '子女', companionPhone: '13800138000', status: '已提交' },
        { id: 5, name: '林六', reason: '探亲', outTime: '2024-01-15 09:00:00', expectedReturnTime: '2024-01-20 17:00:00', actualReturnTime: '', companion: '苗华', relation: '子女', companionPhone: '13900139000', status: '已提交' }
      ],
      
      customerCurrentPage: 1,
      customerPageSize: 5,
      
      applyCurrentPage: 1,
      applyPageSize: 5,
   
      addDialogVisible: false,
      addForm: {
        customerId: '',
        customerName: '',
        reason: '',
        outTime: '',
        expectedReturnTime: '',
        companion: '',
        relation: '',
        companionPhone: ''
      },
      addRules: {
        reason: [{ required: true, message: '请输入外出事由', trigger: 'blur' }],
        outTime: [{ required: true, message: '请选择外出时间', trigger: 'change' }],
        expectedReturnTime: [{ required: true, message: '请选择预计回院时间', trigger: 'change' }],
        companion: [{ required: true, message: '请输入陪同人', trigger: 'blur' }],
        relation: [{ required: true, message: '请输入与老人关系', trigger: 'blur' }],
        companionPhone: [
          { required: true, message: '请输入陪同人电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
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
      currentRow: null,
      
      returnDialogVisible: false,
      returnForm: {
        id: '',
        name: '',
        actualReturnTime: ''
      },
      returnRules: {
        actualReturnTime: [{ required: true, message: '请选择实际回院时间', trigger: 'change' }]
      }
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
        reason: '',
        outTime: '',
        expectedReturnTime: '',
        companion: '',
        relation: '',
        companionPhone: ''
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
            reason: this.addForm.reason,
            outTime: this.addForm.outTime,
            expectedReturnTime: this.addForm.expectedReturnTime,
            actualReturnTime: '',
            companion: this.addForm.companion,
            relation: this.addForm.relation,
            companionPhone: this.addForm.companionPhone,
            status: '已提交'  
          }
          
          this.applyData.unshift(newApply) 
          ElMessage.success('外出申请提交成功')
          this.addDialogVisible = false
          this.resetAddForm()
        }
      })
    },
    
    resetAddForm() {
      this.addForm = {
        customerId: '',
        customerName: '',
        reason: '',
        outTime: '',
        expectedReturnTime: '',
        companion: '',
        relation: '',
        companionPhone: ''
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
      this.modalTitle = '外出申请审批'
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
            const approveTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
            
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
    },
    
    openReturnModal(row) {
      this.returnForm = {
        id: row.id,
        name: row.name,
        actualReturnTime: ''
      }
      this.returnDialogVisible = true
    },
    resetReturnForm() {
      this.returnForm = {
        id: '',
        name: '',
        actualReturnTime: ''
      }
      this.$nextTick(() => {
        if (this.$refs.returnFormRef) {
          this.$refs.returnFormRef.clearValidate()
        }
      })
    },
    
    submitReturnTime() {
      if (!this.$refs.returnFormRef) return
      
      this.$refs.returnFormRef.validate((valid) => {
        if (valid) {
          const index = this.applyData.findIndex(item => item.id === this.returnForm.id)
          if (index !== -1) {
            this.applyData[index].actualReturnTime = this.returnForm.actualReturnTime
            ElMessage.success('回院时间登记成功')
            this.returnDialogVisible = false
            this.resetReturnForm()
          }
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