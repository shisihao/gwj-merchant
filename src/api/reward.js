import request from '@/utils/request'

// 列表
export function dataList(params) {
  return request.get('/home/rewards', {
    params
  })
}

// 导出
export function exportExcel(params) {
  return request.get('/home/rewards/export', {
    params
  })
}
