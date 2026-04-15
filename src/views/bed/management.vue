<template>
  <div class="bed-management-container">
    <div class="page-header">
      <h2>床位管理</h2>
    </div>

    <div class="search-section">
      <el-card shadow="never">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="客户姓名">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户姓名" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="入住日期">
            <el-date-picker v-model="searchForm.checkinDate" type="date" placeholder="选择日期" style="width: 160px" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="使用状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
              <el-option label="正在使用" value="active" />
              <el-option label="使用历史" value="history" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="table-section">
      <el-card shadow="never">
        <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="customerName" label="客户姓名" width="120" align="center" />
          <el-table-column prop="buildingNo" label="楼栋号" width="100" align="center" />
          <el-table-column prop="roomNo" label="房间号" width="100" align="center" />
          <el-table-column prop="bedNo" label="床位号" width="100" align="center">
            <template #default="{ row }">{{ row.bedNo }}号</template>
          </el-table-column>
          <el-table-column prop="checkinDate" label="入住日期" width="120" align="center" />
          <el-table-column prop="checkoutDate" label="结束日期" width="120" align="center">
            <template #default="{ row }">
              <span v-if="row.checkoutDate">{{ row.checkoutDate }}</span>
              <span v-else class="ongoing">使用中</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="使用状态" width="100" align="center">
            <template #default="{ row }">{{ row.status === 'active' ? '正在使用' : '使用历史' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'active'" link type="primary" size="small" @click="handleEditEndDate(row)">修改结束时间</el-button>
              <el-button v-if="row.status === 'active'" link type="primary" size="small" @click="handleTransferBed(row)">床位调换</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10,20,50,100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <el-dialog v-model="editDialogVisible" title="修改结束时间" width="480px" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="客户姓名"><el-input v-model="editForm.customerName" disabled /></el-form-item>
        <el-form-item label="当前床位"><el-input :value="`${editForm.buildingNo} ${editForm.roomNo} ${editForm.bedNo}号`" disabled /></el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker v-model="editForm.checkoutDate" type="date" placeholder="选择结束日期" style="width:100%" value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditEndDate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferDialogVisible" title="床位调换" width="560px" :close-on-click-modal="false">
      <el-form :model="transferForm" label-width="90px">
        <el-form-item label="客户姓名"><el-input v-model="transferForm.customerName" disabled /></el-form-item>
        <el-form-item label="当前床位"><el-input :value="`${transferForm.currentBuildingNo} ${transferForm.currentRoomNo} ${transferForm.currentBedNo}号`" disabled /></el-form-item>
        <el-form-item label="目标楼栋"><el-input v-model="transferForm.targetBuildingNo" disabled /></el-form-item>
        <el-form-item label="目标房间" required>
          <el-select v-model="transferForm.targetRoomNo" placeholder="请选择房间" style="width:100%" @change="handleRoomChange">
            <el-option v-for="room in availableRooms" :key="room.roomNo" :label="room.roomNo" :value="room.roomNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标床位" required>
          <el-select v-model="transferForm.targetBedNo" placeholder="请选择床位" style="width:100%">
            <el-option v-for="bed in availableBeds" :key="bed.bedNo" :label="`${bed.bedNo}号床位`" :value="bed.bedNo" />
          </el-select>
        </el-form-item>
        <el-alert title="床位调换当天办理，旧床位标记失效" type="warning" :closable="false" show-icon />
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransferBed">确定调换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const STORAGE_KEY_BED_LIST = 'bedUsageList'
const STORAGE_KEY_ROOMS = 'bedMapData'

const loading = ref(false)
const searchForm = reactive({ customerName: '', checkinDate: '', status: '' })
const bedUsageList = ref([])

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const loadFromLocal = () => {
  const list = localStorage.getItem(STORAGE_KEY_BED_LIST)
  if (list) bedUsageList.value = JSON.parse(list)
  pagination.total = bedUsageList.value.length
}

const saveToLocal = () => {
  localStorage.setItem(STORAGE_KEY_BED_LIST, JSON.stringify(bedUsageList.value))
}

onMounted(() => loadFromLocal())

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
  return filteredList.value.slice(start, start + pagination.pageSize)
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { pagination.total = filteredList.value.length; loading.value = false; ElMessage.success('查询成功') }, 300)
}

const handleReset = () => {
  searchForm.customerName = ''
  searchForm.checkinDate = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (val) => { pagination.pageSize = val; handleSearch() }
const handleCurrentChange = (val) => { pagination.currentPage = val }

const editDialogVisible = ref(false)
const editForm = reactive({ id: null, customerName: '', buildingNo: '', roomNo: '', bedNo: '', checkoutDate: '' })

const handleEditEndDate = (row) => {
  editForm.id = row.id
  editForm.customerName = row.customerName
  editForm.buildingNo = row.buildingNo
  editForm.roomNo = row.roomNo
  editForm.bedNo = row.bedNo
  editForm.checkoutDate = row.checkoutDate || ''
  editDialogVisible.value = true
}

const disabledDate = (time) => time.getTime() < new Date(new Date().toLocaleDateString()).getTime()

const confirmEditEndDate = () => {
  if (!editForm.checkoutDate) return ElMessage.warning('请选择结束时间')
  const item = bedUsageList.value.find(x => x.id === editForm.id)
  if (item) {
    item.checkoutDate = editForm.checkoutDate
    item.status = 'history'
    saveToLocal()
    syncBedMap(item, 'free')
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    handleSearch()
  }
}

const transferDialogVisible = ref(false)
const transferForm = reactive({
  customerId: null, customerName: '', currentBuildingNo: '', currentRoomNo: '', currentBedNo: '',
  targetBuildingNo: '606', targetRoomNo: '', targetBedNo: ''
})

const availableRooms = ref([])
const availableBeds = ref([])

const handleTransferBed = (row) => {
  transferForm.customerId = row.id
  transferForm.customerName = row.customerName
  transferForm.currentBuildingNo = row.buildingNo
  transferForm.currentRoomNo = row.roomNo
  transferForm.currentBedNo = row.bedNo
  transferForm.targetRoomNo = ''
  transferForm.targetBedNo = ''
  availableRooms.value = [101,102,103,104,105,201,202,301].map(x => ({ roomNo: x+'' }))
  transferDialogVisible.value = true
}

const handleRoomChange = () => {
  transferForm.targetBedNo = ''
  availableBeds.value = [{ bedNo: '1' }, { bedNo: '2' }]
}

const confirmTransferBed = () => {
  if (!transferForm.targetRoomNo || !transferForm.targetBedNo) return ElMessage.warning('请选择房间与床位')
  ElMessageBox.confirm(`确认调换至${transferForm.targetRoomNo}${transferForm.targetBedNo}号？`).then(() => {
    const today = new Date().toISOString().split('T')[0]
    const old = bedUsageList.value.find(x => x.id === transferForm.customerId)
    if (old) { old.status = 'history'; old.checkoutDate = today; syncBedMap(old, 'free') }

    const newId = Math.max(...bedUsageList.value.map(x => x.id)) + 1
    bedUsageList.value.push({
      id: newId, customerName: transferForm.customerName, buildingNo: '606',
      roomNo: transferForm.targetRoomNo, bedNo: transferForm.targetBedNo,
      checkinDate: today, checkoutDate: null, status: 'active'
    })
    syncNewBed(transferForm)
    saveToLocal()
    pagination.total = bedUsageList.value.length
    ElMessage.success('调换成功')
    transferDialogVisible.value = false
    handleSearch()
  })
}

const syncBedMap = (record, status) => {
  const m = localStorage.getItem(STORAGE_KEY_ROOMS)
  if (!m) return
  const d = JSON.parse(m)
  for (const f of Object.values(d)) {
    for (const r of f) {
      if (r.number === record.roomNo) {
        const b = r.beds.find(x => x.bedNo === record.bedNo)
        if (b) { b.status = status; if (status === 'free') b.patientName = '' }
      }
    }
  }
  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(d))
}

const syncNewBed = (form) => {
  const m = localStorage.getItem(STORAGE_KEY_ROOMS)
  if (!m) return
  const d = JSON.parse(m)
  const fid = form.targetRoomNo.charAt(0)
  const f = d[fid]
  if (!f) return
  const r = f.find(x => x.number === form.targetRoomNo)
  if (r) {
    const b = r.beds.find(x => x.bedNo === form.targetBedNo)
    if (b) { b.status = 'occupied'; b.patientName = form.customerName }
  }
  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(d))
}
</script>

<style scoped>
.bed-management-container { padding: 20px; min-height: calc(100vh - 60px); background: #f5f7fa; }
.page-header { margin-bottom: 20px; background: #fff; padding: 16px 20px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.page-header h2 { margin: 0; font-size: 18px; font-weight: 500; color: #303133; }
.search-section { margin-bottom: 16px; }
.table-section { margin-bottom: 20px; }
.ongoing { color: #67c23a; }
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>