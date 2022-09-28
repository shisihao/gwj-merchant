import request from '@/utils/request'

// 列表
export function dataList(params) {
  return request.get('/home/withdrawal', {
    params
  })
}

// 审核通过
export function statusPass(id) {
  return request.put(`/home/withdrawal/apply/${id}`)
}

