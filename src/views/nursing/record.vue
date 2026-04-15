<template>
  <div style="padding: 20px;">
    <h2>护理记录</h2>

    <!-- 查询条件 -->
    <div style="margin: 15px 0; display: flex; gap: 12px;">
      <el-input
        v-model="queryName"
        placeholder="输入客户姓名模糊查询"
        style="width: 260px;"
        clearable
      />
      <el-button type="primary" @click="refreshCustomer">查询</el-button>
    </div>

    <!-- 客户列表 -->
    <el-table
      :data="pagedCustomers"
      border
      stripe
      @row-click="selectCustomer"
      :highlight-current-row="true"
      style="width: 100%; margin-bottom: 20px;"
    >
      <el-table-column label="ID" prop="id" align="center" width="70" />
      <el-table-column label="客户姓名" prop="name" align="center" />
      <el-table-column label="性别" prop="gender" align="center" width="80" />
      <el-table-column label="年龄" prop="age" align="center" width="80" />
      <el-table-column label="护理级别" prop="nursingLevel" align="center" width="130" />
    </el-table>

    <!-- 客户分页 -->
    <el-pagination
      v-model:current-page="customerPage"
      v-model:page-size="customerSize"
      layout="total, prev, pager, next, jumper"
      :total="filteredCustomers.length"
      style="text-align: right; margin-bottom: 20px;"
      prev-text="上一页"
      next-text="下一页"
    >
      <template #total="{ total }"><span>共 {{ total }} 条</span></template>
      <template #jumper>
        <span>跳至</span>
        <el-input v-model.number="customerPage" type="number" style="width:60px; margin:0 5px;" />
        <span>页</span>
      </template>
    </el-pagination>

    <!-- 护理记录列表 -->
    <div v-if="currentCustomer">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3>客户【{{ currentCustomer.name }}】的护理记录</h3>
        <el-button type="primary" @click="openAddRecordDialog">添加护理记录</el-button>
      </div>
      <el-table :data="visibleRecords" border stripe style="width: 100%; margin-top: 10px;">
        <el-table-column label="项目编号" prop="projectCode" align="center" />
        <el-table-column label="项目名称" prop="projectName" align="center" />
        <el-table-column label="护理数量" prop="quantity" align="center" width="100" />
        <el-table-column label="护理时间" prop="nursingTime" align="center" width="140" />
        <el-table-column label="护理内容" prop="nursingContent" align="center" />
        <el-table-column label="操作" align="center" width="120">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="removeRecord(scope.row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else style="color: #999; margin-top: 20px;">
      请先选择左侧客户查看护理记录
    </div>

    <!-- 新增：添加护理记录弹窗（1:1还原图中样式） -->
    <el-dialog
      v-model="showAddDialog"
      title="添加护理记录"
      width="500px"
      :close-on-click-modal="false"
      center
    >
      <el-form :model="addForm" label-width="120px" style="margin-top: 20px;">
        <el-form-item label="客户姓名">
          <el-input v-model="addForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="护理项目编号">
          <el-input v-model="addForm.projectCode" />
        </el-form-item>
        <el-form-item label="护理项目">
          <el-input v-model="addForm.projectName" />
        </el-form-item>
        <el-form-item label="护理时间" required>
          <el-date-picker
            v-model="addForm.nursingTime"
            type="date"
            placeholder="选择护理时间"
            style="width: 100%;"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="护理数量" required>
          <el-input v-model.number="addForm.quantity" placeholder="默认1" />
        </el-form-item>
        <el-form-item label="护理内容">
          <el-input v-model="addForm.nursingContent" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddRecord">立即创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NursingRecord',
  data() {
    return {
      // 查询
      queryName: '',

      // 客户数据
      customerList: [
        { id: 1, name: '孙瑞英', gender: '女', age: 68, nursingLevel: '二级护理' },
        { id: 2, name: '张帆', gender: '男', age: 77, nursingLevel: '三级护理' },
        { id: 3, name: '苗月兰', gender: '女', age: 67, nursingLevel: null },
      ],

      // 护理记录（模拟数据，匹配图中孙瑞英的吸氧记录）
      nursingRecords: [
        { 
          id: 1,
          customerId: 1, 
          projectCode: 'HLXM0001', 
          projectName: '吸氧', 
          quantity: 1, 
          nursingTime: '2023-11-24', 
          nursingContent: '吸氧护理' 
        },
        { 
          id: 2,
          customerId: 1, 
          projectCode: 'HLXM0002', 
          projectName: '协助服药', 
          quantity: 1, 
          nursingTime: '2023-11-24', 
          nursingContent: '' 
        }
      ],

      // 已移除的记录ID（用于隐藏）
      removedRecordIds: [],

      // 当前选中客户
      currentCustomer: null,

      // 分页
      customerPage: 1,
      customerSize: 10,

      // 新增：添加记录弹窗相关
      showAddDialog: false,
      addForm: {
        customerName: '',
        projectCode: '',
        projectName: '',
        nursingTime: '',
        quantity: 1, // 默认1
        nursingContent: ''
      }
    }
  },
  computed: {
    // 模糊筛选客户
    filteredCustomers() {
      return this.customerList.filter(c =>
        c.name.includes(this.queryName)
      )
    },
    // 分页客户
    pagedCustomers() {
      const start = (this.customerPage - 1) * this.customerSize
      return this.filteredCustomers.slice(start, start + this.customerSize)
    },
    // 当前客户的所有记录
    currentCustomerAllRecords() {
      if (!this.currentCustomer) return []
      return this.nursingRecords.filter(
        r => r.customerId === this.currentCustomer.id
      )
    },
    // 显示的记录（排除已移除）
    visibleRecords() {
      return this.currentCustomerAllRecords.filter(
        r => !this.removedRecordIds.includes(r.id)
      )
    },
  },
  methods: {
    // 刷新查询
    refreshCustomer() {
      this.customerPage = 1
    },

    // 选择客户
    selectCustomer(row) {
      this.currentCustomer = row
    },

    // 移除记录（隐藏）
    removeRecord(row) {
      this.$confirm('确定要移除此护理记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.removedRecordIds.push(row.id)
        this.$message.success('已移除')
      })
    },

    // ================== 新增：添加护理记录相关方法 ==================
    // 打开添加记录弹窗
    openAddRecordDialog() {
      if (!this.currentCustomer) {
        this.$message.warning('请先选择客户！')
        return
      }
      // 初始化表单，自动填充客户姓名
      this.addForm = {
        customerName: this.currentCustomer.name,
        projectCode: '',
        projectName: '',
        nursingTime: '',
        quantity: 1, // 默认1
        nursingContent: ''
      }
      this.showAddDialog = true
    },

    // 保存新增的护理记录
    saveAddRecord() {
      // 表单校验
      if (!this.addForm.projectCode || !this.addForm.projectName || !this.addForm.nursingTime) {
        this.$message.warning('请填写必填项（护理时间、护理数量、项目信息）')
        return
      }

      // 生成唯一ID
      const newId = Date.now() + Math.floor(Math.random() * 1000)
      
      // 构造新记录
      const newRecord = {
        id: newId,
        customerId: this.currentCustomer.id,
        projectCode: this.addForm.projectCode,
        projectName: this.addForm.projectName,
        quantity: this.addForm.quantity,
        nursingTime: this.addForm.nursingTime,
        nursingContent: this.addForm.nursingContent
      }

      // 追加到护理记录列表
      this.nursingRecords.push(newRecord)
      
      this.$message.success('护理记录添加成功！')
      this.showAddDialog = false
    }
  },
}
</script>

<style scoped>
/* 弹窗样式优化，匹配图中视觉效果 */
:deep(.el-dialog__body) {
  padding: 20px 40px;
}
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>