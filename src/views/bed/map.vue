<template>
  <div class="bed-map-container">
    <div class="page-header">
      <h2>床位示意图</h2>
      <el-select v-model="selectedFloor" @change="loadFloorData" placeholder="选择楼层" style="width: 160px">
        <el-option v-for="floor in floors" :key="floor.id" :label="floor.name" :value="floor.id" />
      </el-select>
    </div>

    <div class="statistics-bar">
      <el-row :gutter="15">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ statistics.total }}</div>
            <div class="stat-text">总床位数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ statistics.available }}</div>
            <div class="stat-text">空闲床位</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ statistics.occupied }}</div>
            <div class="stat-text">有人床位</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ statistics.outside }}</div>
            <div class="stat-text">外出床位</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="content-wrapper">
      <div class="map-area">
        <div class="room-grid">
          <div 
            v-for="(room, index) in currentFloorRooms" 
            :key="index" 
            class="room-box"
            @click="viewRoomDetails(room)"
            :class="{ 'room-active': selectedRoom?.number === room.number }"
          >
            <div class="room-title">
              <span>{{ room.number }}</span>
              <span class="room-type-tag">{{ room.type }}</span>
            </div>
            <div class="bed-list">
              <div 
                v-for="bed in room.beds" 
                :key="bed.id" 
                class="bed-box"
                :class="getBedStatusClass(bed.status)"
                :title="getBedTooltip(bed)"
              >
                <span class="bed-label">{{ bed.bedNo }}号</span>
                <span class="bed-status-icon">{{ getBedIcon(bed.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-panel" v-if="selectedRoom">
        <div class="panel-title-bar">
          <h3>{{ selectedRoom.number }} 房间详情</h3>
          <el-button link @click="selectedRoom = null">关闭</el-button>
        </div>
        
        <div class="panel-body">
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">房间类型：</span>
              <span class="info-value">{{ selectedRoom.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">床位总数：</span>
              <span class="info-value">{{ selectedRoom.beds.length }}</span>
            </div>
          </div>

          <div class="bed-table-section">
            <h4>床位列表</h4>
            <el-table :data="selectedRoom.beds" size="small" border>
              <el-table-column prop="bedNo" label="床号" width="70" align="center" />
              <el-table-column prop="patientName" label="入住人" min-width="100">
                <template #default="{ row }">
                  {{ row.patientName || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  {{ getBedStatusText(row.status) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleTransferBed(row)">床位调换</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div class="panel-footer">
            <el-button type="primary" @click="handleAssignBed">安排入住</el-button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-panel">
        <el-empty description="点击左侧房间查看详情" :image-size="100" />
      </div>
    </div>

    <el-dialog v-model="checkinDialogVisible" title="入住登记" width="500px" :close-on-click-modal="false">
      <el-form :model="checkinForm" label-width="85px" :rules="checkinRules" ref="checkinFormRef">
        <el-form-item label="房间床位">
          <el-input :value="`${selectedRoom?.number} ${checkinForm.bedNo}号`" disabled />
        </el-form-item>
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="checkinForm.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="入住日期" prop="checkinDate">
          <el-date-picker v-model="checkinForm.checkinDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="checkinForm.checkoutDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCheckin">确认登记</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferDialogVisible" title="床位调换" width="500px" :close-on-click-modal="false">
      <el-form :model="transferForm" label-width="100px">
        <el-form-item label="当前位置">
          <el-input :value="`${transferForm.roomNo} ${transferForm.bedNo}号`" disabled />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="transferForm.patientName" disabled />
        </el-form-item>
        <el-form-item label="目标房间" required>
          <el-select v-model="transferForm.targetRoomNo" @change="onTargetRoomChange" placeholder="选择房间" style="width:100%">
            <el-option v-for="room in allRooms" :key="room.number" :label="room.number" :value="room.number" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标床位" required>
          <el-select v-model="transferForm.targetBedNo" placeholder="选择床位" style="width:100%">
            <el-option v-for="bed in targetRoomBeds" :key="bed.id" :label="`${bed.bedNo}号`" :value="bed.bedNo" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransferBed">确认调换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const selectedFloor = ref('1')
const selectedRoom = ref(null)

const floors = ref([
  { id: '1', name: '1楼 - 自理区' },
  { id: '2', name: '2楼 - 护理区' },
  { id: '3', name: '3楼 - 特护区' }
])

const STORAGE_KEY_ROOMS = 'bedMapData'
const STORAGE_KEY_BED_LIST = 'bedUsageList'

const floorDataCache = ref({})
const bedUsageList = ref([])

const generateRooms = (floorId) => {
  const rooms = []
  const prefix = floorId + '0'
  for (let i = 1; i <= 10; i++) {
    const roomNo = `${prefix}${i}`
    rooms.push({
      number: roomNo,
      type: i % 3 === 0 ? '双人房' : '单人房',
      beds: [
        { id: `${roomNo}-1`, bedNo: '1', patientName: '', status: 'free' },
        { id: `${roomNo}-2`, bedNo: '2', patientName: '', status: 'free' }
      ]
    })
  }
  return rooms
}

onMounted(() => {
  const savedRooms = localStorage.getItem(STORAGE_KEY_ROOMS)
  const savedList = localStorage.getItem(STORAGE_KEY_BED_LIST)
  if (savedRooms) floorDataCache.value = JSON.parse(savedRooms)
  else {
    floorDataCache.value['1'] = generateRooms('1')
    floorDataCache.value['2'] = generateRooms('2')
    floorDataCache.value['3'] = generateRooms('3')
  }
  if (savedList) bedUsageList.value = JSON.parse(savedList)
})

const saveToLocal = () => {
  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(floorDataCache.value))
  localStorage.setItem(STORAGE_KEY_BED_LIST, JSON.stringify(bedUsageList.value))
}

const currentFloorRooms = computed(() => floorDataCache.value[selectedFloor.value] || [])
const allRooms = computed(() => currentFloorRooms.value)

const statistics = computed(() => {
  let total = 0, available = 0, occupied = 0, outside = 0
  currentFloorRooms.value.forEach(room => {
    room.beds.forEach(bed => {
      total++
      if (bed.status === 'free') available++
      else if (bed.status === 'occupied') occupied++
      else if (bed.status === 'outside') outside++
    })
  })
  return { total, available, occupied, outside }
})

const loadFloorData = () => selectedRoom.value = null
const viewRoomDetails = (room) => selectedRoom.value = room

const getBedStatusClass = (s) => ({ free: 'bed-free', occupied: 'bed-occupied', outside: 'bed-outside' }[s] || 'bed-free')
const getBedIcon = (s) => s === 'occupied' ? '●' : s === 'outside' ? '○' : ''
const getBedTooltip = (bed) => bed.status === 'occupied' ? `入住人：${bed.patientName}` : bed.status === 'outside' ? `外出：${bed.patientName}` : '空闲'
const getBedStatusText = (s) => ({ free: '空闲', occupied: '有人', outside: '外出' }[s] || '未知')

const checkinDialogVisible = ref(false)
const checkinFormRef = ref(null)
const checkinForm = ref({ bedNo: '', customerName: '', checkinDate: '', checkoutDate: '' })
const checkinRules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  checkinDate: [{ required: true, message: '请选择入住日期', trigger: 'change' }]
}

const handleAssignBed = () => {
  const b = selectedRoom.value.beds.find(x => x.status === 'free')
  if (!b) return ElMessage.warning('暂无空闲床位')
  checkinForm.value = { bedNo: b.bedNo, customerName: '', checkinDate: new Date().toISOString().split('T')[0], checkoutDate: '' }
  checkinDialogVisible.value = true
}

const confirmCheckin = async () => {
  await checkinFormRef.value.validate()
  const { bedNo, customerName, checkinDate, checkoutDate } = checkinForm.value
  const bed = selectedRoom.value.beds.find(x => x.bedNo === bedNo)
  bed.patientName = customerName
  bed.status = 'occupied'

  const newId = bedUsageList.value.length ? Math.max(...bedUsageList.value.map(x => x.id)) + 1 : 1
  bedUsageList.value.push({
    id: newId, customerName, buildingNo: '606',
    roomNo: selectedRoom.value.number, bedNo, checkinDate, checkoutDate: checkoutDate || null, status: 'active'
  })
  saveToLocal()
  checkinDialogVisible.value = false
  ElMessage.success('入住登记成功')
}

const transferDialogVisible = ref(false)
const transferForm = ref({})
const targetRoomBeds = ref([])

const handleTransferBed = (row) => {
  if (row.status !== 'occupied') return ElMessage.warning('仅有人床位可调换')
  transferForm.value = { roomNo: selectedRoom.value.number, bedNo: row.bedNo, patientName: row.patientName, targetRoomNo: '', targetBedNo: '' }
  transferDialogVisible.value = true
}

const onTargetRoomChange = (roomNo) => {
  const room = currentFloorRooms.value.find(r => r.number === roomNo)
  targetRoomBeds.value = room ? room.beds.filter(x => x.status === 'free') : []
}

const confirmTransferBed = () => {
  const { roomNo, bedNo, patientName, targetRoomNo, targetBedNo } = transferForm.value
  const sourceBed = selectedRoom.value.beds.find(x => x.bedNo === bedNo)
  const targetRoom = currentFloorRooms.value.find(r => r.number === targetRoomNo)
  const targetBed = targetRoom.beds.find(x => x.bedNo === targetBedNo)
  
  if (targetBed.status !== 'free') return ElMessage.warning('目标床位非空闲')
  
  ElMessageBox.confirm(`确认调换${patientName}至${targetRoomNo}${targetBedNo}号？`).then(() => {
    const today = new Date().toISOString().split('T')[0]
    const oldRecord = bedUsageList.value.find(x => x.customerName === patientName && x.status === 'active')
    if (oldRecord) { oldRecord.status = 'history'; oldRecord.checkoutDate = today }

    sourceBed.status = 'free'
    sourceBed.patientName = ''
    targetBed.status = 'occupied'
    targetBed.patientName = patientName

    const newId = bedUsageList.value.length ? Math.max(...bedUsageList.value.map(x => x.id)) + 1 : 1
    bedUsageList.value.push({
      id: newId, customerName: patientName, buildingNo: '606',
      roomNo: targetRoomNo, bedNo: targetBedNo, checkinDate: today, checkoutDate: null, status: 'active'
    })
    saveToLocal()
    transferDialogVisible.value = false
    ElMessage.success('床位调换成功')
  })
}
</script>

<style scoped>
.bed-map-container { padding: 20px; height: calc(100vh - 60px); display: flex; flex-direction: column; background: #f5f7fa; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 16px 20px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.page-header h2 { margin: 0; font-size: 18px; font-weight: 500; color: #303133; }
.statistics-bar { margin-bottom: 20px; }
.stat-item { background: #fff; padding: 16px; border-radius: 6px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-number { font-size: 24px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.stat-text { font-size: 13px; color: #909399; }
.content-wrapper { display: flex; flex: 1; gap: 16px; overflow: hidden; }
.map-area { flex: 1; background: #fff; border-radius: 6px; padding: 20px; overflow-y: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.room-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(150px,1fr)); gap: 12px; }
.room-box { border: 1px solid #e4e7ed; border-radius: 6px; padding: 12px; cursor: pointer; transition: all 0.2s; background: #fff; }
.room-active { border-color: #409eff; background: #edf4ff; }
.room-box:hover { border-color: #409eff; }
.room-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ebeef5; }
.room-title span:first-child { font-weight: 500; font-size: 14px; color: #303133; }
.room-type-tag { font-size: 11px; color: #909399; background: #f4f4f5; padding: 2px 6px; border-radius: 2px; }
.bed-list { display: flex; flex-direction: column; gap: 6px; }
.bed-box { padding: 6px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
.bed-free { background: #fafafa; border: 1px solid #dcdfe6; }
.bed-occupied { background: #f0f9eb; border: 1px solid #67c23a; }
.bed-outside { background: #fdf6ec; border: 1px solid #e6a23c; }
.bed-label { color: #606266; }
.bed-status-icon { font-size: 10px; }
.bed-occupied .bed-status-icon { color: #67c23a; }
.bed-outside .bed-status-icon { color: #e6a23c; }
.detail-panel { width: 360px; background: #fff; border-radius: 6px; display: flex; flex-direction: column; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.panel-title-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #ebeef5; }
.panel-title-bar h3 { margin: 0; font-size: 15px; font-weight: 500; color: #303133; }
.panel-body { flex: 1; padding: 16px; overflow-y: auto; }
.info-list { margin-bottom: 16px; }
.info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f2f5; }
.info-label { width: 80px; color: #909399; font-size: 13px; }
.info-value { flex: 1; color: #303133; font-size: 13px; }
.bed-table-section h4 { margin: 16px 0 10px; font-size: 14px; font-weight: 500; color: #303133; }
.panel-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f2f5; text-align: right; }
.empty-panel { width: 360px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
</style>