export const localMap = {
  /* login: require('login/index').default // 同步的方式
  login:()=> import('login/index')      // 异步的方式 */
  reward: () => import('@/views/reward/index'), // 奖励列表
  user: () => import('@/views/user/index'), // 用户列表
  withdrawal: () => import('@/views/withdrawal/index'), // 提现申请
  exportCenter: () => import('@/views/exportCenter/index') // 导出中心管理
}
