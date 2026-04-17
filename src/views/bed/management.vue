<template>
  <div class="bed-management-container">
    
    <div class="page-header">
      <h2>床位管理</h2>
      <p class="desc">床位使用、查询、调换与结束管理</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-card shadow="hover" class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="客户姓名">
            <el-input 
              v-model="searchForm.customerName" 
              placeholder="请输入客户姓名"
              clearable
              style="width: 180px"
            />
          </el-form-item>

          <el-form-item label="入住日期">
            <el-date-picker
              v-model="searchForm.checkinDate"
              type="date"
              placeholder="选择日期"
              style="width: 160px"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="使用状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="全部状态" 
              clearable 
              style="width: 120px"
            >
              <el-option label="正在使用" value="active" />
              <el-option label="使用历史" value="history" />
            </el-select>
          </el-form-item>

          <el-form-item class="btn-group">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格列表 -->
    <div class="table-section">
      <el-card shadow="hover" class="table-card">
        <el-table 
          :data="tableData" 
          v-loading="loading"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#fafbfc' }"
        >
          <el-table-column prop="customerName" label="客户姓名" width="120" align="center" />
          <el-table-column prop="buildingNo" label="楼栋号" width="100" align="center" />
          <el-table-column prop="roomNo" label="房间号" width="100" align="center" />
          
          <el-table-column prop="bedNo" label="床位号" width="100" align="center">
            <template #default="{ row }">
              {{ row.bedNo }}号
            </template>
          </el-table-column>

          <el-table-column prop="checkinDate" label="入住日期" width="130" align="center" />
          
          <el-table-column prop="checkoutDate" label="结束日期" width="130" align="center">
            <template #default="{ row }">
              <span v-if="row.checkoutDate">{{ row.checkoutDate }}</span>
              <span v-else class="status-running">使用中</span>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="使用状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '正在使用' : '使用历史' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'active'"
                link 
                type="primary" 
                size="small"
                @click="handleEditEndDate(row)"
              >
                <el-icon><Edit /></el-icon>修改结束时间
              </el-button>

              <el-button 
                v-if="row.status === 'active'"
                link 
                type="primary" 
                size="small"
                @click="handleTransferBed(row)"
              >
                <el-icon><Connection /></el-icon>床位调换
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页（已全部中文） -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
            :total-text="`共 ${pagination.total} 条`"
            :page-size-text="(size) => `${size} 条/页`"
            prev-text="上一页"
            next-text="下一页"
            jumper-text="跳至"
          />
        </div>
      </el-card>
    </div>

    <!-- 修改结束时间弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改结束时间"
      width="460px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="客户姓名">
          <el-input v-model="editForm.customerName" disabled />
        </el-form-item>

        <el-form-item label="当前床位">
          <el-input :value="`${editForm.buildingNo} ${editForm.roomNo} ${editForm.bedNo}号`" disabled />
        </el-form-item>

        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="editForm.checkoutDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEditEndDate">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 床位调换弹窗 -->
    <el-dialog
      v-model="transferDialogVisible"
      title="床位调换"
      width="520px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form :model="transferForm" label-width="90px">
        <el-form-item label="客户姓名">
          <el-input v-model="transferForm.customerName" disabled />
        </el-form-item>

        <el-form-item label="当前床位">
          <el-input :value="`${transferForm.currentBuildingNo} ${transferForm.currentRoomNo} ${transferForm.currentBedNo}号`" disabled />
        </el-form-item>

        <el-form-item label="目标楼栋">
          <el-input v-model="transferForm.targetBuildingNo" disabled />
        </el-form-item>

        <el-form-item label="目标房间" required>
          <el-select 
            v-model="transferForm.targetRoomNo" 
            placeholder="请选择房间"
            style="width: 100%"
            @change="handleRoomChange"
          >
            <el-option
              v-for="room in availableRooms"
              :key="room.roomNo"
              :label="room.roomNo"
              :value="room.roomNo"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标床位" required>
          <el-select 
            v-model="transferForm.targetBedNo" 
            placeholder="请选择床位"
            style="width: 100%"
          >
            <el-option
              v-for="bed in availableBeds"
              :key="bed.bedNo"
              :label="`${bed.bedNo}号床位`"
              :value="bed.bedNo"
            />
          </el-select>
        </el-form-item>

        <el-alert
          title="床位调换只能当天办理，旧床位将自动释放"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 10px"
        />
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="transferDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmTransferBed">确定调换</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Connection } from '@element-plus/icons-vue'

// 本地存储 KEY
const STORAGE_KEY_BED_LIST = 'bedUsageList'
const STORAGE_KEY_ROOMS = 'bedMapData'

// 加载状态
const loading = ref(false)

// 查询表单
const searchForm = reactive({
  customerName: '',
  checkinDate: '',
  status: ''
})

// 床位数据列表
const bedUsageList = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const loadFromLocal = () => {
  const list = localStorage.getItem(STORAGE_KEY_BED_LIST)
  if (list) {
    bedUsageList.value = JSON.parse(list)
  } else {
    bedUsageList.value = [
      { id: 1, customerName: '张大爷', buildingNo: '606', roomNo: '101', bedNo: '1', checkinDate: '2024-01-15', checkoutDate: null, status: 'active' },
      { id: 2, customerName: '李大神', buildingNo: '606', roomNo: '102', bedNo: '2', checkinDate: '2024-02-20', checkoutDate: null, status: 'active' },
      { id: 3, customerName: '王大叔', buildingNo: '606', roomNo: '103', bedNo: '1', checkinDate: '2023-12-01', checkoutDate: '2024-01-10', status: 'history' }
    ]
    localStorage.setItem(STORAGE_KEY_BED_LIST, JSON.stringify(bedUsageList.value))
  }
  pagination.total = bedUsageList.value.length
}

const saveToLocal = () => {
  localStorage.setItem(STORAGE_KEY_BED_LIST, JSON.stringify(bedUsageList.value))
  syncBedMapAll()
}

// 初始化
onMounted(() => {
  loadFromLocal()
})

const filteredList = computed(() => {
  return bedUsageList.value.filter(item => {
    const nameMatch = searchForm.customerName ? item.customerName.includes(searchForm.customerName) : true
    const dateMatch = searchForm.checkinDate ? item.checkinDate === searchForm.checkinDate : true
    const statusMatch = searchForm.status ? item.status === searchForm.status : true
    return nameMatch && dateMatch && statusMatch
  })
})

const tableData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredList.value.slice(start, end)
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    pagination.total = filteredList.value.length
    pagination.currentPage = 1
    loading.value = false
    ElMessage.success('查询成功')
  }, 300)
}

const handleReset = () => {
  searchForm.customerName = ''
  searchForm.checkinDate = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

const editDialogVisible = ref(false)
const editForm = reactive({
  id: null,
  customerName: '',
  buildingNo: '',
  roomNo: '',
  bedNo: '',
  checkoutDate: ''
})

const handleEditEndDate = (row) => {
  Object.assign(editForm, row)
  editDialogVisible.value = true
}


const disabledDate = (time) => {
  return time.getTime() < Date.now() - 86400000
}

const confirmEditEndDate = () => {
  if (!editForm.checkoutDate) {
    ElMessage.warning('请选择结束时间')
    return
  }
  
  const item = bedUsageList.value.find(i => i.id === editForm.id)
  if (item) {
    item.checkoutDate = editForm.checkoutDate
    item.status = 'history'
    saveToLocal()
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    handleSearch()
  }
}

const transferDialogVisible = ref(false)
const transferForm = reactive({
  customerId: null,
  customerName: '',
  currentBuildingNo: '',
  currentRoomNo: '',
  currentBedNo: '',
  targetBuildingNo: '606',
  targetRoomNo: '',
  targetBedNo: ''
})

const availableRooms = ref([])
const availableBeds = ref([])

const handleTransferBed = (row) => {
  Object.assign(transferForm, {
    customerId: row.id,
    customerName: row.customerName,
    currentBuildingNo: row.buildingNo,
    currentRoomNo: row.roomNo,
    currentBedNo: row.bedNo,
    targetBuildingNo: '606',
    targetRoomNo: '',
    targetBedNo: ''
  })


  availableRooms.value = [
    { roomNo: '101' }, { roomNo: '102' }, { roomNo: '103' },
    { roomNo: '104' }, { roomNo: '105' }, { roomNo: '201' },
    { roomNo: '202' }, { roomNo: '301' }
  ].filter(r => r.roomNo !== transferForm.currentRoomNo)
  
  transferDialogVisible.value = true
}

const handleRoomChange = (roomNo) => {
  transferForm.targetBedNo = ''
  availableBeds.value = [{ bedNo: '1' }, { bedNo: '2' }]
}

const confirmTransferBed = () => {
  if (!transferForm.targetRoomNo || !transferForm.targetBedNo) {
    ElMessage.warning('请完成目标床位选择')
    return
  }

  ElMessageBox.confirm(
    `确认将 ${transferForm.customerName} 调换至 ${transferForm.targetRoomNo} ${transferForm.targetBedNo}号？`,
    '调换确认'
  ).then(() => {
    const today = new Date().toISOString().split('T')[0]
    const old = bedUsageList.value.find(i => i.id === transferForm.customerId)
    
    if (old) {
      old.checkoutDate = today
      old.status = 'history'
    }

    const newId = bedUsageList.value.length ? Math.max(...bedUsageList.value.map(x => x.id)) + 1 : 1
    bedUsageList.value.push({
      id: newId,
      customerName: transferForm.customerName,
      buildingNo: transferForm.targetBuildingNo,
      roomNo: transferForm.targetRoomNo,
      bedNo: transferForm.targetBedNo,
      checkinDate: today,
      checkoutDate: null,
      status: 'active'
    })

    saveToLocal()
    pagination.total = bedUsageList.value.length
    ElMessage.success('床位调换成功')
    transferDialogVisible.value = false
    handleSearch()
  })
}

// ==============================================
// 同步床位示意图状态
// ==============================================
function syncBedMapAll() {
  const map = localStorage.getItem(STORAGE_KEY_ROOMS)
  if (!map) return
  
  const data = JSON.parse(map)
  const active = bedUsageList.value.filter(i => i.status === 'active')

  Object.values(data).forEach(floor => {
    floor.forEach(room => {
      room.beds.forEach(bed => {
        const match = active.find(a => a.roomNo === room.number && a.bedNo === bed.bedNo)
        if (match) {
          bed.status = 'occupied'
          bed.patientName = match.customerName
        } else {
          bed.status = 'free'
          bed.patientName = ''
        }
      })
    })
  })
  
  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(data))
}
</script>

<style scoped>
.bed-management-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.search-section {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 12px;
}

.search-form {
  padding: 8px 0;
}

.btn-group {
  gap: 8px;
  display: flex;
}

.table-section {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 12px;
}

.status-running {
  color: #059669;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  --el-table-row-hover-bg-color: #f9fafb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>