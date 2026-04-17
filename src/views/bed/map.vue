<template>
  <div class="bed-map-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="left">
        <h2>床位示意图</h2>
        <p class="desc">实时查看床位占用与空闲状态</p>
      </div>
      <el-select 
        v-model="selectedFloor" 
        @change="loadFloorData" 
        placeholder="选择楼层" 
        style="width: 160px"
      >
        <el-option 
          v-for="floor in floors" 
          :key="floor.id" 
          :label="floor.name" 
          :value="floor.id" 
        />
      </el-select>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-bar">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card total">
            <div class="icon">🛏️</div>
            <div class="content">
              <div class="number">{{ statistics.total }}</div>
              <div class="label">总床位数</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card free">
            <div class="icon">✅</div>
            <div class="content">
              <div class="number">{{ statistics.available }}</div>
              <div class="label">空闲床位</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card occupied">
            <div class="icon">👤</div>
            <div class="content">
              <div class="number">{{ statistics.occupied }}</div>
              <div class="label">有人床位</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-card outside">
            <div class="icon">🚪</div>
            <div class="content">
              <div class="number">{{ statistics.outside }}</div>
              <div class="label">外出床位</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主体内容 -->
    <div class="content-wrapper">
      <!-- 床位地图 -->
      <div class="map-area">
        <div class="room-grid">
          <div 
            v-for="(room, index) in currentFloorRooms" 
            :key="index" 
            class="room-box"
            @click="viewRoomDetails(room)"
          >
            <div class="room-title">
              <span class="no">{{ room.number }}</span>
              <el-tag :type="room.status === 'occupied' ? 'success' : 'info'" size="small">
                {{ room.type }}
              </el-tag>
            </div>
            <div class="bed-list">
              <div 
                v-for="bed in room.beds" 
                :key="bed.id" 
                class="bed-box"
                :class="getBedStatusClass(bed.status)"
                :title="getBedTooltip(bed)"
                @click.stop="handleQuickAssign(room, bed)"
              >
                <span class="bed-label">{{ bed.bedNo }}号床</span>
                <span class="bed-dot" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧房间详情 -->
      <div class="detail-panel" v-if="selectedRoom">
        <div class="panel-header">
          <h3>{{ selectedRoom.number }} 房间详情</h3>
          <el-button text @click="selectedRoom = null">关闭</el-button>
        </div>
        
        <div class="panel-body">
          <div class="info-grid">
            <div class="info-item">
              <label>房间类型</label>
              <value>{{ selectedRoom.type }}</value>
            </div>
            <div class="info-item">
              <label>床位总数</label>
              <value>{{ selectedRoom.beds.length }}</value>
            </div>
          </div>

          <div class="bed-table-box">
            <h4>床位明细</h4>
            <el-table :data="selectedRoom.beds" size="small" border>
              <el-table-column prop="bedNo" label="床号" width="70" align="center" />
              <el-table-column prop="patientName" label="入住人" min-width="100">
                <template #default="{ row }">{{ row.patientName || '-' }}</template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'free' ? 'info' : row.status === 'occupied' ? 'success' : 'warning'">
                    {{ getBedStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row }">
                  <el-button 
                    v-if="row.status === 'free'"
                    type="primary" 
                    size="small"
                    @click="handleAssignBed(selectedRoom, row)"
                  >
                    入住
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-tip">
        <el-empty description="点击房间或床位办理入住" :image-size="100" />
      </div>
    </div>

    <!-- 办理入住弹窗 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="办理入住"
      width="520px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form :model="assignForm" label-width="90px" :rules="assignRules" ref="assignFormRef">
        <el-form-item label="房间床位">
          <el-input :value="`${assignForm.roomNo} ${assignForm.bedNo}号床`" disabled />
        </el-form-item>
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="assignForm.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="入住日期" prop="checkinDate">
          <el-date-picker
            v-model="assignForm.checkinDate"
            type="date"
            placeholder="选择入住日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :disabled-date="(time) => time.getTime() > Date.now()"
          />
        </el-form-item>
        <el-form-item label="楼栋号">
          <el-input v-model="assignForm.buildingNo" placeholder="请输入楼栋号" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAssign">确定办理</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 本地存储 KEY
const STORAGE_KEY_BED_LIST = 'bedUsageList'
const STORAGE_KEY_ROOMS = 'bedMapData'

// 状态管理
const selectedFloor = ref('1')
const selectedRoom = ref(null)
const assignDialogVisible = ref(false)
const assignFormRef = ref(null)

// 楼层配置
const floors = ref([
  { id: '1', name: '1楼' },
  { id: '2', name: '2楼' },
  { id: '3', name: '3楼' }
])

// 入住表单
const assignForm = reactive({
  roomNo: '',
  bedNo: '',
  customerName: '',
  checkinDate: new Date().toISOString().split('T')[0],
  buildingNo: '606'
})

// 表单校验规则
const assignRules = {
  customerName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  checkinDate: [
    { required: true, message: '请选择入住日期', trigger: 'change' }
  ]
}

// ==============================================
// 生成房间与床位结构
// ==============================================
const generateBaseRooms = (floorId) => {
  const rooms = []
  const prefix = floorId + '0'
  
  for (let i = 1; i <= 10; i++) {
    const roomNo = `${prefix}${i}`
    const isDouble = i % 3 === 0
    const bedCount = isDouble ? 2 : 1
    const beds = []
    
    for (let j = 1; j <= bedCount; j++) {
      beds.push({
        id: `${roomNo}-${j}`,
        bedNo: String(j),
        patientName: '',
        status: 'free'
      })
    }

    rooms.push({
      number: roomNo,
      type: isDouble ? '双人房' : '单人房',
      status: 'free',
      beds
    })
  }
  return rooms
}

// 楼层数据缓存
const floorDataCache = {
  '1': generateBaseRooms('1'),
  '2': generateBaseRooms('2'),
  '3': generateBaseRooms('3')
}

// ==============================================
// 从本地同步床位状态
// ==============================================
const syncFromLocal = () => {
  const listStr = localStorage.getItem(STORAGE_KEY_BED_LIST)
  if (!listStr) return

  const activeRecords = JSON.parse(listStr).filter(r => r.status === 'active')

  Object.keys(floorDataCache).forEach(fid => {
    floorDataCache[fid].forEach(room => {
      let hasOccupied = false
      room.beds.forEach(bed => {
        const hit = activeRecords.find(
          r => r.roomNo === room.number && r.bedNo === bed.bedNo
        )
        if (hit) {
          bed.status = 'occupied'
          bed.patientName = hit.customerName
          hasOccupied = true
        } else {
          bed.status = 'free'
          bed.patientName = ''
        }
      })
      room.status = hasOccupied ? 'occupied' : 'free'
    })
  })
}

// ==============================================
// 生命周期
// ==============================================
onMounted(() => {
  syncFromLocal()
  const map = localStorage.getItem(STORAGE_KEY_ROOMS)
  if (!map) {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(floorDataCache))
  }
})

// 监听楼层切换
watch(selectedFloor, () => {
  syncFromLocal()
  selectedRoom.value = null
})

// ==============================================
// 计算属性
// ==============================================
// 当前楼层数据
const currentFloorRooms = computed(() => {
  syncFromLocal()
  return floorDataCache[selectedFloor.value] || []
})

// 床位统计
const statistics = computed(() => {
  let total = 0
  let available = 0
  let occupied = 0
  let outside = 0

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

// ==============================================
// 方法
// ==============================================
// 切换楼层
const loadFloorData = () => {
  syncFromLocal()
  selectedRoom.value = null
}

// 查看房间详情
const viewRoomDetails = (room) => {
  selectedRoom.value = room
}

// 快速办理入住
const handleQuickAssign = (room, bed) => {
  if (bed.status !== 'free') {
    ElMessage.warning('该床位已被占用，无法办理入住')
    return
  }
  assignForm.roomNo = room.number
  assignForm.bedNo = bed.bedNo
  assignDialogVisible.value = true
}

// 表格内办理入住
const handleAssignBed = (room, bed) => {
  handleQuickAssign(room, bed)
}

// 确认办理入住
const confirmAssign = () => {
  assignFormRef.value.validate((valid) => {
    if (!valid) return

    // 校验床位是否空闲
    const room = floorDataCache[selectedFloor.value].find(r => r.number === assignForm.roomNo)
    const bed = room?.beds.find(b => b.bedNo === assignForm.bedNo)
    
    if (!bed || bed.status !== 'free') {
      ElMessage.error('床位状态已变更，请刷新后重试')
      return
    }

    // 生成新记录
    const listStr = localStorage.getItem(STORAGE_KEY_BED_LIST)
    const bedUsageList = listStr ? JSON.parse(listStr) : []
    const newId = bedUsageList.length ? Math.max(...bedUsageList.map(i => i.id)) + 1 : 1

    const newRecord = {
      id: newId,
      customerName: assignForm.customerName,
      buildingNo: assignForm.buildingNo,
      roomNo: assignForm.roomNo,
      bedNo: assignForm.bedNo,
      checkinDate: assignForm.checkinDate,
      checkoutDate: null,
      status: 'active'
    }

    // 保存到本地
    bedUsageList.push(newRecord)
    localStorage.setItem(STORAGE_KEY_BED_LIST, JSON.stringify(bedUsageList))

    // 更新示意图状态
    bed.status = 'occupied'
    bed.patientName = assignForm.customerName
    room.status = 'occupied'
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(floorDataCache))

    // 重置
    ElMessage.success('办理入住成功')
    assignDialogVisible.value = false
    assignForm.customerName = ''
    assignForm.buildingNo = '606'
    selectedRoom.value = null
  })
}

// ==============================================
// 工具函数
// ==============================================
const getBedStatusClass = (s) => `bed-${s}`

const getBedTooltip = (b) => {
  return b.status === 'free' 
    ? '空闲（点击办理入住）' 
    : `${b.patientName}（${getBedStatusText(b.status)}）`
}

const getBedStatusText = (s) => {
  return {
    free: '空闲',
    occupied: '有人',
    outside: '外出'
  }[s] || '未知'
}
</script>

<style scoped>
.bed-map-container {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.left h2 {
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

.statistics-bar {
  margin-bottom: 4px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-card .icon {
  font-size: 28px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.number {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

.label {
  font-size: 13px;
  color: #6b7280;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.map-area {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.room-box {
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafbfc;
  border: 1px solid #e5e7eb;
}

.room-box:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.room-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-title .no {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.bed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bed-box {
  padding: 8px 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.bed-box:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.bed-free {
  border-color: #d1d5db;
}

.bed-occupied {
  border-color: #10b981;
  background: #f0fdf4;
  cursor: not-allowed;
}

.bed-outside {
  border-color: #f59e0b;
  background: #fef3c7;
  cursor: not-allowed;
}

.bed-label {
  color: #374151;
}

.bed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}

.bed-occupied .bed-dot {
  background: #10b981;
}

.bed-outside .bed-dot {
  background: #f59e0b;
}

.detail-panel {
  width: 380px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.panel-header {
  padding: 18px 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.panel-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: #6b7280;
}

.info-item value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.bed-table-box h4 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.empty-tip {
  width: 380px;
  background: #fff;
  border-radius: 12px;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>