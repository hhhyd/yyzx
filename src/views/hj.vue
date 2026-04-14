<template>
  <div class="customer-container">
    <div class="search-wrapper">
      <input
        v-model="searchName"
        type="text"
        placeholder="客户姓名"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">查询</button>
    </div>
    <hr class="divider" />
    <table class="customer-table">
      <thead>
        <tr>
          <th>序号</th>
          <th>客户姓名</th>
          <th>年龄</th>
          <th>性别</th>
          <th>房间号</th>
          <th>床号</th>
          <th>所属楼房</th>
          <th>联系电话</th>
          <th>护理级别</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredTableData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
          <td>{{ item.gender }}</td>
          <td>{{ item.roomNo }}</td>
          <td>{{ item.bedNo }}</td>
          <td>{{ item.building }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.level }}</td>
          <td>
            <button class="nursing-btn" @click="handleNursing(item)">
              日常护理
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tableData = ref([
  {
    id: 1,
    name: '孙瑞英',
    age: 68,
    gender: '女',
    roomNo: '2012',
    bedNo: '2012-1',
    building: '606',
    phone: '18167564213',
    level: '二级'
  },
  {
    id: 2,
    name: '张帆',
    age: 77,
    gender: '女',
    roomNo: '1014',
    bedNo: '1014-1',
    building: '606',
    phone: '17745189064',
    level: ''
  }
])

const searchName = ref('')

const filteredTableData = computed(() => {
  if (!searchName.value) return tableData.value
  return tableData.value.filter(item => 
    item.name.includes(searchName.value)
  )
})


const handleSearch = () => {
  console.log('查询客户：', searchName.value)
}


const handleNursing = (row) => {
  console.log('日常护理操作，客户：', row)
  alert(`已为【${row.name}】打开日常护理页面`)
}
</script>

<style scoped>
.customer-container {
  padding: 20px;
  font-family: "Microsoft Yahei", sans-serif;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 400px;
  height: 80px;
  padding: 0 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 24px;
}

.search-btn {
  height: 80px;
  padding: 0 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font-size: 24px;
  cursor: pointer;
}

.search-btn:hover {
  background: #f5f5f5;
}


.divider {
  border: none;
  border-top: 2px solid #ccc;
  margin: 20px 0;
}


.customer-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  text-align: center;
}

.customer-table th,
.customer-table td {
  border: 1px solid #ccc;
  padding: 15px;
  font-size: 20px;
}

.customer-table th {
  background: #f5f5f5;
  font-weight: bold;
}


.nursing-btn {
  padding: 8px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  color: #409eff;
  font-size: 18px;
  cursor: pointer;
}

.nursing-btn:hover {
  background: #ecf5ff;
}
</style>