<template>
  <div class="hospital-service-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>客户护理服务管理</h2>
    </div>

    <el-container class="main-container">
      <!-- 左侧：全新美化版 客户列表 ====================== 这里彻底重做了 -->
      <el-aside width="290px" class="left-aside">
        <div class="customer-card-wrapper">
          <!-- 头部搜索 -->
          <div class="customer-header">
            <div class="header-title">
              <i class="el-icon-user"></i>
              <span>客户列表</span>
            </div>
            <el-input
              v-model="customerSearch"
              placeholder="搜索客户姓名"
              size="small"
              clearable
              class="search-box"
              @input="filterCustomers"
            />
          </div>

          <!-- 客户列表：动态卡片 + 悬浮动效 -->
          <div class="customer-list-container">
            <div
              class="customer-item"
              v-for="customer in filteredCustomers"
              :key="customer.id"
              :class="{ active: selectedCustomer?.id === customer.id }"
              @click="selectCustomer(customer)"
            >
              <div class="customer-avatar">
                <i class="el-icon-user"></i>
              </div>
              <div class="customer-info">
                <div class="customer-name">{{ customer.name }}</div>
                <div class="customer-service-desc">共 {{ customer.services.length }} 项服务</div>
              </div>
              <div class="customer-arrow">
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- 空数据 -->
            <div class="empty-customer" v-if="filteredCustomers.length === 0">
              <span>暂无匹配客户</span>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 右侧主内容区 -->
      <el-main class="right-main">
        <el-card v-if="selectedCustomer" class="card-box service-card">
          <template #header>
            <div class="card-title">
              <i class="el-icon-data-board"></i>
              <span>{{ selectedCustomer.name }} 的护理服务</span>
              <el-button type="primary" size="small" @click="openPurchaseDialog">
                <i class="el-icon-plus"></i>购买护理项目
              </el-button>
            </div>
          </template>
          <el-table :data="selectedCustomer.services" border stripe style="width: 100%">
            <el-table-column prop="name" label="服务项目" align="center" width="200" />
            <el-table-column prop="quantity" label="剩余数量" align="center" width="100" />
            <el-table-column prop="expireDate" label="到期时间" align="center" width="150" />
            <el-table-column label="服务状态" align="center" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(computeStatus(scope.row))" effect="light">
                  {{ computeStatus(scope.row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200">
              <template #default="scope">
                <el-button size="small" type="success" @click="openRenewDialog(scope.row)">
                  <i class="el-icon-refresh"></i>续费
                </el-button>
                <el-button size="small" type="danger" @click="removeService(scope.row)">
                  <i class="el-icon-delete"></i>移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-empty v-else description="请在左侧选择客户查看服务信息" class="empty-box" />
      </el-main>
    </el-container>

    <!-- 购买对话框 -->
    <el-dialog v-model="purchaseDialogVisible" title="购买护理项目" width="650px" center>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="dialog-section">
            <h5><i class="el-icon-menu"></i>可选服务项目</h5>
            <el-input
              v-model="projectSearch"
              placeholder="搜索护理项目"
              clearable
              size="small"
              class="mb-10"
              @input="filterProjects"
            />
            <el-list class="select-list">
              <el-list-item
                v-for="project in filteredProjects"
                :key="project.id"
                :class="{ disabled: isProjectSelected(project) }"
                @click="selectProject(project)"
              >
                {{ project.name }}
              </el-list-item>
            </el-list>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="dialog-section">
            <h5><i class="el-icon-check"></i>已选服务项目</h5>
            <el-list class="selected-list">
              <el-list-item v-for="item in selectedProjects" :key="item.id">
                <div class="selected-item">
                  <span class="item-name">{{ item.name }}</span>
                  <el-input-number v-model="item.quantity" :min="1" size="small" />
                  <el-date-picker
                    v-model="item.expireDate"
                    type="date"
                    placeholder="到期时间"
                    size="small"
                  />
                  <el-button size="mini" type="danger" @click="removeSelectedProject(item)">
                    <i class="el-icon-close"></i>
                  </el-button>
                </div>
              </el-list-item>
            </el-list>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="purchaseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPurchase">确认购买</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 续费对话框 -->
    <el-dialog v-model="renewDialogVisible" title="服务项目续费" width="450px" center>
      <el-form :model="renewForm" label-width="100px" class="renew-form">
        <el-form-item label="新增数量">
          <el-input-number v-model="renewForm.additionalQuantity" :min="1" />
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="renewForm.expireDate"
            type="date"
            placeholder="选择到期时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="renewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRenew">确认续费</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const customers = ref([
  { id: 1, name: '张三', services: [{ id: 1, name: '基础护理', quantity: 10, expireDate: '2024-12-31' },{ id: 2, name: '高级护理', quantity: 5, expireDate: '2024-10-15' }]},
  { id: 2, name: '李四', services: [{ id: 3, name: '基础护理', quantity: 8, expireDate: '2024-11-20' }]}
])

const projects = ref([
  { id: 1, name: '基础护理' },
  { id: 2, name: '高级护理' },
  { id: 3, name: '特殊护理' }
])

// 状态
const customerSearch = ref('')
const selectedCustomer = ref(null)
const purchaseDialogVisible = ref(false)
const renewDialogVisible = ref(false)
const projectSearch = ref('')
const selectedProjects = ref([])
const renewForm = ref({ additionalQuantity: 1, expireDate: new Date() })
let currentService = null

// 过滤
const filteredCustomers = computed(() => {
  if (!customerSearch.value) return customers.value
  return customers.value.filter(customer => customer.name.includes(customerSearch.value))
})

const filteredProjects = computed(() => {
  if (!projectSearch.value) return projects.value
  return projects.value.filter(project => project.name.includes(projectSearch.value))
})

// 服务状态
const computeStatus = (service) => {
  const today = new Date()
  const expireDate = new Date(service.expireDate)
  const daysDiff = (expireDate - today) / (1000 * 60 * 60 * 24)
  if (daysDiff < 0) return '已到期'
  if (daysDiff <= 7) return '即将到期'
  if (service.quantity <= 0) return '已用完'
  return '正常'
}

const getStatusType = (status) => {
  switch (status) {
    case '正常': return 'success'
    case '即将到期': return 'warning'
    case '已到期': return 'danger'
    case '已用完': return 'danger'
    default: return ''
  }
}

// 方法
const selectCustomer = (customer) => { selectedCustomer.value = customer }
const filterCustomers = () => {}
const filterProjects = () => {}

const openPurchaseDialog = () => { purchaseDialogVisible.value = true; selectedProjects.value = [] }
const isProjectSelected = (project) => selectedCustomer.value.services.some(s => s.name === project.name)
const selectProject = (project) => {
  if (isProjectSelected(project)) return
  selectedProjects.value.push({ ...project, quantity: 1, expireDate: new Date() })
}
const removeSelectedProject = (item) => {
  const idx = selectedProjects.value.findIndex(p => p.id === item.id)
  if (idx > -1) selectedProjects.value.splice(idx, 1)
}
const confirmPurchase = () => {
  selectedProjects.value.forEach(item => {
    selectedCustomer.value.services.push({
      id: Date.now() + Math.random(),
      name: item.name,
      quantity: item.quantity,
      expireDate: item.expireDate.toISOString().split('T')[0]
    })
  })
  purchaseDialogVisible.value = false
  ElMessage.success('购买成功')
}

const openRenewDialog = (service) => {
  currentService = service
  renewForm.value = { additionalQuantity: 1, expireDate: new Date(service.expireDate) }
  renewDialogVisible.value = true
}
const confirmRenew = () => {
  currentService.quantity += renewForm.value.additionalQuantity
  currentService.expireDate = renewForm.value.expireDate.toISOString().split('T')[0]
  renewDialogVisible.value = false
  ElMessage.success('续费成功')
}

const removeService = async (service) => {
  try {
    await ElMessageBox.confirm('确定移除此服务吗？此操作不可逆。', '温馨提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    const idx = selectedCustomer.value.services.findIndex(s => s.id === service.id)
    if (idx > -1) selectedCustomer.value.services.splice(idx, 1)
    ElMessage.success('移除成功')
  } catch {}
}
</script>

<style scoped>
/* 页面整体 */
.hospital-service-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 30px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 标题 */
.page-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

/* 主容器 */
.main-container {
  height: calc(100vh - 100px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* ========== 左侧全新客户列表布局 美观 + 动态 ========== */
.left-aside {
  background-color: #fafbfc;
  border-right: 1px solid #eef1f5;
}

.customer-card-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.customer-header {
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}
.header-title i {
  color: #3b82f6;
  margin-right: 8px;
  font-size: 18px;
}

.search-box {
  border-radius: 8px;
}

/* 客户列表容器 */
.customer-list-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

/* 客户卡片项 - 动态效果 */
.customer-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.28s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
}
.customer-item:hover {
  transform: translateX(3px);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.12);
  border-color: #dbeafe;
}
.customer-item.active {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transform: translateX(4px);
}

/* 头像 */
.customer-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}
.customer-avatar i {
  color: #3b82f6;
  font-size: 16px;
}
.customer-item.active .customer-avatar {
  background: rgba(255,255,255,0.25);
}
.customer-item.active .customer-avatar i {
  color: #fff;
}

/* 信息 */
.customer-info {
  flex: 1;
}
.customer-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 3px;
}
.customer-service-desc {
  font-size: 12px;
  color: #64748b;
}
.customer-item.active .customer-service-desc {
  color: rgba(255,255,255,0.8);
}

/* 箭头 */
.customer-arrow {
  font-size: 14px;
  color: #94a3b8;
}
.customer-item.active .customer-arrow {
  color: #fff;
}

.empty-customer {
  padding: 30px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

/* ========== 右侧内容 ========== */
.right-main {
  padding: 24px;
}
.card-box {
  height: 100%;
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
:deep(.el-card__header) {
  background-color: #fafbfc;
  border-bottom: 1px solid #eef1f5;
  padding: 16px 20px;
  border-radius: 10px 10px 0 0;
}
.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}
.card-title i {
  margin-right: 8px;
  color: #3b82f6;
}

:deep(.el-table) {
  margin-top: 10px;
  border-radius: 8px;
}
:deep(.el-table th) {
  background-color: #fafbfc;
  font-weight: 600;
}

.empty-box {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 弹窗 */
.dialog-section h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}
.dialog-section i {
  color: #3b82f6;
  margin-right: 6px;
}
.select-list {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  max-height: 320px;
  overflow-y: auto;
}
:deep(.el-list-item.disabled) {
  color: #c0c4cc;
  cursor: not-allowed;
  background: #f5f7fa;
}
.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.item-name {
  flex: 1;
  min-width: 80px;
}
.dialog-footer {
  text-align: right;
}
.renew-form {
  padding: 10px 0;
}
.mb-10 {
  margin-bottom: 10px;
}
</style>