<template>
  <div class="out-apply-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h3>外出申请管理</h3>
      <p class="desc">健康管家可为本服务客户提交外出申请、登记回院信息</p>
    </div>

    <el-container class="main-container">
      <!-- 左侧：客户列表（全新美化版） -->
      <el-aside width="300px" class="left-aside">
        <div class="customer-box">
          <div class="box-header">
            <i class="el-icon-user"></i>
            <span>我的服务客户</span>
          </div>
          <el-input
            v-model="customerSearch"
            placeholder="搜索客户姓名"
            size="small"
            clearable
            class="search-input"
            @input="filterCustomers"
          />
          <div class="customer-list">
            <div
              class="customer-item"
              v-for="customer in filteredCustomers"
              :key="customer.id"
              :class="{ active: selectedCustomer?.id === customer.id }"
              @click="selectCustomer(customer)"
            >
              <div class="avatar"><i class="el-icon-user"></i></div>
              <span class="name">{{ customer.name }}</span>
            </div>
            <div class="empty" v-if="filteredCustomers.length === 0">
              暂无匹配客户
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 右侧：外出申请表单 -->
      <el-main class="main-content">
        <el-card v-if="selectedCustomer" class="form-card" shadow="hover">
          <template #header>
            <div class="card-title">
              <i class="el-icon-document"></i>
              <span>为 {{ selectedCustomer.name }} 提交外出申请</span>
            </div>
          </template>
          <el-form :model="applyForm" label-width="120px" class="apply-form">
            <el-form-item label="外出事由" prop="reason" required>
              <el-input
                v-model="applyForm.reason"
                placeholder="请输入外出事由（就医/探亲/其他）"
                clearable
              />
            </el-form-item>
            <el-form-item label="外出时间" prop="outTime" required>
              <el-date-picker
                v-model="applyForm.outTime"
                type="datetime"
                placeholder="选择外出时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="预计回院时间" prop="expectedReturnTime" required>
              <el-date-picker
                v-model="applyForm.expectedReturnTime"
                type="datetime"
                placeholder="选择预计回院时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitApply" :loading="submitting">
                <i class="el-icon-check"></i>提交外出申请
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-empty v-else description="请在左侧选择客户，再添加外出申请" class="empty-box" />
      </el-main>
    </el-container>

    <!-- 外出申请记录列表 -->
    <el-card class="list-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <i class="el-icon-tickets"></i>
          <span>外出申请记录</span>
          <el-input
            v-model="applySearch"
            placeholder="搜索客户姓名"
            size="small"
            style="width: 220px"
            clearable
            @input="filterApplies"
          />
        </div>
      </template>
      <el-table :data="filteredApplies" border stripe size="default" style="width: 100%">
        <el-table-column prop="customerName" label="客户姓名" align="center" width="140" />
        <el-table-column prop="reason" label="外出事由" align="center" min-width="180" />
        <el-table-column prop="outTime" label="外出时间" align="center" width="180" />
        <el-table-column prop="expectedReturnTime" label="预计回院时间" align="center" width="180" />
        <el-table-column label="审批状态" align="center" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualReturnTime" label="实际回院时间" align="center" width="180" />
        <el-table-column label="操作" align="center" width="160">
          <template #default="scope">
            <el-button
              v-if="!scope.row.actualReturnTime"
              type="success"
              size="small"
              @click="openReturnDialog(scope.row)"
            >
              <i class="el-icon-date"></i>登记回院
            </el-button>
            <span v-else style="color:#67c23a">已回院</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 回院登记弹窗 -->
    <el-dialog v-model="returnDialogVisible" title="回院时间登记" width="500px" center>
      <el-form :model="returnForm" label-width="120px" class="return-form">
        <el-form-item label="实际回院时间" required>
          <el-date-picker
            v-model="returnForm.actualReturnTime"
            type="datetime"
            placeholder="选择实际回院时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="returnDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReturn">确认登记</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟客户数据（我的服务客户）
const customers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])

// 外出申请记录
const applies = ref([
  {
    id: 1,
    customerId: 1,
    customerName: '张三',
    reason: '就医检查',
    outTime: '2025-12-20 09:30:00',
    expectedReturnTime: '2025-12-20 12:00:00',
    status: '已提交',
    actualReturnTime: null
  },
  {
    id: 2,
    customerId: 2,
    customerName: '李四',
    reason: '家属探亲',
    outTime: '2025-12-19 14:00:00',
    expectedReturnTime: '2025-12-19 17:30:00',
    status: '已审批',
    actualReturnTime: '2025-12-19 16:45:00'
  }
])

// 状态
const customerSearch = ref('')
const selectedCustomer = ref(null)
const applySearch = ref('')
const submitting = ref(false)

// 申请表单
const applyForm = ref({
  reason: '',
  outTime: null,
  expectedReturnTime: null
})

// 回院登记
const returnDialogVisible = ref(false)
const returnForm = ref({ actualReturnTime: new Date() })
let currentApply = null

// 客户筛选
const filteredCustomers = computed(() => {
  if (!customerSearch.value) return customers.value
  return customers.value.filter(c => c.name.includes(customerSearch.value))
})

// 申请记录筛选
const filteredApplies = computed(() => {
  if (!applySearch.value) return applies.value
  return applies.value.filter(a => a.customerName.includes(applySearch.value))
})

// 状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case '已提交': return 'info'
    case '已审批': return 'success'
    case '已拒绝': return 'danger'
    default: return ''
  }
}

// 选择客户
const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  applyForm.value = { reason: '', outTime: null, expectedReturnTime: null }
}

// 提交外出申请
const submitApply = () => {
  const { reason, outTime, expectedReturnTime } = applyForm.value
  if (!reason || !outTime || !expectedReturnTime) {
    ElMessage.warning('请填写完整申请信息')
    return
  }

  submitting.value = true
  setTimeout(() => {
    const newApply = {
      id: Date.now(),
      customerId: selectedCustomer.value.id,
      customerName: selectedCustomer.value.name,
      reason,
      outTime: outTime.toLocaleString(),
      expectedReturnTime: expectedReturnTime.toLocaleString(),
      status: '已提交',
      actualReturnTime: null
    }
    applies.value.unshift(newApply)
    applyForm.value = { reason: '', outTime: null, expectedReturnTime: null }
    ElMessage.success('外出申请提交成功')
    submitting.value = false
  }, 300)
}

// 打开回院登记
const openReturnDialog = (apply) => {
  currentApply = apply
  returnForm.value.actualReturnTime = new Date()
  returnDialogVisible.value = true
}

// 确认回院登记
const confirmReturn = () => {
  if (!returnForm.value.actualReturnTime) {
    ElMessage.warning('请选择实际回院时间')
    return
  }
  currentApply.actualReturnTime = returnForm.value.actualReturnTime.toLocaleString()
  returnDialogVisible.value = false
  ElMessage.success('回院时间登记成功')
}

// 空方法
const filterCustomers = () => {}
const filterApplies = () => {}
</script>

<style scoped>
/* 页面整体 */
.out-apply-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}
.page-header h3 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}
.page-header .desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
}

/* 主容器 */
.main-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
}

/* 左侧客户栏 */
.left-aside {
  background-color: #fafbfc;
  border-right: 1px solid #eef1f5;
}
.customer-box {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.box-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}
.box-header i {
  color: #3b82f6;
  margin-right: 8px;
}
.search-input {
  margin-bottom: 16px;
}

/* 客户列表 */
.customer-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.customer-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}
.customer-item:hover {
  border-color: #dbeafe;
  background: #eff6ff;
}
.customer-item.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.avatar i {
  color: #3b82f6;
  font-size: 14px;
}
.customer-item.active .avatar {
  background: rgba(255, 255, 255, 0.2);
}
.customer-item.active .avatar i {
  color: #fff;
}
.name {
  font-size: 14px;
}
.empty {
  text-align: center;
  padding: 30px 0;
  color: #c0c4cc;
  font-size: 13px;
}

/* 右侧表单 */
.main-content {
  padding: 24px;
}
.form-card {
  border-radius: 10px;
}
.card-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
}
.card-title i {
  color: #3b82f6;
  margin-right: 8px;
}
.apply-form {
  max-width: 600px;
  margin-top: 10px;
}
.empty-box {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 申请列表卡片 */
.list-card {
  border-radius: 10px;
}
.list-card .card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表格 */
:deep(.el-table) {
  margin-top: 10px;
  border-radius: 8px;
}
:deep(.el-table th) {
  background-color: #fafbfc;
  font-weight: 600;
}

/* 弹窗 */
.return-form {
  padding: 10px 0;
}
.dialog-footer {
  text-align: right;
}
</style>