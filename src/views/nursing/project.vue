<template>
  <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
    <h2 style="margin-bottom: 20px;">护理项目管理</h2>

    <!-- 查询区域 -->
    <el-card style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <el-select
          v-model="queryStatus"
          placeholder="护理项目状态"
          style="width: 150px;"
          clearable
        >
          <el-option label="全部" value="" />
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>

        <el-input
          v-model="queryName"
          placeholder="护理项目名称（模糊查询）"
          style="width: 260px;"
          clearable
        />

        <el-button type="primary" @click="refreshList">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="success" @click="openAddDialog">新增护理项目</el-button>
      </div>
    </el-card>

    <!-- 护理项目列表 -->
    <el-card>
      <el-table
        :data="pagedList"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background:'#409EFF', color:'#fff' }"
        v-loading="loading"
      >
        <el-table-column label="序号" type="index" align="center" width="80" />
        <el-table-column label="客户" prop="customerName" align="center" min-width="120" />
        <el-table-column label="项目编号" prop="code" align="center" width="120" />
        <el-table-column label="项目名称" prop="name" align="center" min-width="150" />
        <el-table-column label="价格" prop="price" align="center" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="余量" prop="remain" align="center" width="100" />
        <el-table-column label="总次数" prop="times" align="center" width="100" />
        <el-table-column label="执行周期" prop="cycle" align="center" width="120" />
        <el-table-column label="服务到期日期" prop="expireDate" align="center" width="140" />
        
        <el-table-column label="状态" align="center" width="120">
          <template #default="{ row }">
            <div style="display: flex; justify-content: center;">
              <span :style="getStatusStyle(row)">{{ getStatusText(row) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="handleNursing(row)"
            >
              护理
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="openEditDialog(row)"
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px;">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[5, 10, 20, 50]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增护理项目弹窗 -->
    <el-dialog
      v-model="addDialog"
      title="新增护理项目"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="护理人（客户）" prop="customerName">
          <el-input
            v-model="addForm.customerName"
            placeholder="请输入护理人姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="项目编号" prop="code">
          <el-input
            v-model="addForm.code"
            placeholder="请输入项目编号"
            clearable
          />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="addForm.name"
            placeholder="请输入项目名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="价格（元）" prop="price">
          <el-input
            v-model.number="addForm.price"
            placeholder="请输入价格"
            type="number"
            min="0"
            step="0.01"
          >
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="执行周期" prop="cycle">
          <el-select
            v-model="addForm.cycle"
            placeholder="请选择执行周期"
            style="width: 100%;"
            clearable
          >
            <el-option label="每日" value="每日" />
            <el-option label="每周" value="每周" />
            <el-option label="每两周" value="每两周" />
            <el-option label="每月" value="每月" />
            <el-option label="每季度" value="每季度" />
            <el-option label="每年" value="每年" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行次数" prop="times">
          <el-input
            v-model.number="addForm.times"
            placeholder="请输入执行次数"
            type="number"
            min="1"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio label="启用" />
            <el-radio label="停用" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="addForm.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改护理项目弹窗 -->
    <el-dialog
      v-model="editDialog"
      title="修改护理项目"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="护理人（客户）">
          <el-input
            v-model="editForm.customerName"
            disabled
          />
        </el-form-item>
        <el-form-item label="项目编号">
          <el-input
            v-model="editForm.code"
            disabled
          />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入项目名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="价格（元）" prop="price">
          <el-input
            v-model.number="editForm.price"
            placeholder="请输入价格"
            type="number"
            min="0"
            step="0.01"
          >
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="执行周期" prop="cycle">
          <el-select
            v-model="editForm.cycle"
            placeholder="请选择执行周期"
            style="width: 100%;"
            clearable
          >
            <el-option label="每日" value="每日" />
            <el-option label="每周" value="每周" />
            <el-option label="每两周" value="每两周" />
            <el-option label="每月" value="每月" />
            <el-option label="每季度" value="每季度" />
            <el-option label="每年" value="每年" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行次数" prop="times">
          <el-input
            v-model.number="editForm.times"
            placeholder="请输入执行次数"
            type="number"
            min="1"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio label="启用" />
            <el-radio label="停用" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="editForm.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialog = false">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 工具函数：计算3个月后日期
const get3MonthsLater = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

// 工具函数：获取今天日期
const getToday = () => new Date().toISOString().split('T')[0]

// 模拟数据
const mockData = () => {
  const today = getToday()
  const threeMonthsLater = get3MonthsLater()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const expiredDate = oneMonthAgo.toISOString().split('T')[0]
  
  return [
    {
      id: 1,
      customerName: '孙瑞英',
      code: 'PROJ001',
      name: '基础护理',
      price: 50.00,
      cycle: '每日',
      times: 30,
      remain: 25,
      status: '启用',
      expireDate: threeMonthsLater,
      desc: '日常基础护理服务',
      createTime: '2026-01-15',
      updateTime: '2026-01-15'
    },
    {
      id: 2,
      customerName: '孙瑞英',
      code: 'PROJ002',
      name: '康复训练',
      price: 80.00,
      cycle: '每周',
      times: 12,
      remain: 2,
      status: '启用',
      expireDate: threeMonthsLater,
      desc: '术后康复训练',
      createTime: '2026-02-20',
      updateTime: '2026-02-20'
    },
    {
      id: 3,
      customerName: '李明',
      code: 'PROJ003',
      name: '老年护理',
      price: 120.00,
      cycle: '每月',
      times: 6,
      remain: 0,
      status: '启用',
      expireDate: expiredDate,
      desc: '老年人日常护理服务',
      createTime: '2025-12-10',
      updateTime: '2026-03-01'
    },
    {
      id: 4,
      customerName: '王芳',
      code: 'PROJ004',
      name: '特殊护理',
      price: 200.00,
      cycle: '每两周',
      times: 8,
      remain: 1,
      status: '停用',
      expireDate: '2026-05-20',
      desc: '特殊病人护理服务',
      createTime: '2026-01-25',
      updateTime: '2026-02-28'
    },
    {
      id: 5,
      customerName: '张伟',
      code: 'PROJ005',
      name: '常规检查',
      price: 60.00,
      cycle: '每季度',
      times: 4,
      remain: 3,
      status: '启用',
      expireDate: '2026-06-30',
      desc: '常规健康检查服务',
      createTime: '2026-02-15',
      updateTime: '2026-02-15'
    }
  ]
}

// 数据
const projectList = ref([])
const queryName = ref('')
const queryStatus = ref('')
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const addDialog = ref(false)
const editDialog = ref(false)

// 表单引用
const addFormRef = ref()
const editFormRef = ref()

// 新增表单
const addForm = ref({
  customerName: '',
  code: '',
  name: '',
  price: '',
  cycle: '每月',
  times: 1,
  status: '启用',
  desc: ''
})

// 修改表单
const editForm = ref({})

// 表单验证规则
const rules = {
  customerName: [
    { required: true, message: '请输入护理人姓名', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入项目编号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', message: '价格必须是数字', trigger: 'blur' },
    { validator: (rule, value) => value >= 0, message: '价格不能为负数', trigger: 'blur' }
  ],
  times: [
    { required: true, message: '请输入执行次数', trigger: 'blur' },
    { type: 'number', message: '执行次数必须是数字', trigger: 'blur' },
    { validator: (rule, value) => value > 0, message: '执行次数必须大于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const filteredList = computed(() => {
  return projectList.value.filter(item => {
    const matchStatus = !queryStatus.value || item.status === queryStatus.value
    const matchName = !queryName.value || item.name.includes(queryName.value) || item.code.includes(queryName.value)
    return matchStatus && matchName
  })
})

const pagedList = computed(() => {
  const start = (page.value - 1) * size.value
  return filteredList.value.slice(start, start + size.value)
})

// 状态样式
const getStatusStyle = (row) => {
  const today = getToday()
  const isExpired = row.expireDate < today
  const isOutOfRemain = row.remain <= 0
  
  if (row.status === '停用') {
    return {
      color: '#999',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px'
    }
  } else if (isExpired) {
    return {
      color: '#f56c6c',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  } else if (isOutOfRemain) {
    return {
      color: '#f56c6c',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  } else if (row.remain <= 2) {
    return {
      color: '#e6a23c',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  } else {
    return {
      color: '#67c23a',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  }
}

// 状态文本
const getStatusText = (row) => {
  const today = getToday()
  if (row.status === '停用') return '停用'
  if (row.expireDate < today) return '已到期'
  if (row.remain <= 0) return '已用完'
  if (row.remain <= 2) return '即将用完'
  return '正常'
}

// 方法
const refreshList = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    loading.value = false
    page.value = 1
  }, 300)
}

const resetQuery = () => {
  queryName.value = ''
  queryStatus.value = ''
  refreshList()
}

const openAddDialog = () => {
  addForm.value = {
    customerName: '',
    code: '',
    name: '',
    price: '',
    cycle: '每月',
    times: 1,
    status: '启用',
    desc: ''
  }
  addDialog.value = true
  // 清空表单验证
  nextTick(() => {
    if (addFormRef.value) {
      addFormRef.value.clearValidate()
    }
  })
}

const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    
    // 检查项目编号是否重复
    const isCodeExist = projectList.value.some(item => item.code === addForm.value.code)
    if (isCodeExist) {
      ElMessage.error('项目编号已存在，请使用其他编号')
      return
    }
    
    // 生成新ID
    const newId = projectList.value.length > 0 
      ? Math.max(...projectList.value.map(p => p.id)) + 1
      : 1
    
    const today = getToday()
    const newProject = {
      id: newId,
      ...addForm.value,
      remain: addForm.value.times,
      expireDate: get3MonthsLater(),
      createTime: today,
      updateTime: today
    }
    
    projectList.value.unshift(newProject)
    ElMessage.success('新增护理项目成功！')
    addDialog.value = false
    refreshList()
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const openEditDialog = (row) => {
  editForm.value = { ...row }
  editDialog.value = true
  // 清空表单验证
  nextTick(() => {
    if (editFormRef.value) {
      editFormRef.value.clearValidate()
    }
  })
}

const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    const index = projectList.value.findIndex(p => p.id === editForm.value.id)
    if (index !== -1) {
      const oldRemain = projectList.value[index].remain
      const newRemain = editForm.value.status === '启用' && editForm.value.times >= oldRemain 
        ? editForm.value.times 
        : oldRemain
      
      projectList.value[index] = {
        ...projectList.value[index],
        ...editForm.value,
        remain: newRemain,
        updateTime: getToday()
      }
      
      ElMessage.success('修改护理项目成功！')
      editDialog.value = false
      refreshList()
    }
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const handleNursing = (row) => {
  if (row.remain <= 0) {
    ElMessage.warning('该护理项目次数已用完，无法执行护理！')
    return
  }
  
  if (row.expireDate < getToday()) {
    ElMessage.warning('该护理项目已过期，无法执行护理！')
    return
  }
  
  if (row.status === '停用') {
    ElMessage.warning('该护理项目已停用，无法执行护理！')
    return
  }
  
  ElMessageBox.confirm(
    `确定执行护理项目：${row.name}？执行后余量将减少1次。`,
    '确认执行护理',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = projectList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      projectList.value[index].remain = Math.max(0, projectList.value[index].remain - 1)
      projectList.value[index].updateTime = getToday()
      ElMessage.success(`护理执行成功！项目余量：${projectList.value[index].remain}次`)
      refreshList()
    }
  }).catch(() => {
    // 用户取消
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定删除护理项目：${row.name}？删除后不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = projectList.value.findIndex(p => p.id === row.id)
    if (index !== -1) {
      projectList.value.splice(index, 1)
      ElMessage.success('删除护理项目成功！')
      refreshList()
    }
  }).catch(() => {
    // 用户取消
  })
}

const handleSizeChange = (val) => {
  size.value = val
  refreshList()
}

const handleCurrentChange = (val) => {
  page.value = val
  refreshList()
}

// 生命周期
onMounted(() => {
  // 模拟异步加载数据
  loading.value = true
  setTimeout(() => {
    projectList.value = mockData()
    loading.value = false
  }, 500)
})

// 引入 nextTick
import { nextTick } from 'vue'
</script>

<style scoped>
.el-table th {
  background-color: #409EFF !important;
  color: #fff !important;
}
.el-table {
  border-radius: 6px;
  overflow: hidden;
}
.el-button + .el-button {
  margin-left: 8px;
}
</style>