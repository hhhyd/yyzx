<template>
  <div style="padding: 20px; max-width: 1200px;">
    <h2>护理项目</h2>

    <!-- 查询区域 -->
    <div style="margin: 15px 0; display: flex; gap: 12px; align-items: center;">
      <el-select
        v-model="queryStatus"
        placeholder="护理项目状态"
        style="width: 150px;"
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
      <el-button type="success" @click="openAddDialog">新增护理项目</el-button>
    </div>

    <!-- 护理项目列表（操作列整合修改/删除/护理） -->
    <el-table
      :data="pagedList"
      border
      stripe
      style="width: 100%; margin-bottom: 20px;"
      :header-cell-style="{ background:'#1890ff', color:'#fff', fontWeight:'bold' }"
    >
      <el-table-column label="序号" align="center" width="80">
        <template #default="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>

      <el-table-column label="客户" prop="customerName" align="center" />
      <el-table-column label="护理项目编号" prop="code" align="center" />
      <el-table-column label="护理项目名称" prop="name" align="center" />
      <el-table-column label="价格" prop="price" align="center" width="120" />
      <el-table-column label="余量" prop="remain" align="center" width="100" />
      <el-table-column label="服务到期日期" prop="expireDate" align="center" width="160" />
      
      <el-table-column label="状态" align="center" width="120">
        <template #default="scope">
          <div
            :style="{
              backgroundColor: getStatusColor(scope.row),
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '4px',
              textAlign: 'center',
              fontWeight: 'bold'
            }"
          >
            {{ getStatusText(scope.row) }}
          </div>
        </template>
      </el-table-column>

      <!-- 操作列：整合修改、删除、护理 -->
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            style="background:#1890ff; border:none; border-radius:4px; margin-right:5px;"
            @click="handleNursing(scope.row)"
          >
            护理
          </el-button>
          <el-button
            size="small"
            type="warning"
            style="margin-right:5px;"
            @click="openEditDialog(scope.row)"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      layout="total, prev, pager, next, jumper"
      :total="filteredList.length"
      style="text-align: right;"
      prev-text="上一页"
      next-text="下一页"
    />

    <!-- 新增护理项目弹窗 -->
    <el-dialog v-model="addDialog" title="新增护理项目" width="650px" center>
      <el-form :model="addForm" label-width="130px">
        <el-form-item label="项目编号" required>
          <el-input v-model="addForm.code" />
        </el-form-item>
        <el-form-item label="项目名称" required>
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input v-model="addForm.price" />
        </el-form-item>
        <el-form-item label="执行周期">
          <el-input v-model="addForm.cycle" placeholder="如：每日、每周" />
        </el-form-item>
        <el-form-item label="执行次数">
          <el-input v-model.number="addForm.times" type="number" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="addForm.status">
            <el-radio label="启用" />
            <el-radio label="停用" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="addForm.desc" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAdd">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- 修改护理项目弹窗 -->
    <el-dialog v-model="editDialog" title="修改护理项目" width="650px" center>
      <el-form :model="editForm" label-width="130px">
        <el-form-item label="项目编号">
          <el-input v-model="editForm.code" disabled />
        </el-form-item>
        <el-form-item label="项目名称" required>
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input v-model="editForm.price" />
        </el-form-item>
        <el-form-item label="执行周期">
          <el-input v-model="editForm.cycle" />
        </el-form-item>
        <el-form-item label="执行次数">
          <el-input v-model.number="editForm.times" type="number" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio label="启用" />
            <el-radio label="停用" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.desc" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 工具函数：计算3个月后日期
const get3MonthsLater = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

// 工具函数：获取今天日期
const getToday = () => new Date().toISOString().split('T')[0]

export default {
  name: 'NursingProject',
  data() {
    return {
      // 移除全局共享依赖，直接内置护理项目数据
      projectList: [
        // 初始化示例数据
        {
          id: 1,
          customerName: '孙瑞英',
          code: 'PROJ001',
          name: '基础护理',
          price: '50.00',
          cycle: '每日',
          times: 30,
          remain: 25,
          status: '启用',
          expireDate: get3MonthsLater(),
          desc: '日常基础护理服务'
        },
        {
          id: 2,
          customerName: '孙瑞英',
          code: 'PROJ002',
          name: '康复训练',
          price: '80.00',
          cycle: '每周',
          times: 12,
          remain: 2,
          status: '启用',
          expireDate: get3MonthsLater(),
          desc: '术后康复训练'
        }
      ],
      // 护理级别数据（内置，替代全局共享）
      levelList: [
        { id: 1, name: '一级护理', projectIds: [1, 2] },
        { id: 2, name: '二级护理', projectIds: [1] }
      ],

      // 查询条件
      queryName: '',
      queryStatus: '启用', // 默认查询启用状态

      // 分页
      page: 1,
      size: 10,

      // 弹窗控制
      addDialog: false,
      editDialog: false,

      // 表单数据
      addForm: {
        code: '',
        name: '',
        price: '',
        cycle: '',
        times: 1,
        status: '启用',
        desc: ''
      },
      editForm: {}
    }
  },
  computed: {
    // 多条件筛选列表
    filteredList() {
      return this.projectList.filter(item => {
        const matchStatus = !this.queryStatus || item.status === this.queryStatus
        const matchName = !this.queryName || item.name.includes(this.queryName)
        return matchStatus && matchName
      })
    },
    // 分页列表
    pagedList() {
      const start = (this.page - 1) * this.size
      return this.filteredList.slice(start, start + this.size)
    }
  },
  methods: {
    // 辅助函数：根据规则判断状态颜色
    getStatusColor(row) {
      const today = getToday()
      // 已欠费/已到期/停用 红色；即将用完 橙色；正常 绿色
      if (row.status === '停用' || row.remain <= 0 || row.expireDate < today) {
        return '#f5222d'
      }
      if (row.remain <= 2) {
        return '#faad14'
      }
      return '#52c41a'
    },
    // 辅助函数：获取状态文本
    getStatusText(row) {
      const today = getToday()
      if (row.status === '停用') return '停用'
      if (row.expireDate < today) return '已到期'
      if (row.remain <= 0) return '已欠费'
      if (row.remain <= 2) return '即将用完'
      return '未到期'
    },

    // 刷新查询（重置页码）
    refreshList() {
      this.page = 1
    },

    // 执行护理操作
    handleNursing(row) {
      this.$message.info(`执行护理：${row.name}，余量-${1}`)
      // 护理后余量减1（模拟业务逻辑）
      const index = this.projectList.findIndex(item => item.id === row.id)
      if (index > -1) {
        this.projectList[index].remain = Math.max(0, this.projectList[index].remain - 1)
      }
    },

    // ---------------------- 新增护理项目 ----------------------
    openAddDialog() {
      // 重置新增表单
      this.addForm = {
        code: '',
        name: '',
        price: '',
        cycle: '',
        times: 1,
        status: '启用',
        desc: ''
      }
      this.addDialog = true
    },
    saveAdd() {
      // 表单校验
      if (!this.addForm.code || !this.addForm.name || !this.addForm.price) {
        this.$message.warning('请填写项目编号、名称、价格等必填项！')
        return
      }

      // 生成新ID
      const newId = this.projectList.length
        ? Math.max(...this.projectList.map(p => p.id)) + 1
        : 1

      // 新增项目
      this.projectList.push({
        id: newId,
        customerName: '孙瑞英', // 可根据实际需求改为动态选择
        code: this.addForm.code,
        name: this.addForm.name,
        price: this.addForm.price,
        cycle: this.addForm.cycle,
        times: this.addForm.times,
        remain: this.addForm.times, // 初始余量=执行次数
        status: this.addForm.status,
        expireDate: get3MonthsLater(),
        desc: this.addForm.desc
      })

      this.$message.success('新增护理项目成功！')
      this.addDialog = false
    },

    // ---------------------- 修改护理项目 ----------------------
    openEditDialog(row) {
      // 深拷贝避免直接修改原数据
      this.editForm = JSON.parse(JSON.stringify(row))
      this.editDialog = true
    },
    saveEdit() {
      // 表单校验
      if (!this.editForm.name || !this.editForm.price) {
        this.$message.warning('请填写项目名称、价格等必填项！')
        return
      }

      // 找到要修改的项目索引
      const index = this.projectList.findIndex(p => p.id === this.editForm.id)
      if (index === -1) return

      // 状态改为停用时，自动从护理级别中剔除
      if (this.editForm.status === '停用' && this.projectList[index].status !== '停用') {
        this.removeProjectFromLevels(this.editForm.id)
      }

      // 更新项目数据
      this.projectList[index] = { ...this.projectList[index], ...this.editForm }
      this.$message.success('修改护理项目成功！')
      this.editDialog = false
    },

    // ---------------------- 删除护理项目 ----------------------
    handleDelete(row) {
      this.$confirm('确定删除该护理项目？\n删除后不会影响客户历史护理记录', '警告', {
        type: 'warning'
      }).then(() => {
        // 从护理级别中剔除该项目
        this.removeProjectFromLevels(row.id)

        // 从列表中删除
        const idx = this.projectList.findIndex(p => p.id === row.id)
        if (idx > -1) {
          this.projectList.splice(idx, 1)
        }

        this.$message.success('删除护理项目成功！')
      })
    },

    // ---------------------- 工具函数：从护理级别剔除项目 ----------------------
    removeProjectFromLevels(projectId) {
      this.levelList.forEach(level => {
        level.projectIds = level.projectIds.filter(id => id !== projectId)
      })
    }
  }
}
</script>

<style scoped>
.el-table th {
  background-color: #1890ff !important;
  color: #fff !important;
}
.el-table {
  border-radius: 6px;
  overflow: hidden;
}
.el-button + .el-button {
  margin-left: 5px;
}
</style>