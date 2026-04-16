// 全局共享数据模块 - 所有页面共享此数据，保证数据实时同步
// 单例模式，四个页面导入的都是同一个数据源，一个页面修改，所有页面自动同步

const state = {
  // 1. 客户（病人）列表
  customerList: [
    { id: 1, name: '孙瑞英', gender: '女', age: 68, phone: '13800138000', nursingLevelId: null, nursingLevel: null },
    { id: 2, name: '张桂兰', gender: '女', age: 72, phone: '13900139000', nursingLevelId: 2, nursingLevel: '二级护理' },
  ],

  // 2. 护理项目列表
  projectList: [
    { id: 1, code: 'HL001', name: '生命体征监测', price: '30元', cycle: '每日', times: 2, status: '启用', desc: '' },
    { id: 2, code: 'HL002', name: '协助翻身', price: '25元', cycle: '每日', times: 4, status: '启用', desc: '' },
    { id: 3, code: 'HL003', name: '口腔护理', price: '20元', cycle: '每日', times: 1, status: '启用', desc: '' },
    { id: 4, code: 'HL004', name: '皮肤护理', price: '20元', cycle: '每日', times: 1, status: '启用', desc: '' },
    { id: 5, code: 'HL005', name: '健康巡视', price: '10元', cycle: '每日', times: 1, status: '启用', desc: '' },
  ],

  // 3. 护理级别列表
  levelList: [
    { id: 1, name: '一级护理', status: '启用', projectIds: [1, 2] },
    { id: 2, name: '二级护理', status: '启用', projectIds: [3, 4] },
    { id: 3, name: '三级护理', status: '启用', projectIds: [5] },
  ],

  // 4. 客户的护理项目列表（客户购买的项目，独立于项目库，不影响历史）
  customerProjectList: [
    { customerId: 2, projectCode: 'HL003', projectName: '口腔护理', quantity: 1, buyDate: '2024-01-01', expireDate: '2024-04-01' },
    { customerId: 2, projectCode: 'HL004', projectName: '皮肤护理', quantity: 1, buyDate: '2024-01-01', expireDate: '2024-04-01' },
  ],

  // 5. 护理记录列表
  nursingRecords: [
    { id: 1, customerId: 1, projectCode: 'HL001', projectName: '生命体征监测', quantity: 1, nursingTime: '2024-04-10', nursingContent: '正常' },
    { id: 2, customerId: 1, projectCode: 'HL002', projectName: '协助翻身', quantity: 1, nursingTime: '2024-04-10', nursingContent: '' },
  ],

  // 6. 已移除的记录ID（逻辑删除，隐藏用）
  removedRecordIds: [],
}

// 工具函数：当项目停用/删除时，自动从所有护理级别中剔除该项目
function updateLevelProjectsAfterProjectChange(projectId) {
  state.levelList.forEach(level => {
    level.projectIds = level.projectIds.filter(id => id !== projectId)
  })
}

// 工具函数：获取今天日期
function getToday() {
  return new Date().toISOString().split('T')[0]
}

// 工具函数：获取3个月后日期
function get3MonthsLater() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

export {
  state,
  updateLevelProjectsAfterProjectChange,
  getToday,
  get3MonthsLater
}
