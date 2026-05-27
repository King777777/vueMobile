import { defineMock } from 'vite-plugin-mock-dev-server'

const pendingList = [
  {
    id: 1,
    title: '经销商准入审核',
    initiator: '张大大',
    startTime: '2024.12.12 12:23:23',
    receiveTime: '2024.12.23 12:12:12',
    processor: '赵丽颖',
    status: '审批中',
    summary: '商户名称111',
  },
  {
    id: 2,
    title: '产品准入审核（非组合产品）',
    initiator: '张大大',
    startTime: '2024.12.12 12:23:23',
    receiveTime: '2024.12.23 12:12:12',
    processor: '赵丽颖',
    status: '审批中',
    summary: '产品名称111',
  },
  {
    id: 3,
    title: '产品准入审核（组合产品）',
    initiator: '张大大',
    startTime: '2024.12.12 12:23:23',
    receiveTime: '2024.12.23 12:12:12',
    processor: '赵丽颖',
    status: '审批中',
    summary: '产品名称222',
  },
]

const doneList = [
  {
    id: 4,
    title: '经销商准入审核',
    initiator: '王小明',
    startTime: '2024.11.10 09:15:30',
    receiveTime: '2024.11.11 10:20:45',
    processor: '赵丽颖',
    status: '已通过',
    summary: '商户名称测试',
  },
  {
    id: 5,
    title: '产品准入审核（非组合产品）',
    initiator: '李大强',
    startTime: '2024.11.05 14:30:00',
    receiveTime: '2024.11.06 09:15:22',
    processor: '赵丽颖',
    status: '已拒绝',
    summary: '产品名称333',
  },
]

export default defineMock([
  {
    url: '/api/approval/pending',
    delay: 300,
    body: () => {
      return {
        code: 0,
        data: {
          list: pendingList,
          total: pendingList.length,
        },
        msg: 'success',
      }
    },
  },
  {
    url: '/api/approval/done',
    delay: 300,
    body: () => {
      return {
        code: 0,
        data: {
          list: doneList,
          total: doneList.length,
        },
        msg: 'success',
      }
    },
  },
  {
    url: '/api/approval/detail/:id',
    delay: 200,
    body: ({ params }) => {
      const allList = [...pendingList, ...doneList]
      const item = allList.find(i => i.id === Number(params.id))
      return {
        code: 0,
        data: item || null,
        msg: 'success',
      }
    },
  },
])
