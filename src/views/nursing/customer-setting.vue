<template>
  <div style="padding: 20px;">
    <h2>客户护理设置</h2>

    <!-- 查询区域 -->
    <div style="margin: 10px 0; display: flex; gap: 10px;">
      <el-input
        v-model="queryName"
        placeholder="请输入客户姓名进行模糊查询"
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
      style="width: 100%; margin-bottom: 15px;"
      @row-click="selectCustomer"
      :highlight-current-row="true"
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
        <el-button
          size="small"
          type="primary"
          :disabled="!!currentRow?.nursingLevel"
          @click.stop="openSetLevelDialog"
        >
          设置护理级别
        </el-button>
        <el-button
          size="small"
          type="danger"
          :disabled="!currentRow?.nursingLevel"
          @click.stop="confirmRemoveLevel"
        >
          移除护理级别
        </el-button>
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
      <el-table :data="customerProjects" border stripe style="width:100%; margin-top:10px;">
        <el-table-column label="项目编号" prop="projectCode" align="center" />
        <el-table-column label="项目名称" prop="projectName" align="center" />
        <el-table-column label="购买数量" prop="quantity" align="center" width="100" />
        <el-table-column label="购买日期" prop="buyDate" align="center" width="140" />
        <el-table-column label="到期日期" prop="expireDate" align="center" width="140" />
      </el-table>
    </div>

    <!-- 设置级别弹窗 -->
    <el-dialog v-model="showSetDialog" title="设置护理级别" width="650px" center>
      <el-form label-width="100px">
        <el-form-item label="客户姓名">
          <el-input :value="currentRow?.name" disabled />
        </el-form-item>
        <el-form-item label="选择级别">
          <el-select v-model="selectedLevel" placeholder="请选择护理级别" style="width:100%">
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
        <el-table-column type="selection" />
        <el-table-column label="项目编号" prop="code" />
        <el-table-column label="项目名称" prop="name" />
      </el-table>

      <div style="text-align:right; margin-top:15px;">
        <el-button @click="showSetDialog = false">取消</el-button>
        <el-button type="primary" @click="saveLevelAndProjects">确认设置</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CustomerNursingSetting',
  data() {
    return {
      // 查询
      queryName: '',

      // 客户数据
      customerList: [
        { id: 1, name: '张三', gender: '男', age: 66, nursingLevel: null },
        { id: 2, name: '李四', gender: '女', age: 72, nursingLevel: '一级护理' },
        { id: 3, name: '王五', gender: '男', age: 68, nursingLevel: null },
      ],

      // 护理级别（内置）
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

      // 选中
      currentRow: null,
      selectedLevel: null,
      selectedProjects: [],

      // 弹窗
      showSetDialog: false,

      // 分页
      customerPage: 1,
      customerSize: 10,

      // 客户护理项目存储
      customerProjectList: [],
    }
  },
  computed: {
    // 模糊筛选客户
    filteredCustomers() {
      return this.customerList.filter(item =>
        item.name.includes(this.queryName)
      )
    },
    // 分页客户
    pagedCustomers() {
      const start = (this.customerPage - 1) * this.customerSize
      return this.filteredCustomers.slice(start, start + this.customerSize)
    },
    // 当前客户的护理项目
    customerProjects() {
      if (!this.currentRow) return []
      return this.customerProjectList.filter(
        i => i.customerId === this.currentRow.id
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
      this.currentRow = row
    },

    // 打开设置级别弹窗
    openSetLevelDialog() {
      if (!this.currentRow) {
        this.$message.warning('请选择客户')
        return
      }
      if (this.currentRow.nursingLevel) {
        this.$message.warning('请先移除当前级别再设置')
        return
      }
      this.selectedLevel = null
      this.selectedProjects = []
      this.showSetDialog = true
    },

    // 选中项目
    handleSelectProject(val) {
      this.selectedProjects = val
    },

    // 保存级别 + 批量添加项目
    saveLevelAndProjects() {
      if (!this.selectedLevel) {
        this.$message.warning('请选择护理级别')
        return
      }
      if (this.selectedProjects.length === 0) {
        this.$message.warning('请至少选择一个护理项目')
        return
      }

      // 1. 更新客户级别
      const idx = this.customerList.findIndex(i => i.id === this.currentRow.id)
      this.customerList[idx].nursingLevel = this.selectedLevel.name

      // 2. 生成日期
      const today = new Date().toISOString().split('T')[0]
      const expireDate = new Date()
      expireDate.setMonth(expireDate.getMonth() + 3)
      const expire = expireDate.toISOString().split('T')[0]

      // 3. 批量添加项目
      const batch = this.selectedProjects.map(item => ({
        customerId: this.currentRow.id,
        projectCode: item.code,
        projectName: item.name,
        quantity: 1,
        buyDate: today,
        expireDate: expire,
      }))

      this.customerProjectList = [...this.customerProjectList, ...batch]
      this.$message.success('设置成功，已批量添加护理项目')
      this.showSetDialog = false
    },

    // 移除级别 + 级联删除项目
    confirmRemoveLevel() {
      this.$confirm(
        '确定要移除该客户的护理级别吗？\n同时会删除所有护理项目！',
        '警告',
        { type: 'warning' }
      ).then(() => {
        // 1. 清空级别
        const idx = this.customerList.findIndex(i => i.id === this.currentRow.id)
        this.customerList[idx].nursingLevel = null

        // 2. 删除项目
        this.customerProjectList = this.customerProjectList.filter(
          i => i.customerId !== this.currentRow.id
        )
        this.$message.success('已移除护理级别并删除所有项目')
      })
    },
  },
}
</script>