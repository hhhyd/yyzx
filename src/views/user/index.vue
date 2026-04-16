<template>
  <div class="user-management">
    <div class="main-content">
      <div class="search-add">
        <el-input 
          v-model="searchName" 
          placeholder="请输入用户姓名" 
          style="width: 200px;" 
          clearable
          @clear="resetSearch"
          @keyup.enter="queryUsers"
        />
        <el-select
          v-model="searchRole"
          placeholder="选择角色"
          clearable
          style="width: 120px; margin-left: 10px;"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
        <el-button type="primary" @click="queryUsers">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" @click="openAddDialog" style="margin-left: auto;">
          <i class="el-icon-plus"></i> 添加用户
        </el-button>
      </div>

      <!-- 用户列表表格 -->
      <div class="table-container">
        <el-table :data="displayUsers" style="width: 100%" border stripe>
          <el-table-column prop="id" label="序号" width="80" align="center" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="真实姓名" width="120" />
          <el-table-column prop="phone" label="电话" width="150" />
          <el-table-column prop="gender" label="性别" width="80" align="center" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="roleName" label="角色" width="120">
            <template #default="{ row }">
              <el-tag size="small" :type="getRoleTagType(row.roleId)">
                {{ row.roleName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="员工类型" width="120" />
          
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="warning" 
                @click="editUser(row)"
                style="margin-right: 8px;"
              >
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="resetPassword(row)"
              >
                <i class="el-icon-refresh"></i> 重置密码
              </el-button>
              <el-dropdown trigger="click" style="margin-left: 8px;">
                
      
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="margin-top: 20px;"
        />
      </div>

      <!-- 添加/编辑模态框 -->
      <el-dialog
        :title="form.id ? '编辑用户' : '添加用户'"
        v-model="dialogVisible"
        width="600px"
        @close="resetForm"
        :close-on-click-modal="false"
      >
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="formRef" 
          label-width="100px"
          label-position="left"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名：" prop="username">
                <el-input 
                  v-model="form.username" 
                  placeholder="请输入用户名"
                  :disabled="!!form.id"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名：" prop="name">
                <el-input v-model="form.name" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号：" prop="phone">
                <el-input 
                  v-model="form.phone" 
                  placeholder="请输入手机号"
                  maxlength="11"
                  show-word-limit
                  @blur="handlePhoneBlur"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别：" prop="gender">
                <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%;">
                  <el-option label="男" value="男" />
                  <el-option label="女" value="女" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱：" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" type="email" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="员工类型：" prop="type">
                <el-select v-model="form.type" placeholder="请选择员工类型" style="width: 100%;">
                  <el-option label="护工" value="护工" />
                  <el-option label="管理员" value="管理员" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="角色：" prop="roleId">
                <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%;">
                  <el-option
                    v-for="role in roleList"
                    :key="role.id"
                    :label="role.name"
                    :value="role.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            
          </el-row>

          <el-form-item label="密码：" prop="password">
            <el-input 
              v-model="form.password" 
              :disabled="true" 
              placeholder="自动生成手机号后6位"
            >
              <template #append>
                <el-button @click="copyPassword" :disabled="!form.password">
                  复制
                </el-button>
              </template>
            </el-input>
            <div v-if="form.password" style="color: #67C23A; font-size: 12px; margin-top: 5px;">
              <i class="el-icon-info"></i> 密码已自动生成
            </div>
          </el-form-item>

          <el-form-item label="备注：" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（可选）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveUser" :loading="saveLoading">
              保存
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 重置密码确认对话框 -->
      <el-dialog
        v-model="resetPasswordDialogVisible"
        title="重置密码"
        width="400px"
      >
        <div style="text-align: center;">
          <el-icon size="50" color="#E6A23C"><Warning /></el-icon>
          <p style="margin: 20px 0; font-size: 16px; color: #606266;">
            确定要重置用户 <strong>{{ resetPasswordUser?.name }}</strong> 的密码吗？
          </p>
          <p style="color: #F56C6C; font-size: 14px;">
            新密码：{{ resetPasswordDefault }}
          </p>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
            <el-button type="warning" @click="confirmResetPassword">确定重置</el-button>
          </span>
        </template>
      </el-dialog>

    
    </div>
  </div>
</template>

<script>
import { Warning } from '@element-plus/icons-vue'

export default {
  name: 'UserList',
  components: {
    Warning
  },
  data() {
    // 手机号验证规则
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入手机号'))
      }
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(value)) {
        return callback(new Error('请输入正确的手机号'))
      }
      callback()
    }

    // 邮箱验证规则
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailReg.test(value)) {
        return callback(new Error('请输入正确的邮箱格式'))
      }
      callback()
    }

    return {
      activeTab: 'manage',
      searchName: '',
      searchRole: '',
      users: [],
      roleList: [
        { id: 1, name: '管理员', type: 'danger' },
        { id: 3, name: '护工', type: 'success' },
      ],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      saveLoading: false,
      resetPasswordDialogVisible: false,
      resetPasswordUser: null,
      resetPasswordDefault: '',
      assignRoleDialogVisible: false,
      assigningUser: null,
      selectedRoleId: null,
      
      form: {
        id: null,
        username: '',
        name: '',
        phone: '',
        gender: '男',
        email: '',
        type: '护工',
        roleId: null,
        password: '',
        status: 'active',
        remark: ''
      },
      
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: validatePhone, trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择员工类型', trigger: 'change' }
        ],
        roleId: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 筛选后的用户列表
    filteredUsers() {
      let users = this.users
      
      // 按姓名筛选
      if (this.searchName.trim()) {
        const keyword = this.searchName.trim().toLowerCase()
        users = users.filter(user => 
          user.name.toLowerCase().includes(keyword) ||
          user.username.toLowerCase().includes(keyword)
        )
      }
      
      // 按角色筛选
      if (this.searchRole) {
        users = users.filter(user => user.roleId === this.searchRole)
      }
      
      return users
    },
    
    // 当前页显示的用户
    displayUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredUsers.slice(start, end)
    }
  },
  created() {
    this.loadUsers()
  },
  methods: {
    // 获取角色标签类型
    getRoleTagType(roleId) {
      const role = this.roleList.find(r => r.id === roleId)
      return role ? role.type : 'info'
    },
    
    // 标签移除
    handleTabRemove(tabName) {
      console.log('移除标签:', tabName)
    },
    
    // 加载用户数据
    loadUsers() {
      // 模拟从后端获取用户列表
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          name: '管理员',
          phone: '13517178987',
          gender: '女',
          email: 'admin@s.cq',
          type: '管理员',
          roleId: 1,
          roleName: '管理员',
          status: 'active',
          createTime: '2024-01-01 10:00:00',
          remark: '系统管理员账号'
        },
        {
          id: 2,
          username: 'wuwei',
          name: '吴伟',
          phone: '13517178987',
          gender: '女',
          email: 'wuwei@s.cq',
          type: '护工',
          roleId: 3,
          roleName: '护工',
          status: 'active',
          createTime: '2024-01-15 14:30:00',
          remark: ''
        },
      ]
      this.users = mockUsers
      this.total = mockUsers.length
    },
    
    // 查询用户
    queryUsers() {
      this.currentPage = 1
    },
    
    // 重置搜索
    resetSearch() {
      this.searchName = ''
      this.searchRole = ''
      this.currentPage = 1
    },
    
    // 打开添加对话框
    openAddDialog() {
      this.resetForm()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    
    // 编辑用户
   editUser(row) {
  this.form = {
    id: row.id,
    username: row.username,
    name: row.name,
    phone: row.phone,
    gender: row.gender,
    email: row.email,
    type: row.type,  // 确保获取员工类型
    roleId: row.roleId,  // 确保获取角色ID
    password: '', // 编辑时不显示密码
    status: row.status,
    remark: row.remark || ''
  }
  this.dialogVisible = true
},
    
    // 移除用户
    removeUser(id) {
      this.$confirm('确定要删除该用户吗？删除后不可恢复！', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            // 模拟API请求
            setTimeout(() => {
              this.users = this.users.filter(u => u.id !== id)
              this.$message.success('用户删除成功')
              instance.confirmButtonLoading = false
              done()
            }, 800)
          } else {
            done()
          }
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.form = {
        id: null,
        username: '',
        name: '',
        phone: '',
        gender: '男',
        email: '',
        type: '护工',
        roleId: null,
        password: '',
        status: 'active',
        remark: ''
      }
    },
    
    // 手机号失去焦点时生成密码
    handlePhoneBlur() {
      if (this.form.phone && this.form.phone.length >= 6) {
        this.form.password = this.form.phone.slice(-6)
      }
    },
    
    
    // 保存用户
    saveUser() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.saveLoading = true
          
          try {
            // 模拟API请求
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            if (this.form.id) {
              // 编辑用户
              const index = this.users.findIndex(u => u.id === this.form.id)
              if (index !== -1) {
                const role = this.roleList.find(r => r.id === this.form.roleId)
                this.users[index] = {
                  ...this.users[index],
                  ...this.form,
                  roleName: role ? role.name : '未知'
                }
                this.$message.success('用户信息更新成功')
              }
            } else {
              // 新增用户
              const role = this.roleList.find(r => r.id === this.form.roleId)
              const newUser = {
                id: Date.now(),
                ...this.form,
                roleName: role ? role.name : '未知',
                createTime: new Date().toLocaleString()
              }
              this.users.unshift(newUser)
              this.total = this.users.length
              this.$message.success('用户添加成功')
            }
            
            this.dialogVisible = false
          } catch (error) {
            console.error('保存失败:', error)
            this.$message.error('保存失败，请重试')
          } finally {
            this.saveLoading = false
          }
        }
      })
    },
    
    // 重置密码
    resetPassword(user) {
      this.resetPasswordUser = user
      this.resetPasswordDefault = user.phone.slice(-6)
      this.resetPasswordDialogVisible = true
    },
    
    // 确认重置密码
    confirmResetPassword() {
      this.$message.success(`用户 ${this.resetPasswordUser.name} 的密码已重置为：${this.resetPasswordDefault}`)
      this.resetPasswordDialogVisible = false
    },
    
    
    // 分配角色
    assignRole(user) {
      this.assigningUser = user
      this.selectedRoleId = user.roleId
      this.assignRoleDialogVisible = true
    },
    
    
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.user-management {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #304156, #263445);
  color: white;
  padding: 20px 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.sidebar .logo {
  text-align: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.sidebar .logo h3 {
  color: white;
  font-size: 18px;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar .menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar .menu-item {
  padding: 12px 20px;
  font-weight: bold;
  color: rgba(255,255,255,0.8);
  border-left: 4px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.sidebar .menu-item:hover {
  background-color: rgba(255,255,255,0.1);
  color: white;
}

.sidebar .submenu {
  margin-left: 0;
  list-style: none;
  padding: 0;
  background-color: rgba(0,0,0,0.2);
}

.sidebar .submenu li {
  margin: 0;
}

.sidebar .submenu a {
  text-decoration: none;
  color: rgba(255,255,255,0.7);
  display: block;
  padding: 10px 20px 10px 40px;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.sidebar .submenu a:hover {
  background-color: rgba(255,255,255,0.1);
  color: white;
  border-left: 4px solid #409EFF;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
}

.tabs {
  margin-bottom: 20px;
}

.search-add {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.table-container {
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

/* 自定义样式 */
:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

/* 对话框按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>