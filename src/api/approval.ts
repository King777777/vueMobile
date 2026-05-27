import request from '@/utils/request'
import type { ApiResult as BaseApiResult } from './user'

export type ApiResult<T> = BaseApiResult<T>

export interface ApprovalItem {
  id: number
  title: string
  initiator: string
  startTime: string
  receiveTime: string
  processor: string
  status: string
  summary: string
}

export interface ApprovalListParams {
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface ApprovalListRes {
  list: ApprovalItem[]
  total: number
}

export function getPendingList(params: ApprovalListParams) {
  return request.get<ApiResult<ApprovalListRes>>('/approval/pending', { params })
}

export function getDoneList(params: ApprovalListParams) {
  return request.get<ApiResult<ApprovalListRes>>('/approval/done', { params })
}

export function getApprovalDetail(id: number) {
  return request.get<ApiResult<ApprovalItem>>(`/approval/detail/${id}`)
}
