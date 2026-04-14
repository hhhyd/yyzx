<template>
    <div class="customer-management">
    <div class="query-bar">
      <el-input
        v-model="queryParams.customerName"
        placeholder="客户姓名"
        clearable
        style="width: 200px; margin-right: 10px"
        @keyup.enter="handleQuery"
      />
      <el-button type="primary" @click="handleQuery">查询</el-button>
      <el-button type="success" @click="handleRegister">登记</el-button>
    </div>

    <div class="type-tabs">
      <el-button
        :type="customerType === 'self' ? 'primary' : 'default'"
        @click="customerType = 'self'; handleQuery"
      >
        自理老人
      </el-button>
      <el-button
        :type="customerType === 'nursing' ? 'primary' : 'default'"
        @click="customerType = 'nursing'; handleQuery"
      >
        护理老人
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="customerName" label="客户姓名" min-width="100" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="bloodType" label="血型" width="80" />
      <el-table-column prop="phone" label="联系电话" min-width="120" />
      <el-table-column prop="familyMember" label="家属" min-width="100" />
      <el-table-column prop="idCard" label="身份证" min-width="180" show-overflow-tooltip />
      <el-table-column prop="buildingNo" label="楼号" width="80" />
      <el-table-column prop="roomNo" label="房间号" width="90" />
      <el-table-column prop="bedNo" label="床号" width="80" />
      <el-table-column prop="birthDate" label="出生日期" min-width="120" />
      <el-table-column prop="checkInTime" label="入住时间" min-width="120" />
      <el-table-column prop="careLevel" label="护理级别" width="100" />
      <el-table-column prop="nurse" label="护工" min-width="100" />
      <el-table-column prop="healthStatus" label="身心状况" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">修改</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 登记/修改弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="formData.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="血型" prop="bloodType">
              <el-select v-model="formData.bloodType" placeholder="请选择血型" style="width: 100%">
                <el-option label="A型" value="A型" />
                <el-option label="B型" value="B型" />
                <el-option label="AB型" value="AB型" />
                <el-option label="O型" value="O型" />
                <el-option label="未知" value="未知" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="家属" prop="familyMember">
          <el-input v-model="formData.familyMember" placeholder="请输入家属姓名及关系" />
        </el-form-item>
        <el-form-item label="身份证" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号码" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="楼号" prop="buildingNo">
              <el-input v-model="formData.buildingNo" placeholder="楼号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="房间号" prop="roomNo">
              <el-input v-model="formData.roomNo" placeholder="房间号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="床号" prop="bedNo">
              <el-input v-model="formData.bedNo" placeholder="床号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="formData.birthDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入住时间" prop="checkInTime">
              <el-date-picker
                v-model="formData.checkInTime"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="护理级别" prop="careLevel">
              <el-select v-model="formData.careLevel" placeholder="请选择护理级别" style="width: 100%">
                <el-option label="一级护理" value="一级护理" />
                <el-option label="二级护理" value="二级护理" />
                <el-option label="三级护理" value="三级护理" />
                <el-option label="特级护理" value="特级护理" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="护工" prop="nurse">
              <el-input v-model="formData.nurse" placeholder="请输入护工姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身心状况" prop="healthStatus">
          <el-input
            v-model="formData.healthStatus"
            type="textarea"
            :rows="3"
            placeholder="请输入身心状况描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  customerName: ''
})

// 老人类型：self-自理老人，nursing-护理老人
const customerType = ref('self')

// 表格数据
const tableData = ref([])

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('登记')
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

// 表单数据
const formData = reactive({
  customerName: '',
  gender: '',
  bloodType: '',
  phone: '',
  familyMember: '',
  idCard: '',
  buildingNo: '',
  roomNo: '',
  bedNo: '',
  birthDate: '',
  checkInTime: '',
  careLevel: '',
  nurse: '',
  healthStatus: ''
})

// 表单验证规则
const formRules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号码', trigger: 'blur' }],
  checkInTime: [{ required: true, message: '请选择入住时间', trigger: 'change' }]
}

// 获取列表数据
const fetchData = async () => {
  const mockData = [
    {
      id: 1,
      customerName: '张建国',
      gender: '男',
      bloodType: 'A型',
      phone: '13800138001',
      familyMember: '张伟（儿子）',
      idCard: '11010119900307663X',
      buildingNo: '1',
      roomNo: '101',
      bedNo: '01',
      birthDate: '1945-03-15',
      checkInTime: '2023-01-10',
      careLevel: '二级护理',
      nurse: '王芳',
      healthStatus: '高血压，生活基本自理'
    },
    {
      id: 2,
      customerName: '李淑芬',
      gender: '女',
      bloodType: 'B型',
      phone: '13800138002',
      familyMember: '李强（女儿）',
      idCard: '110101194812123344',
      buildingNo: '1',
      roomNo: '102',
      bedNo: '02',
      birthDate: '1948-12-12',
      checkInTime: '2023-02-15',
      careLevel: '一级护理',
      nurse: '王芳',
      healthStatus: '糖尿病，需定期监测血糖'
    }
  ]
  tableData.value = mockData
  pagination.total = mockData.length
}

// 查询
const handleQuery = () => {
  pagination.currentPage = 1
  fetchData()
}

// 登记
const handleRegister = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '登记'
  resetForm()
  dialogVisible.value = true
}

// 修改
const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '修改'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除客户“${row.customerName}”的信息吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '修改成功' : '登记成功')
      dialogVisible.value = false
      fetchData()
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  formRef.value?.clearValidate()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.customer-management {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.query-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.type-tabs {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
