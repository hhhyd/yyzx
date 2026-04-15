<template>
  <div style="padding: 20px;">
    <h2>客户护理设置</h2>

    <!-- 查询区域 -->
    <div style="margin: 10px 0; display: flex; gap: 10px; align-items: center;">
      <el-input
        v-model="queryName"
        placeholder="请输入客户姓名进行模糊查询"
        style="width: 260px;"
        clearable
      />
      <el-button 
        type="primary" 
        style="background:#409EFF;border-color:#409EFF" 
        @click="refreshCustomer"
      >
        查询
      </el-button>
    </div>

    <!-- 客户列表 -->
    <el-table
      :data="pagedCustomers"
      border
      stripe
      style="width: 100%; margin-bottom: 15px;"
      row-key="id"
    >
      <el-table-column label="ID" prop="id" align="center" width="70" />
      <el-table-column label="客户姓名" prop="name" align="center" />
      <el-table-column label="性别" prop="gender" align="center" width="80" />
      <el-table-column label="年龄" prop="age" align="center" width="80" />
      <el-table-column label="护理级别" align="center" width="130">
        <template #default="scope">
          <el-tag :type="scope.row.nursingLevel ? 'success' : 'info'">
            {{ scope.row.nursingLevel || '未设置' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            style="background:#409EFF;border-color:#409EFF"
            :disabled="!!scope.row.nursingLevel"
            @click.stop="openSetLevelDialog(scope.row)"
          >
            设置护理级别
          </el-button>
          <el-button
            size="small"
            type="danger"
            :disabled="!scope.row.nursingLevel"
            @click.stop="confirmRemoveLevel(scope.row)"
          >
            移除护理级别
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 客户分页 -->
    <el-pagination
      v-model:current-page="customerPage"
      v-model:page-size="customerSize"
      layout="total, prev, pager, next, jumper"
      :total="filteredCustomers.length"
      style="text-align:right;"
    />

    <!-- 客户护理项目列表 -->
    <div style="margin-top: 30px;">
      <h3>当前客户：{{ currentRow ? currentRow.name : '未选择' }} 的护理项目</h3>
      <el-table 
        :data="customerProjects" 
        border 
        stripe 
        style="width:100%; margin-top:10px;"
        empty-text="暂无护理项目"
      >
        <el-table-column label="项目编号" prop="projectCode" align="center" />
        <el-table-column label="项目名称" prop="projectName" align="center" />
        <el-table-column label="购买数量" prop="quantity" align="center" width="100" />
        <el-table-column label="购买日期" prop="buyDate" align="center" width="140" />
        <el-table-column label="到期日期" prop="expireDate" align="center" width="140" />
      </el-table>
    </div>

    <!-- 设置级别弹窗 -->
    <el-dialog 
      v-model="showSetDialog" 
      :title="`为 ${selectedCustomer?.name} 设置护理级别`" 
      width="650px" 
      center
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="客户姓名">
          <el-input :value="selectedCustomer?.name" disabled />
        </el-form-item>
        <el-form-item label="选择级别">
          <el-select 
            v-model="selectedLevel" 
            placeholder="请选择护理级别" 
            style="width:100%"
            @change="clearProjectSelection"
          >
            <el-option
              v-for="item in levelList"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <el-divider>护理项目（可批量选择）</el-divider>
      <el-table
        :data="selectedLevel?.projects || []"
        border
        ref="projectTable"
        row-key="id"
        style="width:100%"
        @selection-change="handleSelectProject"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="项目编号" prop="code" />
        <el-table-column label="项目名称" prop="name" />
      </el-table>

      <div style="text-align:right; margin-top:15px;">
        <el-button @click="showSetDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          style="background:#409EFF;border-color:#409EFF"
          @click="saveLevelAndProjects"
        >
          确认设置
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CustomerNursingSetting',
  data() {
    return {
      // 查询条件
      queryName: '',

      // 客户基础数据
      customerList: [
        { id: 1, name: '张三', gender: '男', age: 66, nursingLevel: null },
        { id: 2, name: '李四', gender: '女', age: 72, nursingLevel: null  },
        { id: 3, name: '王五', gender: '男', age: 68, nursingLevel: null },
      ],

      // 护理级别数据
      levelList: [
        {
          id: 1,
          name: '一级护理',
          projects: [
            { id: 1, code: 'HL001', name: '生命体征监测' },
            { id: 2, code: 'HL002', name: '协助翻身' },
          ],
        },
        {
          id: 2,
          name: '二级护理',
          projects: [
            { id: 3, code: 'HL003', name: '口腔护理' },
            { id: 4, code: 'HL004', name: '皮肤护理' },
          ],
        },
        {
          id: 3,
          name: '三级护理',
          projects: [
            { id: 5, code: 'HL005', name: '健康巡视' },
          ],
        },
      ],

      // 当前选中客户（用于显示护理项目）
      currentRow: null,
      
      // 弹窗选中的客户
      selectedCustomer: null,

      // 弹窗选中数据
      selectedLevel: null,
      selectedProjects: [],

      // 弹窗控制
      showSetDialog: false,

      // 分页配置
      customerPage: 1,
      customerSize: 10,

      // 客户护理项目记录
      customerProjectList: [],
    }
  },
  computed: {
    // 模糊筛选客户列表
    filteredCustomers() {
      const keyword = this.queryName.trim()
      if (!keyword) return this.customerList
      return this.customerList.filter(item =>
        item.name.includes(keyword)
      )
    },

    // 分页处理后的客户列表
    pagedCustomers() {
      const start = (this.customerPage - 1) * this.customerSize
      return this.filteredCustomers.slice(start, start + this.customerSize)
    },

    // 当前选中客户的护理项目
    customerProjects() {
      if (!this.currentRow) return []
      return this.customerProjectList.filter(
        item => item.customerId === this.currentRow.id
      )
    },
  },
  methods: {
    // 刷新查询（重置页码）
    refreshCustomer() {
      this.customerPage = 1
    },

    // 清空项目选中状态
    clearProjectSelection() {
      this.selectedProjects = []
      if (this.$refs.projectTable) {
        this.$refs.projectTable.clearSelection()
      }
    },

    // 打开设置护理级别弹窗
    openSetLevelDialog(customer) {
      if (customer.nursingLevel) {
        this.$message.warning('请先移除当前护理级别后再设置')
        return
      }
      
      this.selectedCustomer = customer
      this.currentRow = customer
      this.selectedLevel = null
      this.clearProjectSelection()
      this.showSetDialog = true
    },

    // 监听项目多选
    handleSelectProject(val) {
      this.selectedProjects = val
    },

    // 保存护理级别与护理项目
    saveLevelAndProjects() {
      if (!this.selectedLevel) {
        this.$message.warning('请选择护理级别')
        return
      }
      if (this.selectedProjects.length === 0) {
        this.$message.warning('请至少选择一个护理项目')
        return
      }

      // 更新客户护理级别
      const customerIndex = this.customerList.findIndex(
        item => item.id === this.selectedCustomer.id
      )
      if (customerIndex > -1) {
        this.customerList[customerIndex].nursingLevel = this.selectedLevel.name
      }

      // 生成日期
      const today = new Date().toISOString().split('T')[0]
      const expireDate = new Date()
      expireDate.setMonth(expireDate.getMonth() + 3)
      const expire = expireDate.toISOString().split('T')[0]

      // 批量添加护理项目
      const batchProjects = this.selectedProjects.map(item => ({
        customerId: this.selectedCustomer.id,
        projectCode: item.code,
        projectName: item.name,
        quantity: 1,
        buyDate: today,
        expireDate: expire,
      }))

      this.customerProjectList = [...this.customerProjectList, ...batchProjects]
      this.$message.success('护理级别设置成功，项目已批量添加')
      this.showSetDialog = false
    },

    // 移除护理级别 + 级联删除项目
    confirmRemoveLevel(customer) {
      this.$confirm(
        `确定要移除客户 ${customer.name} 的护理级别吗？\n同时会删除所有关联护理项目！`,
        '温馨提示',
        { type: 'warning', confirmButtonText: '确定移除', cancelButtonText: '取消' }
      ).then(() => {
        // 清空客户护理级别
        const index = this.customerList.findIndex(i => i.id === customer.id)
        if (index > -1) {
          this.customerList[index].nursingLevel = null
        }

        // 删除关联护理项目
        this.customerProjectList = this.customerProjectList.filter(
          item => item.customerId !== customer.id
        )

        // 如果当前显示的是这个客户的项目，清空显示
        if (this.currentRow && this.currentRow.id === customer.id) {
          this.currentRow = null
        }

        this.$message.success('已成功移除护理级别并清空关联项目')
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
  },
}
</script>