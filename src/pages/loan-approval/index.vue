<script setup lang="ts">
import { getDoneList, getPendingList } from '@/api'
import type { ApprovalItem } from '@/api'

const activeTab = ref(0)
const keyword = ref('')
const loading = ref(false)
const pendingList = ref<ApprovalItem[]>([])
const doneList = ref<ApprovalItem[]>([])
const showCalendar = ref(false)
const dateRange = ref<[string, string]>(['', ''])

const dateRangeText = computed(() => {
  if (dateRange.value[0] && dateRange.value[1])
    return `${dateRange.value[0]} ~ ${dateRange.value[1]}`
  return '日期范围'
})

function getStatusClass(status: string) {
  switch (status) {
    case '审批中':
      return 'status-approving'
    case '已通过':
      return 'status-approved'
    case '已拒绝':
      return 'status-rejected'
    default:
      return ''
  }
}

function buildParams() {
  const params: { keyword?: string, startDate?: string, endDate?: string } = {}
  if (keyword.value)
    params.keyword = keyword.value
  if (dateRange.value[0])
    params.startDate = dateRange.value[0]
  if (dateRange.value[1])
    params.endDate = dateRange.value[1]
  return params
}

function loadPendingList() {
  loading.value = true
  getPendingList(buildParams())
    .then(({ code, data }) => {
      if (code === 0)
        pendingList.value = data.list
    })
    .finally(() => {
      loading.value = false
    })
}

function loadDoneList() {
  loading.value = true
  getDoneList(buildParams())
    .then(({ code, data }) => {
      if (code === 0)
        doneList.value = data.list
    })
    .finally(() => {
      loading.value = false
    })
}

function onSearch() {
  if (activeTab.value === 0)
    loadPendingList()
  else
    loadDoneList()
}

function onClear() {
  keyword.value = ''
  onSearch()
}

function onDateRangeClick() {
  showCalendar.value = true
}

function onCalendarConfirm(values: [Date, Date]) {
  const [start, end] = values
  dateRange.value = [formatDate(start), formatDate(end)]
  showCalendar.value = false
  onSearch()
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

function onItemClick(item: ApprovalItem) {
  console.warn('点击审批项:', item)
}

onMounted(() => {
  loadPendingList()
})

watch(activeTab, (newVal) => {
  if (newVal === 0 && pendingList.value.length === 0)
    loadPendingList()
  else if (newVal === 1 && doneList.value.length === 0)
    loadDoneList()
})
</script>

<template>
  <div class="approval-page">
    <VanTabs v-model:active="activeTab">
      <VanTab title="待办任务">
        <div class="search-bar">
          <VanField
            v-model="keyword"
            placeholder="请输入发起人姓名、审批流程名称"
            clearable
            class="search-field"
            @clear="onClear"
          />
          <VanButton type="primary" size="small" class="search-btn" @click="onSearch">
            搜索
          </VanButton>
          <VanButton plain size="small" class="date-btn" @click="onDateRangeClick">
            {{ dateRangeText }}
          </VanButton>
        </div>

        <div class="list-area">
          <VanPullRefresh v-model="loading" @refresh="loadPendingList">
            <div v-if="pendingList.length > 0" class="list-container">
              <div
                v-for="item in pendingList"
                :key="item.id"
                class="card-item"
                @click="onItemClick(item)"
              >
                <div class="card-header">
                  <span class="card-title">{{ item.title }}</span>
                  <VanIcon name="arrow" />
                </div>
                <div class="card-body">
                  <div class="info-item">
                    <span class="info-label">发起人：</span>
                    <span class="info-value">{{ item.initiator }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">发起时间：</span>
                    <span class="info-value">{{ item.startTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">接收时间：</span>
                    <span class="info-value">{{ item.receiveTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">当前处理人：</span>
                    <span class="info-value">{{ item.processor }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">状态：</span>
                    <span class="info-value" :class="getStatusClass(item.status)">{{ item.status }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">摘要：</span>
                    <span class="info-value">{{ item.summary }}</span>
                  </div>
                </div>
              </div>
            </div>
            <VanEmpty v-else description="暂无待办任务" />
          </VanPullRefresh>
        </div>
      </VanTab>

      <VanTab title="已办任务">
        <div class="search-bar">
          <VanField
            v-model="keyword"
            placeholder="请输入发起人姓名、审批流程名称"
            clearable
            class="search-field"
            @clear="onClear"
          />
          <VanButton type="primary" size="small" class="search-btn" @click="onSearch">
            搜索
          </VanButton>
          <VanButton plain size="small" class="date-btn" @click="onDateRangeClick">
            {{ dateRangeText }}
          </VanButton>
        </div>

        <div class="list-area">
          <VanPullRefresh v-model="loading" @refresh="loadDoneList">
            <div v-if="doneList.length > 0" class="list-container">
              <div
                v-for="item in doneList"
                :key="item.id"
                class="card-item"
                @click="onItemClick(item)"
              >
                <div class="card-header">
                  <span class="card-title">{{ item.title }}</span>
                  <VanIcon name="arrow" />
                </div>
                <div class="card-body">
                  <div class="info-item">
                    <span class="info-label">发起人：</span>
                    <span class="info-value">{{ item.initiator }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">发起时间：</span>
                    <span class="info-value">{{ item.startTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">接收时间：</span>
                    <span class="info-value">{{ item.receiveTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">当前处理人：</span>
                    <span class="info-value">{{ item.processor }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">状态：</span>
                    <span class="info-value" :class="getStatusClass(item.status)">{{ item.status }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">摘要：</span>
                    <span class="info-value">{{ item.summary }}</span>
                  </div>
                </div>
              </div>
            </div>
            <VanEmpty v-else description="暂无已办任务" />
          </VanPullRefresh>
        </div>
      </VanTab>
    </VanTabs>

    <VanCalendar
      v-model:show="showCalendar"
      type="range"
      :min-date="new Date(2020, 0, 1)"
      :max-date="new Date(2030, 11, 31)"
      @confirm="onCalendarConfirm"
    />
  </div>
</template>

<style scoped lang="less">
.approval-page {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: #f5f6f7;
  padding-top: 2px;
}

:deep(.van-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.van-tabs__wrap) {
  padding-top: 0;
}

:deep(.van-tabs__nav) {
  padding-top: 0;
  margin-top: 0;
}

:deep(.van-tabs__content) {
  flex: 1;
  min-height: 0;
}

:deep(.van-tab__panel) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--van-background-color-light);
  flex-shrink: 0;

  .search-field {
    flex: 1;
    padding: 0;
    background-color: var(--van-background);
    border-radius: 4px;
  }

  .search-btn {
    flex-shrink: 0;
  }

  .date-btn {
    flex-shrink: 0;
    height: 32px;
    font-size: 13px;
  }
}

.list-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.list-container {
  padding: 0 16px 16px;
}

.card-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  &:last-child {
    margin-bottom: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--van-border-color);
  margin-bottom: 12px;

  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--van-text-color);
  }
}

.card-body {
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: var(--van-text-color-2);
      flex-shrink: 0;
      min-width: 80px;
    }

    .info-value {
      color: var(--van-text-color);
      flex: 1;

      &.status-approving {
        color: var(--van-primary-color);
        font-weight: 500;
      }

      &.status-approved {
        color: var(--van-success-color);
        font-weight: 500;
      }

      &.status-rejected {
        color: var(--van-danger-color);
        font-weight: 500;
      }
    }
  }
}
</style>

<route lang="json5">
{
  name: 'LoanApproval'
}
</route>
