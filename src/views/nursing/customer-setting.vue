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
        @keyup.enter="refreshCustomer"
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
      @row-click="handleRowClick"
    >
      <el-table-column label="ID" prop="id" align="center" width="70" />
      <el-table-column label="客户姓名" prop="name" align="center" />
      <el-table-column label="性别" prop="gender" align="center" width="80" />
      <el-table-column label="年龄" prop="age" align="center" width="80" />
      <el-table-column label="护理级别" align="center" width="130">
        <template #default="scope">
          <el-tag 
            :type="getLevelTagType(scope.row.nursingLevelId)" 
            effect="light"
          >
            {{ scope.row.nursingLevelName || '未设置' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" fixed="right">
        <template #default="scope">
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            <el-button
              size="small"
              type="primary"
              style="background:#409EFF;border-color:#409EFF;"
              :disabled="!!scope.row.nursingLevelId"
              @click.stop="openSetLevelDialog(scope.row)"
            >
              设置护理级别
            </el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="!scope.row.nursingLevelId"
              @click.stop="confirmRemoveLevel(scope.row)"
            >
              移除护理级别
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 客户分页 -->
    <el-pagination
      v-model:current-page="customerPage"
      v-model:page-size="customerSize"
      layout="total, prev, pager, next, jumper"
      :total="filteredCustomers.length"
      style="text-align:right; margin-bottom: 20px;"
    />

    <!-- 客户护理项目列表 -->
    <div v-if="currentRow" style="margin-top: 30px; border: 1px solid #ebeef5; border-radius: 4px; padding: 20px;">
      <h3 style="margin-bottom: 15px; color: #409EFF;">
        <el-icon><User /></el-icon>
        当前客户：{{ currentRow.name }} 的护理项目
      </h3>
      <el-table 
        :data="customerProjects" 
        border 
        stripe 
        style="width:100%;"
        empty-text="暂无护理项目"
        :row-style="{ height: '60px' }"
      >
        <el-table-column label="项目编号" prop="projectCode" align="center" width="120" />
        <el-table-column label="项目名称" prop="projectName" align="center" width="180" />
        <el-table-column label="购买数量" prop="quantity" align="center" width="100" />
        <el-table-column label="购买日期" prop="buyDate" align="center" width="140" />
        <el-table-column label="到期日期" prop="expireDate" align="center" width="140" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag
              :type="getProjectStatus(scope.row)"
              size="small"
            >
              {{ getProjectStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="护理级别" align="center" width="120">
          <template #default>
            {{ getCustomerLevelName(currentRow.nursingLevelId) }}
          </template>
        </el-table-column>
      </el-table>
      <div v-if="customerProjects.length === 0" style="text-align: center; padding: 20px; color: #909399;">
        <el-icon><InfoFilled /></el-icon>
        <span>该客户暂无护理项目，请设置护理级别以添加项目</span>
      </div>
    </div>
    <div v-else style="margin-top: 30px; padding: 20px; text-align: center; color: #909399; border: 1px dashed #dcdfe6; border-radius: 4px;">
      <el-icon><InfoFilled /></el-icon>
      <span style="margin-left: 5px;">请点击上方表格中的客户行，查看其护理项目</span>
    </div>

    <!-- 设置级别弹窗 -->
    <el-dialog 
      v-model="showSetDialog" 
      :title="`为 ${selectedCustomer?.name} 设置护理级别`" 
      width="700px" 
      center
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="setForm" label-width="120px">
        <el-form-item label="客户姓名">
          <el-input :value="selectedCustomer?.name" disabled />
        </el-form-item>
        <el-form-item label="选择护理级别" required>
          <el-select 
            v-model="setForm.levelId" 
            placeholder="请选择护理级别" 
            style="width:100%"
            @change="handleLevelChange"
          >
            <el-option
              v-for="item in levelList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 护理项目展示区 -->
      <div v-if="setForm.selectedLevel" style="margin-top: 20px;">
        <h4 style="margin-bottom: 10px; color: #606266;">护理项目列表（将批量添加）</h4>
        <el-table
          :data="setForm.selectedLevel.projects"
          border
          style="width:100%; margin-bottom: 10px;"
          :row-style="{ height: '50px' }"
        >
          <el-table-column label="项目编号" prop="code" align="center" width="100" />
          <el-table-column label="项目名称" prop="name" align="center" />
          <el-table-column label="购买数量" align="center" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                :max="99"
                controls-position="right"
                size="small"
                style="width: 100px;"
              />
            </template>
          </el-table-column>
          <el-table-column label="购买日期" align="center" width="140">
            <template #default="scope">
              {{ scope.row.buyDate }}
            </template>
          </el-table-column>
          <el-table-column label="到期日期" align="center" width="140">
            <template #default="scope">
              {{ scope.row.expireDate }}
            </template>
          </el-table-column>
        </el-table>
        <div style="color: #909399; font-size: 12px; margin-top: 5px;">
          <el-icon><InfoFilled /></el-icon>
          <span>将批量添加以上护理项目，购买日期默认为今天，到期日期为3个月后</span>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 20px; color: #909399;">
        请先选择护理级别
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSetDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            style="background:#409EFF;border-color:#409EFF"
            :disabled="!setForm.levelId || !setForm.selectedLevel"
            @click="saveLevelAndProjects"
          >
            确认设置
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { InfoFilled, User } from '@element-plus/icons-vue'

// 获取今天日期
const getToday = () => new Date().toISOString().split('T')[0]

// 获取3个月后日期
const get3MonthsLater = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

export default {
  name: 'CustomerNursingSetting',
  components: {
    InfoFilled,
    User
  },
  data() {
    return {
      // 查询条件
      queryName: '',

      // 客户基础数据
      customerList: [
        { 
          id: 1, 
          name: '张三', 
          gender: '男', 
          age: 66, 
          nursingLevelId: null,
          nursingLevelName: null
        },
        { 
          id: 2, 
          name: '李四', 
          gender: '女', 
          age: 72, 
          nursingLevelId: 1,
          nursingLevelName: '一级护理'
        },
        { 
          id: 3, 
          name: '王五', 
          gender: '男', 
          age: 68, 
          nursingLevelId: null,
          nursingLevelName: null
        },
        { 
          id: 4, 
          name: '赵六', 
          gender: '女', 
          age: 75, 
          nursingLevelId: 2,
          nursingLevelName: '二级护理'
        },
      ],

      // 护理级别数据
      levelList: [
        {
          id: 1,
          name: '一级护理',
          projects: [
            { id: 1, code: 'HL001', name: '生命体征监测' },
            { id: 2, code: 'HL002', name: '协助翻身' },
            { id: 3, code: 'HL003', name: '基础清洁' },
          ],
        },
        {
          id: 2,
          name: '二级护理',
          projects: [
            { id: 4, code: 'HL004', name: '口腔护理' },
            { id: 5, code: 'HL005', name: '皮肤护理' },
            { id: 6, code: 'HL006', name: '营养指导' },
          ],
        },
        {
          id: 3,
          name: '三级护理',
          projects: [
            { id: 7, code: 'HL007', name: '健康巡视' },
            { id: 8, code: 'HL008', name: '心理疏导' },
            { id: 9, code: 'HL009', name: '康复训练' },
          ],
        },
      ],

      // 当前选中客户（用于显示护理项目）
      currentRow: null,
      
      // 弹窗选中的客户
      selectedCustomer: null,

      // 弹窗表单数据
      setForm: {
        levelId: null,
        selectedLevel: null
      },

      // 弹窗控制
      showSetDialog: false,

      // 分页配置
      customerPage: 1,
      customerSize: 10,

      // 客户护理项目记录
      customerProjectList: [
        {
          id: 1,
          customerId: 2,
          projectId: 1,
          projectCode: 'HL001',
          projectName: '生命体征监测',
          quantity: 5,
          buyDate: '2026-01-15',
          expireDate: '2026-04-15'
        },
        {
          id: 2,
          customerId: 2,
          projectId: 2,
          projectCode: 'HL002',
          projectName: '协助翻身',
          quantity: 3,
          buyDate: '2026-01-15',
          expireDate: '2026-04-15'
        },
        {
          id: 3,
          customerId: 4,
          projectId: 4,
          projectCode: 'HL004',
          projectName: '口腔护理',
          quantity: 2,
          buyDate: '2026-02-20',
          expireDate: '2026-05-20'
        }
      ],
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

    // 获取级别标签类型
    getLevelTagType(levelId) {
      if (!levelId) return 'info'
      const colors = ['success', 'warning', 'danger']
      return colors[(levelId - 1) % colors.length] || 'success'
    },

    // 获取护理级别名称
    getCustomerLevelName(levelId) {
      if (!levelId) return '未设置'
      const level = this.levelList.find(item => item.id === levelId)
      return level ? level.name : '未知级别'
    },

    // 点击行查看护理项目
    handleRowClick(row) {
      this.currentRow = row
    },

    // 打开设置护理级别弹窗
    openSetLevelDialog(customer) {
      if (customer.nursingLevelId) {
        this.$message.warning('该客户已有护理级别，请先移除当前护理级别后再设置')
        return
      }
      
      this.selectedCustomer = customer
      this.currentRow = customer
      
      // 重置表单
      this.setForm = {
        levelId: null,
        selectedLevel: null
      }
      
      this.showSetDialog = true
    },

    // 选择护理级别变化
    handleLevelChange(levelId) {
      if (!levelId) {
        this.setForm.selectedLevel = null
        return
      }
      
      const level = this.levelList.find(item => item.id === levelId)
      if (!level) {
        this.setForm.selectedLevel = null
        return
      }
      
      // 深拷贝项目，添加购买数量、日期等字段
      const today = getToday()
      const expireDate = get3MonthsLater()
      
      this.setForm.selectedLevel = {
        ...level,
        projects: level.projects.map(project => ({
          ...project,
          quantity: 1, // 默认购买数量为1
          buyDate: today,
          expireDate: expireDate
        }))
      }
    },

    // 保存护理级别与护理项目
    saveLevelAndProjects() {
      if (!this.setForm.selectedLevel) {
        this.$message.warning('请选择护理级别')
        return
      }

      // 生成新的项目记录
      const newProjects = this.setForm.selectedLevel.projects.map(project => ({
        id: Date.now() + Math.random(), // 生成唯一ID
        customerId: this.selectedCustomer.id,
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
        quantity: project.quantity,
        buyDate: project.buyDate,
        expireDate: project.expireDate
      }))

      // 更新客户护理级别
      const customerIndex = this.customerList.findIndex(
        item => item.id === this.selectedCustomer.id
      )
      if (customerIndex > -1) {
        this.customerList[customerIndex].nursingLevelId = this.setForm.levelId
        this.customerList[customerIndex].nursingLevelName = this.setForm.selectedLevel.name
      }

      // 添加护理项目到列表
      this.customerProjectList = [...this.customerProjectList, ...newProjects]
      
      this.$message.success(`成功设置护理级别：${this.setForm.selectedLevel.name}，批量添加了 ${newProjects.length} 个护理项目`)
      this.showSetDialog = false
      
      // 自动选中设置后的客户
      this.currentRow = this.selectedCustomer
    },

    // 移除护理级别 + 级联删除项目
    confirmRemoveLevel(customer) {
      this.$confirm(
        `确定要移除客户 ${customer.name} 的护理级别吗？\n\n⚠️ 此操作会同时删除该客户所有关联的护理项目！`,
        '警告',
        { 
          type: 'warning', 
          confirmButtonText: '确定移除', 
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger',
          closeOnClickModal: false
        }
      ).then(() => {
        // 1. 清空客户护理级别
        const index = this.customerList.findIndex(i => i.id === customer.id)
        if (index > -1) {
          this.customerList[index].nursingLevelId = null
          this.customerList[index].nursingLevelName = null
        }

        // 2. 删除关联护理项目
        this.customerProjectList = this.customerProjectList.filter(
          item => item.customerId !== customer.id
        )

        // 3. 如果当前显示的是这个客户，更新显示
        if (this.currentRow && this.currentRow.id === customer.id) {
          this.currentRow = { ...customer, nursingLevelId: null, nursingLevelName: null }
        }

        this.$message.success('已成功移除护理级别并清空所有关联项目')
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 获取项目状态颜色
    getProjectStatus(project) {
      const today = getToday()
      if (project.expireDate < today) return 'danger'
      if (project.quantity <= 0) return 'warning'
      return 'success'
    },

    // 获取项目状态文本
    getProjectStatusText(project) {
      const today = getToday()
      if (project.expireDate < today) return '已到期'
      if (project.quantity <= 0) return '已用完'
      return '有效'
    },
  },
}
</script>

<style scoped>
/* 可选的额外样式 */
.el-table {
  border-radius: 4px;
  overflow: hidden;
}
.el-button + .el-button {
  margin-left: 0;
}
.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell {
  background-color: #f0f7ff;
  cursor: pointer;
}
/* 添加选中行样式 */
.el-table__body tr.current-row>td.el-table__cell {
  background-color: #f0f9ff !important;
  border-left: 3px solid #409EFF;
}
</style>