<template>
  <div class="bed-map-container">
    <div class="page-header">
      <h2>床位示意图</h2>
      <el-select v-model="selectedFloor" @change="loadFloorData" placeholder="选择楼层" style="width: 160px">
        <el-option 
          v-for="floor in floors" 
          :key="floor.id" 
          :label="floor.name" 
          :value="floor.id"
        />
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
                <span class="bed-label">{{ bed.bedNo }}号床</span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY_BED_LIST = 'bedUsageList'
const selectedFloor = ref('1')
const selectedRoom = ref(null)

const floors = ref([
  { id: '1', name: '1楼' },
  { id: '2', name: '2楼' },
  { id: '3', name: '3楼' }
])

// 核心逻辑：生成房间结构，严格控制单人房只有1个床位
const generateBaseRooms = (floorId) => {
  const rooms = []
  const prefix = floorId + '0'
  for (let i = 1; i <= 10; i++) {
    const roomNo = `${prefix}${i}`
    // 规则：能被3整除的为双人房，其余为单人房
    const isDouble = i % 3 === 0
    const bedCount = isDouble ? 2 : 1

    const beds = []
    for (let j = 1; j <= bedCount; j++) {
      beds.push({
        id: `${roomNo}-${j}`,
        bedNo: String(j),
        patientName: '',
        status: 'free' // 初始状态均为空闲
      })
    }

    rooms.push({
      number: roomNo,
      type: isDouble ? '双人房' : '单人房',
      status: 'free',
      beds: beds
    })
  }
  return rooms
}

const floorDataCache = {
  '1': generateBaseRooms('1'),
  '2': generateBaseRooms('2'),
  '3': generateBaseRooms('3')
}

// 页面加载时同步管理页面的真实数据
onMounted(() => {
  const listStr = localStorage.getItem(STORAGE_KEY_BED_LIST)
  if (listStr) {
    const activeRecords = JSON.parse(listStr).filter(r => r.status === 'active')
    
    Object.keys(floorDataCache).forEach(fid => {
      floorDataCache[fid].forEach(room => {
        let hasOccupied = false
        room.beds.forEach(bed => {
          const record = activeRecords.find(r => r.roomNo === room.number && r.bedNo === bed.bedNo)
          if (record) {
            bed.status = 'occupied'
            bed.patientName = record.customerName
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
})

const currentFloorRooms = computed(() => {
  return floorDataCache[selectedFloor.value] || []
})

const statistics = computed(() => {
  const rooms = currentFloorRooms.value
  let total = 0, available = 0, occupied = 0, outside = 0
  rooms.forEach(room => {
    room.beds.forEach(bed => {
      total++
      if (bed.status === 'free') available++
      else if (bed.status === 'occupied') occupied++
      else if (bed.status === 'outside') outside++
    })
  })
  return { total, available, occupied, outside }
})

const loadFloorData = () => { selectedRoom.value = null }
const viewRoomDetails = (room) => { selectedRoom.value = room }

const getBedStatusClass = (status) => `bed-${status}`
const getBedIcon = (status) => status === 'occupied' ? '●' : (status === 'outside' ? '○' : '')
const getBedTooltip = (bed) => bed.status === 'free' ? '空闲' : `${bed.patientName} (${getBedStatusText(bed.status)})`
const getBedStatusText = (status) => ({ free: '空闲', occupied: '有人', outside: '外出' }[status] || '未知')

const handleAssignBed = () => { ElMessage.info('请前往“床位管理”页面办理入住') }
</script>

<style scoped>
/* 保持原有的简洁样式 */
.bed-map-container { padding: 20px; height: calc(100vh - 60px); display: flex; flex-direction: column; background-color: #f5f7fa; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background-color: #fff; padding: 16px 20px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }
.page-header h2 { margin: 0; font-size: 18px; font-weight: 500; color: #303133; }
.statistics-bar { margin-bottom: 20px; }
.stat-item { background-color: #fff; padding: 16px; border-radius: 4px; text-align: center; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }
.stat-number { font-size: 24px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.stat-text { font-size: 13px; color: #909399; }
.content-wrapper { display: flex; flex: 1; gap: 16px; overflow: hidden; }
.map-area { flex: 1; background-color: #fff; border-radius: 4px; padding: 20px; overflow-y: auto; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }
.room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.room-box { border: 1px solid #dcdfe6; border-radius: 4px; padding: 12px; cursor: pointer; transition: all 0.2s; background-color: #fff; }
.room-box:hover { border-color: #409eff; box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15); }
.room-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ebeef5; }
.room-title span:first-child { font-weight: 500; font-size: 14px; color: #303133; }
.room-type-tag { font-size: 11px; color: #909399; background-color: #f4f4f5; padding: 2px 6px; border-radius: 2px; }
.bed-list { display: flex; flex-direction: column; gap: 6px; }
.bed-box { padding: 6px 10px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; border: 1px solid #e4e7ed; background-color: #fafafa; }
.bed-box.bed-occupied { border-color: #67c23a; background-color: #f0f9eb; }
.bed-box.bed-outside { border-color: #e6a23c; background-color: #fdf6ec; }
.bed-label { color: #606266; }
.bed-status-icon { font-size: 10px; }
.bed-occupied .bed-status-icon { color: #67c23a; }
.bed-outside .bed-status-icon { color: #e6a23c; }
.detail-panel { width: 360px; background-color: #fff; border-radius: 4px; display: flex; flex-direction: column; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }
.panel-title-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #ebeef5; }
.panel-title-bar h3 { margin: 0; font-size: 15px; font-weight: 500; color: #303133; }
.panel-body { flex: 1; padding: 16px; overflow-y: auto; }
.info-list { margin-bottom: 16px; }
.info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f2f5; }
.info-label { width: 80px; color: #909399; font-size: 13px; }
.info-value { flex: 1; color: #303133; font-size: 13px; }
.bed-table-section h4 { margin: 16px 0 10px 0; font-size: 14px; font-weight: 500; color: #303133; }
.panel-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f2f5; text-align: right; }
.empty-panel { width: 360px; display: flex; align-items: center; justify-content: center; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }
:deep(.el-table) { font-size: 13px; }
:deep(.el-table th) { background-color: #f5f7fa; color: #606266; font-weight: 500; }
</style>