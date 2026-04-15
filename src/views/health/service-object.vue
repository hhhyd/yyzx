<template>
  <div class="service-object">
    <h2>健康管家管理</h2>

    <!-- 管家查询 -->
    <div class="section">
      <h3>查询健康管家</h3>
      <el-input v-model="stewardSearch" placeholder="输入管家名字进行模糊查询" style="width: 300px; margin-bottom: 10px;"></el-input>
      <el-table :data="filteredStewards" style="width: 100%;" @row-click="selectSteward">
        <el-table-column prop="name" label="管家姓名" width="150"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="experience" label="工作经验(年)" width="120"></el-table-column>
        <el-table-column label="服务客户数" width="120">
          <template #default="scope">
            {{ getStewardCustomers(scope.row.id).length }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 设置服务对象 -->
    <div v-if="selectedSteward" class="section">
      <h3>设置服务对象 - {{ selectedSteward.name }}</h3>
      <el-row :gutter="20">
        <!-- 当前管家的服务客户 -->
        <el-col :span="12">
          <h4>当前服务客户</h4>
          <el-input v-model="customerSearch" placeholder="输入客户名称查询" style="width: 100%; margin-bottom: 10px;"></el-input>
          <el-table :data="filteredCurrentCustomers" style="width: 100%;" height="300">
            <el-table-column prop="name" label="客户姓名" width="120"></el-table-column>
            <el-table-column prop="age" label="年龄" width="80"></el-table-column>
            <el-table-column prop="room" label="房间号" width="100"></el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="mini" type="danger" @click="removeCustomer(scope.row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <!-- 无管家客户 -->
        <el-col :span="12">
          <h4>无管家客户</h4>
          <el-input v-model="unassignedSearch" placeholder="输入客户名称查询" style="width: 100%; margin-bottom: 10px;"></el-input>
          <el-table :data="filteredUnassignedCustomers" style="width: 100%;" height="300">
            <el-table-column prop="name" label="客户姓名" width="120"></el-table-column>
            <el-table-column prop="age" label="年龄" width="80"></el-table-column>
            <el-table-column prop="room" label="房间号" width="100"></el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="mini" type="primary" @click="addCustomer(scope.row)">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ServiceObject',
  setup() {
    // 管家数据
    const stewards = ref([
      { id: 1, name: '王管家', phone: '13800138001', experience: 5 },
      { id: 2, name: '李管家', phone: '13800138002', experience: 3 },
      { id: 3, name: '张管家', phone: '13800138003', experience: 7 }
    ])

    // 客户数据，每个客户有stewardId表示所属管家
    const customers = ref([
      { id: 1, name: '张三', age: 75, room: '101', stewardId: 1 },
      { id: 2, name: '李四', age: 68, room: '102', stewardId: null },
      { id: 3, name: '王五', age: 72, room: '103', stewardId: 2 },
      { id: 4, name: '赵六', age: 70, room: '104', stewardId: null },
      { id: 5, name: '孙七', age: 69, room: '105', stewardId: 1 }
    ])

    const selectedSteward = ref(null)
    const stewardSearch = ref('')
    const customerSearch = ref('')
    const unassignedSearch = ref('')

    // 过滤管家
    const filteredStewards = computed(() => {
      return stewards.value.filter(steward =>
        steward.name.includes(stewardSearch.value)
      )
    })

    // 获取管家的客户
    const getStewardCustomers = (stewardId) => {
      return customers.value.filter(customer => customer.stewardId === stewardId)
    }

    // 当前管家的客户
    const currentCustomers = computed(() => {
      if (!selectedSteward.value) return []
      return getStewardCustomers(selectedSteward.value.id)
    })

    // 过滤当前管家的客户
    const filteredCurrentCustomers = computed(() => {
      return currentCustomers.value.filter(customer =>
        customer.name.includes(customerSearch.value)
      )
    })

    // 无管家客户
    const unassignedCustomers = computed(() => {
      return customers.value.filter(customer => !customer.stewardId)
    })

    // 过滤无管家客户
    const filteredUnassignedCustomers = computed(() => {
      return unassignedCustomers.value.filter(customer =>
        customer.name.includes(unassignedSearch.value)
      )
    })

    // 选择管家
    const selectSteward = (row) => {
      selectedSteward.value = row
      customerSearch.value = ''
      unassignedSearch.value = ''
    }

    // 添加客户到管家
    const addCustomer = (customer) => {
      if (customer.stewardId) {
        ElMessage.warning('该客户已有管家')
        return
      }
      customer.stewardId = selectedSteward.value.id
      ElMessage.success('添加成功')
    }

    // 从管家移除客户
    const removeCustomer = (customer) => {
      ElMessageBox.confirm('确定将此客户从当前管家移除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        customer.stewardId = null
        ElMessage.success('移除成功')
      })
    }

    return {
      stewards,
      customers,
      selectedSteward,
      stewardSearch,
      customerSearch,
      unassignedSearch,
      filteredStewards,
      currentCustomers,
      filteredCurrentCustomers,
      unassignedCustomers,
      filteredUnassignedCustomers,
      selectSteward,
      addCustomer,
      removeCustomer,
      getStewardCustomers
    }
  }
}
</script>

<style scoped>
.service-object {
  padding: 20px;
}
.section {
  margin-bottom: 30px;
}
.section h3 {
  margin-bottom: 15px;
}
.section h4 {
  margin-bottom: 10px;
}
</style>