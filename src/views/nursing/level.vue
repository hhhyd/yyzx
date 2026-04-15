<template>
  <div style="max-width: 1600px; margin: 0 auto; padding: 24px; background: #f5f7fa; min-height: 100vh; box-sizing: border-box;">

    <!-- 护理级别卡片 -->
    <el-card shadow="hover" style="margin-bottom: 32px; border-radius: 12px; overflow: hidden;">
      <div slot="header" class="card-title">护理级别管理</div>

      <div style="margin-bottom:20px;">
        <el-select v-model="查询状态" style="width:160px;margin-right:10px;">
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-button class="btn-main" @click="获取护理级别列表">查询</el-button>
        <el-button class="btn-add" @click="新增级别弹窗 = true">新增级别</el-button>
      </div>

      <el-table 
        :data="护理级别列表" 
        border 
        stripe 
        style="margin-bottom:20px; border-radius: 8px; overflow: hidden;"
        :header-cell-style="tableHeaderStyle"
      >
        <el-table-column label="编号" prop="id" align="center" />
        <el-table-column label="护理级别名称" prop="name" align="center" />
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === '启用' ? 'success' : 'info'" 
              effect="light"
              style="border-radius: 4px;"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="260">
          <template #default="scope">
            <el-button type="primary" plain size="small" class="btn-sm" @click="打开修改状态(scope.row)">
              修改状态
            </el-button>
            <el-button type="primary" plain size="small" class="btn-sm" @click="打开项目配置(scope.row)">
              护理项目配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 病人信息卡片 -->
    <el-card shadow="hover" style="border-radius: 12px; overflow: hidden;">
      <div slot="header" class="card-title">病人信息管理</div>

      <div style="display:flex; justify-content:space-between; margin-bottom:16px; flex-wrap: wrap; gap:10px;">
        <div style="display:flex; gap:10px; align-items:center;">
          <el-input 
            v-model="搜索姓名" 
            placeholder="按病人姓名查询"
            style="width:260px;" 
            clearable
          />
          <el-button class="btn-main" @click="搜索病人">查询</el-button>
        </div>
        <el-button class="btn-add" @click="新增病人弹窗=true">新增病人</el-button>
      </div>

      <el-table 
        :data="分页病人列表" 
        border 
        stripe
        style="border-radius: 8px; overflow: hidden;"
        :header-cell-style="tableHeaderStyle"
      >
        <el-table-column label="编号" prop="id" align="center" />
        <el-table-column label="姓名" prop="name" align="center" />
        <el-table-column label="年龄" prop="age" align="center" />
        <el-table-column label="性别" prop="gender" align="center" />
        <el-table-column label="房间号" prop="roomNo" align="center" />
        <el-table-column label="床号" prop="bedNo" align="center" />
        <el-table-column label="所属楼房" prop="building" align="center" />
        <el-table-column label="联系电话" prop="phone" align="center" />
        <el-table-column label="护理级别" prop="level" align="center" />
        <el-table-column label="操作" align="center" width="140">
          <template #default="scope">
            <el-button class="btn-main" size="small" @click="打开日常护理(scope.row)">
              日常护理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="text-align: right; margin-top: 15px;">
        <el-pagination
          v-model:current-page="当前页码"
          v-model:page-size="每页条数"
          layout="total, sizes, prev, pager, next, jumper"
          :total="筛选后病人列表.length"
          :page-sizes="[5, 10, 20, 50]"
          background
          prev-text="上一页"
          next-text="下一页"
        >
          <template #total="{ total }">
            <span>共 {{ total }} 条记录</span>
          </template>
          <template #jumper>
            <span>跳至</span>
            <el-input
              v-model.number="当前页码"
              type="number"
              style="width:60px; margin:0 5px;"
            />
            <span>页</span>
          </template>
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增级别 -->
    <el-dialog v-model="新增级别弹窗" title="新增护理级别" center class="blue-dialog">
      <el-form :model="新增级别表单" label-width="80px">
        <el-form-item label="级别名称">
          <el-input v-model="新增级别表单.name" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="新增级别表单.status">
            <el-radio label="启用" />
            <el-radio label="停用" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="新增级别弹窗 = false">取消</el-button>
        <el-button class="btn-main" @click="保存新增级别">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- 修改状态 -->
    <el-dialog v-model="修改级别弹窗" title="修改状态" center>
      <el-form label-width="80px">
        <el-form-item label="名称">{{ 修改级别表单.name }}</el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="修改级别表单.status">
            <el-radio label="启用" />
            <el-radio label="停用" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="修改级别弹窗 = false">取消</el-button>
        <el-button class="btn-main" @click="保存修改级别">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 护理项目配置 -->
    <el-dialog v-model="项目配置弹窗" title="护理项目配置" width="900px" center>
      <div style="margin-bottom:10px; font-weight:bold; color:#1890ff;">当前级别：{{ 当前级别?.name }}</div>
      <div style="display: flex;gap:20px; flex-wrap: wrap;">
        <div style="flex:1; min-width:300px;">
          <h3 style="color:#add8e6; font-size:15px;">已配置护理项目</h3>
          <el-table :data="已配置项目列表" border height="400" :header-cell-style="tableHeaderStyle">
            <el-table-column label="项目名" prop="name" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="danger" link size="small" @click="移除项目(scope.row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="flex:1; min-width:300px;">
          <h3 style="color:#add8e6; font-size:15px;">可添加护理项目（启用）</h3>
          <el-table :data="可添加项目列表" border height="400" :header-cell-style="tableHeaderStyle">
            <el-table-column label="项目名" prop="name" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button class="text-blue-btn" link size="small" @click="添加项目(scope.row)">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 新增病人 -->
    <el-dialog v-model="新增病人弹窗" title="新增病人" center>
      <el-form :model="新增病人表单" label-width="80px">
        <el-form-item label="姓名"><el-input v-model="新增病人表单.name" /></el-form-item>
        <el-form-item label="年龄"><el-input v-model.number="新增病人表单.age" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="新增病人表单.gender"><el-radio label="男"/><el-radio label="女"/></el-radio-group>
        </el-form-item>
        <el-form-item label="房间号"><el-input v-model="新增病人表单.roomNo" /></el-form-item>
        <el-form-item label="床号"><el-input v-model="新增病人表单.bedNo" /></el-form-item>
        <el-form-item label="楼房"><el-input v-model="新增病人表单.building" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="新增病人表单.phone" /></el-form-item>
        <el-form-item label="护理级别">
          <el-select v-model="新增病人表单.level">
            <el-option label="一级护理" value="一级护理"/>
            <el-option label="二级护理" value="二级护理"/>
            <el-option label="三级护理" value="三级护理"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="新增病人弹窗 = false">取消</el-button>
        <el-button class="btn-main" @click="保存新增病人">保存</el-button>
      </template>
    </el-dialog>

    <!-- 日常护理弹窗 -->
    <el-dialog v-model="日常护理弹窗" title="日常护理管理" width="900px" center>
      <div v-if="当前病人">
        <el-card shadow="hover" style="margin-bottom:20px; border-radius:8px;">
          <div slot="header" style="font-weight:bold; color:#add8e6;">病人基本信息</div>
          <el-form :model="当前病人" label-width="80px" inline>
            <el-form-item label="姓名"><el-input v-model="当前病人.name" /></el-form-item>
            <el-form-item label="年龄"><el-input v-model.number="当前病人.age" /></el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="当前病人.gender">
                <el-radio label="男"/><el-radio label="女"/>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="护理级别">
              <el-select v-model="当前病人.level">
                <el-option label="一级护理" value="一级护理"/>
                <el-option label="二级护理" value="二级护理"/>
                <el-option label="三级护理" value="三级护理"/>
              </el-select>
            </el-form-item>
          </el-form>
          <div style="margin-top:10px; display:flex; gap:10px;">
            <el-button class="btn-main" size="small" @click="保存病人信息">保存病人信息</el-button>
            <el-button type="danger" plain size="small" @click="确认删除病人">删除该病人</el-button>
          </div>
        </el-card>

        <div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;">
          <div style="font-weight:bold; font-size:16px; color:#333;">护理记录</div>
          <el-button class="btn-add" size="small" @click="新增护理记录">新增护理记录</el-button>
        </div>

        <el-table 
          :data="当前病人.护理记录" 
          border 
          stripe
          :header-cell-style="tableHeaderStyle"
        >
          <el-table-column label="护理项目" prop="itemName" />
          <el-table-column label="记录时间" prop="recordTime" />
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button type="primary" plain size="mini" @click="编辑护理记录(scope.row)">编辑</el-button>
              <el-button type="danger" plain size="mini" @click="删除护理记录(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 护理项目 新增/编辑 -->
    <el-dialog v-model="护理记录表单弹窗" title="护理记录" center>
      <el-form :model="护理记录表单" label-width="80px">
        <el-form-item label="护理项目"><el-input v-model="护理记录表单.itemName" /></el-form-item>
        <el-form-item label="记录时间">
          <el-date-picker v-model="护理记录表单.recordTime" type="date" placeholder="选择日期" style="width:100%;"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="护理记录表单弹窗 = false">取消</el-button>
        <el-button class="btn-main" @click="保存护理记录">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'NursingLevel',
  data() {
    return {
      查询状态: "启用",
      护理级别列表: [],
      新增级别弹窗: false,
      修改级别弹窗: false,
      项目配置弹窗: false,
      当前级别: null,
      新增级别表单: { name: "", status: "启用" },
      修改级别表单: { id: null, name: "", status: "" },
      已配置项目列表: [],
      项目列表: [
        { id: 1, name: "测量血压", status: "启用" },
        { id: 2, name: "协助翻身", status: "启用" },
        { id: 3, name: "口腔护理", status: "启用" },
        { id: 4, name: "喂饭", status: "停用" },
      ],

      搜索姓名: "",
      新增病人弹窗: false,
      新增病人表单: {
        name: "", age: "", gender: "女", roomNo: "", bedNo: "", building: "", phone: "", level: ""
      },

      原始病人列表: [
        {
          id: 1, name: "孙瑞英", age: 68, gender: "女", roomNo: "2012", bedNo: "2012-1",
          building: "606", phone: "18167564213", level: "二级护理",
          护理记录: [{ itemName: "测量血压", recordTime: "2025-01-01" }]
        },
        {
          id: 2, name: "张帆", age: 77, gender: "女", roomNo: "1014", bedNo: "1014-1",
          building: "606", phone: "17745189064", level: "",
          护理记录: []
        }
      ],

      当前页码: 1,
      每页条数: 5,

      日常护理弹窗: false,
      当前病人: null,
      护理记录表单弹窗: false,
      护理记录表单: { itemName: "", recordTime: "" },
      编辑记录索引: -1,

      // 表头统一主题色
      tableHeaderStyle: {
        background: '#add8e6',
        color: '#fff',
        fontWeight: '500'
      }
    };
  },
  computed: {
    可添加项目列表() {
      return this.项目列表.filter(p =>
        p.status === "启用" && !this.已配置项目列表.some(c => c.id === p.id)
      );
    },
    筛选后病人列表() {
      return this.原始病人列表.filter(item =>
        item.name.includes(this.搜索姓名)
      );
    },
    分页病人列表() {
      const 开始位置 = (this.当前页码 - 1) * this.每页条数;
      const 结束位置 = 开始位置 + this.每页条数;
      return this.筛选后病人列表.slice(开始位置, 结束位置);
    }
  },
  mounted() {
    this.获取护理级别列表();
  },
  methods: {
    获取护理级别列表() {
      const 模拟数据 = [
        { id: 1, name: "一级护理", status: "启用" },
        { id: 2, name: "二级护理", status: "启用" },
        { id: 3, name: "三级护理", status: "停用" },
      ];
      this.护理级别列表 = 模拟数据.filter(item => !this.查询状态 || item.status === this.查询状态);
    },
    保存新增级别() {
      if (!this.新增级别表单.name) {
        this.$message.warning("请输入级别名称");
        return;
      }
      const 新编号 = Math.max(...this.护理级别列表.map(i => i.id), 0) + 1;
      this.护理级别列表.push({ 
        id: 新编号, 
        name: this.新增级别表单.name, 
        status: this.新增级别表单.status 
      });
      this.新增级别弹窗 = false;
      this.新增级别表单 = { name: "", status: "启用" };
      this.$message.success("新增成功");
    },
    打开修改状态(row) {
      this.修改级别表单 = { ...row };
      this.修改级别弹窗 = true;
    },
    保存修改级别() {
      const 项目 = this.护理级别列表.find(i => i.id === this.修改级别表单.id);
      if (项目) 项目.status = this.修改级别表单.status;
      this.修改级别弹窗 = false;
      this.$message.success("修改成功");
    },
    打开项目配置(row) {
      this.当前级别 = row;
      this.项目配置弹窗 = true;
      this.已配置项目列表 = row.id === 2 ? [{...this.项目列表[0]}] : [];
    },
    添加项目(row) {
      this.已配置项目列表.push({...row});
    },
    移除项目(row) {
      this.已配置项目列表 = this.已配置项目列表.filter(i => i.id !== row.id);
    },
    搜索病人() {
      this.当前页码 = 1;
    },
    保存新增病人() {
      if (!this.新增病人表单.name) {
        this.$message.warning("请输入病人姓名");
        return;
      }
      const 新编号 = Math.max(...this.原始病人列表.map(i => i.id), 0) + 1;
      this.原始病人列表.push({
        ...this.新增病人表单,
        id: 新编号,
        护理记录: []
      });
      this.搜索病人();
      this.新增病人弹窗 = false;
      this.新增病人表单 = {
        name: "", age: "", gender: "女", roomNo: "", bedNo: "", building: "", phone: "", level: ""
      };
      this.$message.success("新增病人成功");
    },
    打开日常护理(row) {
      this.当前病人 = JSON.parse(JSON.stringify(row));
      this.日常护理弹窗 = true;
    },
    保存病人信息() {
      const 索引 = this.原始病人列表.findIndex(i => i.id === this.当前病人.id);
      if (索引 !== -1) {
        this.原始病人列表[索引] = JSON.parse(JSON.stringify(this.当前病人));
        this.搜索病人();
        this.$message.success("保存病人信息成功");
      }
    },
    确认删除病人() {
      this.$confirm("此操作将永久删除该病人信息，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.原始病人列表 = this.原始病人列表.filter(i => i.id !== this.当前病人.id);
        this.日常护理弹窗 = false;
        this.搜索病人();
        this.$message.success("删除成功");
      });
    },
    新增护理记录() {
      this.护理记录表单 = { itemName: "", recordTime: "" };
      this.编辑记录索引 = -1;
      this.护理记录表单弹窗 = true;
    },
    编辑护理记录(row) {
      this.护理记录表单 = { ...row };
      this.编辑记录索引 = this.当前病人.护理记录.findIndex(i => i === row);
      this.护理记录表单弹窗 = true;
    },
    保存护理记录() {
      if (!this.护理记录表单.itemName) {
        this.$message.warning("请输入护理项目");
        return;
      }
      if (!this.护理记录表单.recordTime) {
        this.$message.warning("请选择记录时间");
        return;
      }
      if (this.编辑记录索引 === -1) {
        this.当前病人.护理记录.push({ ...this.护理记录表单 });
      } else {
        this.当前病人.护理记录[this.编辑记录索引] = { ...this.护理记录表单 };
      }
      this.护理记录表单弹窗 = false;
    },
    删除护理记录(row) {
      this.$confirm("确定删除该护理记录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.当前病人.护理记录 = this.当前病人.护理记录.filter(i => i !== row);
        this.$message.success("删除成功");
      });
    }
  }
};
</script>

<style scoped>
.card-title {
  font-weight: bold;
  font-size: 16px;
  color: black;
}

/* 主题蓝色按钮 */
.btn-main {
  background: #add8e6 !important;
  border-color: #add8e6 !important;
  color: #fff !important;
  border-radius: 6px;
}
.btn-add {
  background: #67c23a !important;
  border-color: #67c23a !important;
  color: #fff !important;
  border-radius: 6px;
}
.btn-sm {
  background-color: #409EFF !important;
  border-radius: 4px;
  border-color: #409EFF !important;
  color: #fff !important;
}
.text-blue-btn {
  color: #add8e6 !important;
}

/* 深度选择器修复 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}
:deep(.el-table th.el-table__cell) {
  background: #add8e6 !important;
  color: #fff !important;
  font-weight: 500;
}
:deep(.el-dialog) {
  border-radius: 12px;
}
:deep(.el-card) {
  border-radius: 12px;
}
:deep(.el-card__header) {
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
</style>