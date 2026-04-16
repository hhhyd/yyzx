<template>
  <div style="background: white; padding: 20px; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">入住登记</h2>
    </div>

    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <el-input v-model="searchName" placeholder="客户姓名" style="width: 200px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openModal('add')">登记</el-button>
      <el-button type="warning" @click="handleReset">重置</el-button>
    </div>

    <div style="margin-bottom: 20px;">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="自理老人" name="self-care"></el-tab-pane>
        <el-tab-pane label="护理老人" name="nursing"></el-tab-pane>
      </el-tabs>
    </div>

    <el-table :data="displayData" style="width: 100%">
      <el-table-column prop="id" label="序号" width="60" />
      <el-table-column prop="name" label="客户姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="bloodType" label="血型" width="80" />
      <el-table-column prop="phone" label="联系电话" width="120" />
      <el-table-column prop="family" label="家属" width="100" />
      <el-table-column prop="idCard" label="身份证" width="120" />
      <el-table-column prop="building" label="楼号" width="80" />
      <el-table-column prop="room" label="房间号" width="100" />
      <el-table-column prop="bed" label="床号" width="80" />
      <el-table-column prop="birthDate" label="出生日期" width="120" />
      <el-table-column prop="checkInTime" label="入住时间" width="120" />
      <el-table-column prop="nursingLevel" label="护理级别" width="100" />
      <el-table-column prop="nurse" label="护工" width="100" />
      <el-table-column prop="status" label="身心状况" width="100" />
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="deleteRow(row.id)">删除</el-button>
          <el-button size="small" type="primary" @click="openModal('edit', row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"  :total="filteredTotal"
      layout="total, prev, pager, next, jumper" style="margin-top: 20px;" @current-change="handlePageChange"/>

   
    <el-dialog :title="modalTitle" v-model="dialogVisible" width="600px" @close="resetForm">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="客户姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="form.age" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker v-model="form.birthDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="血型" prop="bloodType">
          <el-input v-model="form.bloodType" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="家属" prop="family">
          <el-input v-model="form.family" />
        </el-form-item>
        <el-form-item label="楼栋" prop="building">
          <el-input v-model="form.building" />
        </el-form-item>
        <el-form-item label="房间号" prop="room">
          <el-select v-model="form.room">
            <el-option label="1楼101" value="1楼101" />
            <el-option label="1楼102" value="1楼102" />
            <el-option label="1楼103" value="1楼103" />
            <el-option label="1楼104" value="1楼104" />
            <el-option label="2楼201" value="2楼201" />
            <el-option label="2楼202" value="2楼202" />
            <el-option label="2楼203" value="2楼203" />
            <el-option label="3楼301" value="3楼301" />
            <el-option label="3楼302" value="3楼302" />
            <el-option label="3楼303" value="3楼303" />
            <el-option label="3楼304" value="3楼304" />
            <el-option label="3楼305" value="3楼305" />
            <el-option label="3楼306" value="3楼306" />
          </el-select>
        </el-form-item>
        <el-form-item label="床位号" prop="bed">
          <el-select v-model="form.bed">
            <el-option label="1床" value="1床" />
            <el-option label="2床" value="2床" />
          </el-select>
        </el-form-item>
        <el-form-item label="入住时间" prop="checkInTime">
          <el-date-picker v-model="form.checkInTime" type="datetime" placeholder="选择时间"
            value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="合同到期时间" prop="contractEndTime">
          <el-date-picker v-model="form.contractEndTime" type="datetime" placeholder="选择时间"
            value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="护理级别" prop="nursingLevel">
          <el-input v-model="form.nursingLevel" />
        </el-form-item>
        <el-form-item label="护工" prop="nurse">
          <el-input v-model="form.nurse" />
        </el-form-item>
        <el-form-item label="身心状况" prop="status">
          <el-input v-model="form.status" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'

export default {
  name: 'Checkin',
  components: {
    UserFilled
  },
  data() {
    return {
      searchName: '',
      activeTab: 'self-care',
      currentPage: 1,
      pageSize: 10,
      originalSearchName: '',
      selfCareData: [

        { id: 1, name: '陈国栋', gender: '男', bloodType: 'A', phone: '13912340001', family: '陈小明', idCard: '110101195001011234', building: '606', room: '1楼101', bed: '1床', birthDate: '1950-01-01', checkInTime: '2024-01-01 09:00:00', nursingLevel: '一级', nurse: '李护士', status: '良好' },
        { id: 2, name: '王淑芬', gender: '女', bloodType: 'B', phone: '13912340002', family: '王大力', idCard: '110101195102022345', building: '606', room: '1楼102', bed: '2床', birthDate: '1951-02-02', checkInTime: '2024-01-05 10:30:00', nursingLevel: '一级', nurse: '张护士', status: '良好' },
        { id: 3, name: '刘志远', gender: '男', bloodType: 'O', phone: '13912340003', family: '刘小军', idCard: '110101195203033456', building: '606', room: '1楼101', bed: '2床', birthDate: '1952-03-03', checkInTime: '2024-01-10 14:00:00', nursingLevel: '一级', nurse: '王护士', status: '良好' },
        { id: 4, name: '赵玉兰', gender: '女', bloodType: 'AB', phone: '13912340004', family: '赵国强', idCard: '110101195304044567', building: '606', room: '1楼102', bed: '1床', birthDate: '1953-04-04', checkInTime: '2024-01-15 11:15:00', nursingLevel: '一级', nurse: '李护士', status: '良好' },
        { id: 5, name: '周德明', gender: '男', bloodType: 'A', phone: '13912340005', family: '周建华', idCard: '110101195405055678', building: '606', room: '1楼103', bed: '1床', birthDate: '1954-05-05', checkInTime: '2024-01-20 09:45:00', nursingLevel: '一级', nurse: '张护士', status: '良好' },
        { id: 6, name: '吴桂英', gender: '女', bloodType: 'B', phone: '13912340006', family: '吴志强', idCard: '110101195506066789', building: '606', room: '2楼201', bed: '2床', birthDate: '1955-06-06', checkInTime: '2024-01-25 13:20:00', nursingLevel: '一级', nurse: '王护士', status: '良好' },
        { id: 7, name: '郑文博', gender: '男', bloodType: 'O', phone: '13912340007', family: '郑晓东', idCard: '110101195607077890', building: '606', room: '2楼201', bed: '1床', birthDate: '1956-07-07', checkInTime: '2024-02-01 10:00:00', nursingLevel: '一级', nurse: '李护士', status: '良好' },
        { id: 8, name: '孙丽华', gender: '女', bloodType: 'AB', phone: '13912340008', family: '孙建国', idCard: '110101195708088901', building: '606', room: '2楼202', bed: '2床', birthDate: '1957-08-08', checkInTime: '2024-02-05 14:30:00', nursingLevel: '一级', nurse: '张护士', status: '良好' },
        { id: 9, name: '钱学森', gender: '男', bloodType: 'A', phone: '13912340009', family: '钱小兵', idCard: '110101195809099012', building: '606', room: '2楼203', bed: '1床', birthDate: '1958-09-09', checkInTime: '2024-02-10 09:15:00', nursingLevel: '一级', nurse: '王护士', status: '良好' },
        { id: 10, name: '宋美云', gender: '女', bloodType: 'B', phone: '13912340010', family: '宋大伟', idCard: '110101195910101123', building: '606', room: '3楼301', bed: '2床', birthDate: '1959-10-10', checkInTime: '2024-02-15 11:00:00', nursingLevel: '一级', nurse: '李护士', status: '良好' },
        { id: 11, name: '林凤英', gender: '女', bloodType: 'O', phone: '13912340011', family: '林志远', idCard: '110101196011112234', building: '606', room: '3楼301', bed: '1床', birthDate: '1960-11-11', checkInTime: '2024-02-20 13:45:00', nursingLevel: '一级', nurse: '张护士', status: '良好' },
        { id: 12, name: '郭建华', gender: '男', bloodType: 'AB', phone: '13912340012', family: '郭小明', idCard: '110101196112123345', building: '606', room: '3楼302', bed: '2床', birthDate: '1961-12-12', checkInTime: '2024-02-25 10:30:00', nursingLevel: '一级', nurse: '王护士', status: '良好' },
        { id: 13, name: '唐秀珍', gender: '女', bloodType: 'A', phone: '13912340013', family: '唐国强', idCard: '110101196301013456', building: '606', room: '3楼303', bed: '1床', birthDate: '1963-01-01', checkInTime: '2024-03-01 09:00:00', nursingLevel: '一级', nurse: '李护士', status: '良好' }
      ],
      nursingData: [
       { id: 1, name: '张三', gender: '男', bloodType: 'A', phone: '13800138000', family: '张一', idCard: '1234567890', building: '606', room: '3楼304', bed: '1床', birthDate: '1950-01-01', checkInTime: '2024-01-01 10:00:00', nursingLevel: '二级', nurse: '王五', status: '良好' },
       { id: 2, name: '李四', gender: '女', bloodType: 'B', phone: '13800138001', family: '李李', idCard: '1234567891', building: '606', room: '1楼103', bed: '2床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵六', status: '一般' },
       { id: 3, name: '王小明', gender: '男', bloodType: 'O', phone: '13800138002', family: '王大明', idCard: '1234567892', building: '606', room: '1楼104', bed: '2床', birthDate: '1955-03-03', checkInTime: '2024-01-03 09:00:00', nursingLevel: '二级', nurse: '钱七', status: '良好' },
       { id: 4, name: '霍一', gender: '女', bloodType: 'B', phone: '13800138003', family: '一', idCard: '1234567893', building: '606', room: '1楼104', bed: '1床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵一', status: '一般' },
       { id: 5, name: '关二', gender: '男', bloodType: 'B', phone: '13800138004', family: '二', idCard: '1234567894', building: '606', room: '2楼202', bed: '1床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵二', status: '一般' },
       { id: 6, name: '杜五', gender: '女', bloodType: 'AB', phone: '13800138005', family: '三', idCard: '1234567851', building: '606', room: '2楼203', bed: '2床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵七', status: '一般' },
       { id: 7, name: '于九', gender: '女', bloodType: 'B', phone: '13800138006', family: '四', idCard: '1234567896', building: '606', room: '3楼302', bed: '1床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵三', status: '良好' }, 
       { id: 8, name: '一二', gender: '男', bloodType: 'O', phone: '13800138007', family: '五', idCard: '1234567897', building: '606', room: '3楼303', bed: '2床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵五', status: '一般' },
       { id: 9, name: '三四', gender: '女', bloodType: 'B', phone: '13800138008', family: '六', idCard: '1234567898', building: '606', room: '3楼304', bed: '2床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵八', status: '一般' },
       { id: 10, name: '小七', gender: '女', bloodType: 'A', phone: '13800138009', family: '七', idCard: '1234567881', building: '606', room: '3楼305', bed: '2床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵九', status: '良好' },
       { id: 11, name: '吴吴', gender: '男', bloodType: 'B', phone: '13800138010', family: '八', idCard: '1234567871', building: '606', room: '3楼305', bed: '1床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵十', status: '一般' },
       { id: 12, name: '林六', gender: '女', bloodType: 'AB', phone: '13800138030', family: '九', idCard: '1234567691', building: '606', room: '3楼306', bed: '1床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵一六', status: '一般' },
       { id: 13, name: '方七', gender: '女', bloodType: 'B', phone: '13800138040', family: '十', idCard: '1234567871', building: '606', room: '3楼306', bed: '2床', birthDate: '1960-02-02', checkInTime: '2024-01-02 11:00:00', nursingLevel: '二级', nurse: '赵五六', status: '一般' }
      ],
      allData: [],
      filteredData: [],  
      dialogVisible: false,
      modalTitle: '',
      isEdit: false,
      form: {
        id: '',
        name: '',
        age: '',
        gender: '',
        birthDate: '',
        idCard: '',
        bloodType: '',
        phone: '',
        family: '',
        building: '',
        room: '',
        bed: '',
        checkInTime: '',
        contractEndTime: '',
        nursingLevel: '',
        nurse: '',
        status: ''
      },
      rules: {
        name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
        idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        room: [{ required: true, message: '请选择房间号', trigger: 'change' }],
        bed: [{ required: true, message: '请选择床位号', trigger: 'change' }],
        checkInTime: [{ required: true, message: '请选择入住时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    
    displayData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData.slice(start, end)
    },
    
    filteredTotal() {
      return this.filteredData.length
    }
  },
  mounted() {
    this.allData = [...this.selfCareData, ...this.nursingData]
    this.filterData()
  },
  methods: {
    handleReset() {
      this.searchName = ''
      this.filterData()
      this.currentPage = 1
      ElMessage.success('已重置搜索条件')
    },
    
    filterData() {
      let result = [...this.allData]

      if (this.activeTab === 'self-care') {
        result = result.filter(item => item.nursingLevel === '一级')
      } else if (this.activeTab === 'nursing') {
        result = result.filter(item => item.nursingLevel === '二级' || item.nursingLevel === '三级')
      }
      
      if (this.searchName && this.searchName.trim()) {
        result = result.filter(item => item.name.includes(this.searchName))
      }
      
      this.filteredData = result
      this.currentPage = 1 
    },
    
    handleSearch() {
      this.filterData()
      if (this.searchName && this.searchName.trim()) {
        if (this.filteredTotal === 0) {
          ElMessage.warning('未找到相关客户记录')
        } else {
          ElMessage.success(`找到 ${this.filteredTotal} 条记录`)
        }
      } else if (!this.searchName || !this.searchName.trim()) {
        ElMessage.warning('请输入客户姓名')
      }
    },
  
    handleTabChange() {
      this.filterData()
    },
   
    handlePageChange(page) {
      this.currentPage = page
    },

    openModal(type, row = {}) {
      this.isEdit = type === 'edit'
      this.modalTitle = this.isEdit ? '修改客户信息' : '新增入住登记'
      this.dialogVisible = true

      if (this.isEdit && row.id) {
        this.form = { ...row }
      } else {
        this.resetForm()
      }
    },

    resetForm() {
      this.form = {
        id: '',
        name: '',
        age: '',
        gender: '',
        birthDate: '',
        idCard: '',
        bloodType: '',
        phone: '',
        family: '',
        building: '',
        room: '',
        bed: '',
        checkInTime: '',
        contractEndTime: '',
        nursingLevel: '',
        nurse: '',
        status: ''
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },

    submitForm() {
      if (!this.$refs.formRef) return

      this.$refs.formRef.validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            const index = this.allData.findIndex(item => item.id === this.form.id)
            if (index !== -1) {
              this.allData.splice(index, 1, { ...this.form })
              ElMessage.success('修改成功')
            } else {
              ElMessage.error('未找到要修改的记录')
            }
          } else {
            const newId = this.allData.length > 0
              ? Math.max(...this.allData.map(item => item.id)) + 1
              : 1
            this.form.id = newId
            this.allData.push({ ...this.form })
            ElMessage.success('添加成功')
          }

          this.dialogVisible = false
          this.filterData()  
          this.resetForm()
        } else {
          ElMessage.warning('请填写完整信息')
          return false
        }
      })
    },

    deleteRow(id) {
      ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.allData = this.allData.filter(item => item.id !== id)
        this.filterData() 
        ElMessage.success('删除成功')
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
.el-table {
  font-size: 14px;
}

@media (max-width: 768px) {
  div[style*="display: flex; align-items: center; gap: 10px;"] {
    flex-wrap: wrap;
  }
}
</style>