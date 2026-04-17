<!-- src/views/outApply.vue -->
<template>
  <div class="out-apply-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">退住申请管理</h2>
        <span class="page-subtitle">健康管家专属服务通道</span>
      </div>
    </div>

    <!-- 搜索与操作栏 -->
    <div class="filter-bar">
      <el-card shadow="never" class="search-card">
        <div class="bar-content">
          <div class="search-inputs">
            <el-input 
              v-model="searchForm.customerName" 
              placeholder="请输入客户姓名查询" 
              clearable 
              prefix-icon="Search"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" plain @click="openApplyDialog">
              <el-icon><Plus /></el-icon> 新增申请
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格区 -->
    <div class="table-wrapper">
      <el-card shadow="never" class="table-card">
        <el-table 
          :data="filteredApplications" 
          stripe 
          style="width: 100%"
          v-loading="loading"
          empty-text="暂无相关退住申请记录"
        >
          <el-table-column prop="customerName" label="客户姓名" width="120" align="center">
            <template #default="{ row }">
              <span class="customer-name">{{ row.customerName }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="当前床位" width="140" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">
                {{ row.buildingNo }}栋 {{ row.roomNo }}室 {{ row.bedNo }}床
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="checkoutType" label="退住类型" width="120" align="center" />
          
          <el-table-column prop="reason" label="退住原因" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="reason-text">{{ row.reason }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="checkoutTime" label="预计退住时间" width="130" align="center" />
          
          <el-table-column prop="status" label="审批状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="提交时间" width="160" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ row.createTime }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 申请弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="办理退住申请" 
      width="550px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form :model="applyForm" :rules="rules" ref="applyFormRef" label-width="90px" class="apply-form">
        <el-form-item label="服务对象" prop="customerId">
          <el-select 
            v-model="applyForm.customerId" 
            placeholder="请选择您要服务的客户" 
            style="width: 100%"
            @change="handleCustomerChange"
          >
            <el-option
              v-for="customer in myCustomers"
              :key="customer.id"
              :label="`${customer.name} (${customer.buildingNo}-${customer.roomNo}-${customer.bedNo})`"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="退住类型" prop="checkoutType">
              <el-select v-model="applyForm.checkoutType" placeholder="选择类型" style="width: 100%">
                <el-option label="正常退住" value="正常退住" />
                <el-option label="转院治疗" value="转院治疗" />
                <el-option label="家属接回" value="家属接回" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退住时间" prop="checkoutTime">
              <el-date-picker
                v-model="applyForm.checkoutTime"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细原因" prop="reason">
          <el-input 
            v-model="applyForm.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请简要说明客户退住的具体原因..."
          />
        </el-form-item>

        <div class="form-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>提交后系统将自动通知管理员进行审批，当前状态为“已提交”。</span>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitApplication" :loading="submitting">提 交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, InfoFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const submitting = ref(false)
const myCustomers = ref([
  { id: 1, name: '张建国', buildingNo: '606', roomNo: '101', bedNo: '1' },
  { id: 2, name: '李淑芬', buildingNo: '606', roomNo: '102', bedNo: '2' },
  { id: 3, name: '赵小红', buildingNo: '606', roomNo: '201', bedNo: '1' },
  { id: 4, name: '王大爷', buildingNo: '606', roomNo: '305', bedNo: '1' }
])

const applications = ref([])
const STORAGE_KEY = 'outApplyList'
const searchForm = reactive({ customerName: '' })
const dialogVisible = ref(false)
const applyFormRef = ref(null)

const applyForm = reactive({
  customerId: '', customerName: '', buildingNo: '', roomNo: '', bedNo: '',
  checkoutType: '', reason: '', checkoutTime: '', status: '已提交'
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  checkoutType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  reason: [{ required: true, message: '请填写原因', trigger: 'blur' }],
  checkoutTime: [{ required: true, message: '请选择时间', trigger: 'change' }]
}

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) applications.value = JSON.parse(stored)
})

const filteredApplications = computed(() => {
  if (!searchForm.customerName) return applications.value
  return applications.value.filter(app => app.customerName.includes(searchForm.customerName))
})

const handleSearch = () => { loading.value = true; setTimeout(() => loading.value = false, 300) }
const handleReset = () => { searchForm.customerName = ''; handleSearch() }

const openApplyDialog = () => {
  Object.assign(applyForm, { customerId: '', customerName: '', buildingNo: '', roomNo: '', bedNo: '', checkoutType: '', reason: '', checkoutTime: '', status: '已提交' })
  dialogVisible.value = true
}

const handleCustomerChange = (id) => {
  const c = myCustomers.value.find(x => x.id === id)
  if (c) Object.assign(applyForm, { customerName: c.name, buildingNo: c.buildingNo, roomNo: c.roomNo, bedNo: c.bedNo })
}

const submitApplication = () => {
  applyFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        applications.value.unshift({ ...applyForm, id: Date.now(), createTime: new Date().toLocaleString() })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications.value))
        ElMessage.success('申请已提交，等待审批')
        dialogVisible.value = false
        submitting.value = false
      }, 600)
    }
  })
}

const getStatusType = (status) => ({ '已提交': 'warning', '已通过': 'success', '已驳回': 'danger' }[status] || 'info')
</script>

<style scoped>
.out-apply-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 头部样式 */
.page-header {
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-left: 4px solid #409eff;
}
.page-title { margin: 0; font-size: 20px; color: #303133; font-weight: 600; }
.page-subtitle { font-size: 13px; color: #909399; margin-top: 4px; display: block; }

/* 筛选栏样式 */
.filter-bar { margin-bottom: 20px; }
.search-card { border: none; }
.bar-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
.search-inputs { display: flex; gap: 10px; }
.search-input { width: 240px; }
.action-buttons { display: flex; gap: 10px; }

/* 表格样式 */
.table-card { border: none; }
.customer-name { font-weight: 500; color: #303133; }
.reason-text { color: #606266; }
.time-text { color: #909399; font-size: 13px; }

/* 弹窗样式 */
.apply-form { padding: 10px 0; }
.form-tip {
  background-color: #f4f4f5;
  color: #909399;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }

:deep(.el-card__body) { padding: 20px; }
:deep(.el-table th) { background-color: #fafafa; color: #606266; font-weight: 600; }
</style>