import request from '@/utils/request'

export async function queryProse(): Promise<any> {
  return request('/prose')
}

export type { LoginData, LoginRes, UserState } from './user'
export { login, logout, getUserInfo, getEmailCode, resetPassword, register } from './user'

export type { ApprovalItem, ApprovalListParams, ApprovalListRes } from './approval'
export { getPendingList, getDoneList, getApprovalDetail } from './approval'
