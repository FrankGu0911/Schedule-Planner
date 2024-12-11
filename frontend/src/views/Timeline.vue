<template>
  <MainLayout>
    <div class="w-full lg:max-w-[calc(100vw-20rem)] lg:mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <!-- 顶部控制栏 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
          <!-- 第一组：今天按钮和视图切换 -->
          <div class="flex justify-between items-center sm:w-auto">
            <button
              @click="today"
              class="px-3 py-1.5 text-sm font-medium rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40"
            >
              今天
            </button>
            <div class="flex items-center space-x-2 sm:ml-4">
              <button
                @click="viewMode = 'month'"
                class="px-3 py-1.5 text-sm font-medium rounded-l-md"
                :class="viewMode === 'month' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
              >
                月
              </button>
              <button
                @click="viewMode = 'week'"
                class="px-3 py-1.5 text-sm font-medium rounded-r-md"
                :class="viewMode === 'week' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
              >
                周
              </button>
            </div>
          </div>
          
          <!-- 第二组：月份/周切换和标题 -->
          <div class="flex items-center justify-center space-x-4 sm:ml-4">
            <button
              @click="previousPeriod"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <Icon icon="ph:caret-left-bold" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white min-w-[120px] text-center">
              {{ currentPeriodLabel }}
            </h2>
            <button
              @click="nextPeriod"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <Icon icon="ph:caret-right-bold" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <!-- 日历主体 -->
        <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          <!-- 星期标题 -->
          <template v-for="day in weekDays" :key="day">
            <div class="px-2 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
              {{ day }}
            </div>
          </template>
        </div>

        <!-- 日期网格 -->
        <div class="grid grid-cols-7 min-h-[600px]">
          <template v-for="date in displayDates" :key="date.toISOString()">
            <div
              class="relative min-h-[100px] border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer"
              :class="[
                isToday(date) ? 'bg-primary-50/30 dark:bg-primary-900/10' : '',
                !isSameMonth(date, currentDate) ? 'bg-gray-50/50 dark:bg-gray-900/30' : '',
                selectedDate && isSameDay(date, selectedDate) ? 'bg-primary-100 dark:bg-primary-900/30' : ''
              ]"
              @click="selectedDate = date"
            >
              <!-- 日期数字 -->
              <div
                class="absolute top-1 left-2 w-6 h-6 flex items-center justify-center text-sm rounded-full"
                :class="[
                  isToday(date) ? 'bg-primary-500 text-white' : 'text-gray-700 dark:text-gray-300',
                ]"
              >
                {{ format(date, 'd') }}
              </div>

              <!-- 任务列表 -->
              <div class="task-container">
                <template v-for="todo in getTodosForDate(date)" :key="todo.id">
                  <div
                    class="task-item"
                    :class="[
                      getDurationClass(todo),
                      todo.completed ? 'opacity-60' : ''
                    ]"
                  >
                    <!-- 任务内容 -->
                    <div
                      class="h-5 flex items-center space-x-1 rounded overflow-hidden"
                      :class="[getTaskColor(todo).bg]"
                    >
                      <div class="w-1 h-full flex-shrink-0"
                        :class="[getTaskColor(todo).dot]"
                      ></div>
                      <span class="text-xs truncate flex-grow px-1"
                        :class="[getTaskColor(todo).text]"
                      >
                        {{ todo.title }}
                        <span v-if="todo.isEndDay" class="ml-1 opacity-75">(结束)</span>
                        <span v-if="todo.isSevenDayBefore" class="ml-1 opacity-75">(还有7天)</span>
                      </span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 日期详情对话框 -->
    <TransitionRoot appear :show="!!selectedDate" as="template">
      <Dialog 
        as="div" 
        @close="closeDialog" 
        class="relative z-50"
        :open="!!selectedDate"
      >
        <TransitionChild
          as="template"
          enter="duration-150 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-150 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-150 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div class="flex items-center justify-between mb-4">
                  <DialogTitle class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ format(selectedDate, 'yyyy年M月d日', { locale: zhCN }) }}
                  </DialogTitle>
                  <button
                    @click="selectedDate = null"
                    class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon icon="ph:x-bold" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <div class="space-y-3">
                  <template v-for="todo in getTodosForDate(selectedDate)" :key="todo.id">
                    <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                          <div class="w-2 h-2 rounded-full"
                            :class="[
                              todo.completed ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-500 dark:bg-blue-400'
                            ]"
                          ></div>
                          <span class="font-medium text-gray-900 dark:text-white">{{ todo.title }}</span>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                          {{ format(toLocalTime(todo.start_time), 'HH:mm') }}
                        </span>
                      </div>
                      <p v-if="todo.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ todo.description }}
                      </p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatDateTimeRange(parseISO(todo.start_time), parseISO(todo.end_time)) }}
                        </span>
                        <div class="flex items-center space-x-2">
                          <button
                            @click="toggleTodoStatus(todo)"
                            class="text-xs px-2 py-1 rounded"
                            :class="[
                              todo.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            ]"
                          >
                            {{ todo.completed ? '已完成' : '完成' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- 确认对话框 -->
    <ConfirmDialog
      v-if="showConfirmDialog"
      @confirm="handleConfirmEdit"
      @cancel="showConfirmDialog = false"
    />
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  format,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  differenceInDays,
  parseISO
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Icon } from '@iconify/vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useTodoStore } from '../stores/todo'
import MainLayout from '../components/MainLayout.vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const router = useRouter()
const todoStore = useTodoStore()
const viewMode = ref('month')
const currentDate = ref(new Date())
const selectedDate = ref(null)

// 添加对话框相关的状态
const showConfirmDialog = ref(false)
const pendingEditTodoId = ref(null)

// 在组件挂载时加载任务数据
onMounted(async () => {
  await todoStore.fetchTodos()
})

// 星期标题
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 计算显示的日期数组
const displayDates = computed(() => {
  if (viewMode.value === 'month') {
    const start = startOfWeek(startOfMonth(currentDate.value), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentDate.value), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  } else {
    const start = startOfWeek(currentDate.value, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate.value, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }
})

// 当前时间段标签
const currentPeriodLabel = computed(() => {
  if (viewMode.value === 'month') {
    return format(currentDate.value, 'yyyy年M月', { locale: zhCN })
  } else {
    const start = startOfWeek(currentDate.value, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate.value, { weekStartsOn: 1 })
    return `${format(start, 'M月d日', { locale: zhCN })} - ${format(end, 'M月d日', { locale: zhCN })}`
  }
})

// 日期处理函数
const today = () => {
  currentDate.value = new Date()
}

const previousPeriod = () => {
  if (viewMode.value === 'month') {
    currentDate.value = subMonths(currentDate.value, 1)
  } else {
    currentDate.value = subWeeks(currentDate.value, 1)
  }
}

const nextPeriod = () => {
  if (viewMode.value === 'month') {
    currentDate.value = addMonths(currentDate.value, 1)
  } else {
    currentDate.value = addWeeks(currentDate.value, 1)
  }
}

const isToday = (date) => {
  return isSameDay(date, new Date())
}

// 获取指定日期的任务
const getTodosForDate = (date) => {
  if (!date) return []
  
  // 确保传入的日期是 Date 对象
  const targetDate = date instanceof Date ? date : new Date(date)
  if (isNaN(targetDate.getTime())) return []
  
  return todoStore.todos.filter(todo => {
    if (!todo.start_time || !todo.end_time) return false
    
    const endDate = new Date(todo.end_time + 'Z')
    const startDate = new Date(todo.start_time + 'Z')
    
    // 使用本地变量存储日期，避免修改原始对象
    const endDateLocal = new Date(endDate.getTime())
    const startDateLocal = new Date(startDate.getTime())
    endDateLocal.setHours(0, 0, 0, 0)
    startDateLocal.setHours(0, 0, 0, 0)
    
    // 设置目标日期为当天开始时间
    const targetDateCopy = new Date(targetDate.getTime())
    targetDateCopy.setHours(0, 0, 0, 0)
    
    const duration = differenceInDays(endDateLocal, startDateLocal)

    // 如果是长期任务，不显示
    if (todo.is_long_term) {
      return false
    }

    // 创建一个新的对象来存储标记，避免修改原始对象
    const todoWithMarks = { ...todo }
    todoWithMarks.isEndDay = false
    todoWithMarks.isSevenDayBefore = false

    // 如果持续时间超过7天，只显示结束时间和倒数第7天
    if (duration > 7) {
      const sevenDaysBefore = addDays(endDateLocal, -7)
      sevenDaysBefore.setHours(0, 0, 0, 0)
      
      if (isSameDay(targetDateCopy, endDateLocal)) {
        todoWithMarks.isEndDay = true
        return true
      }
      if (isSameDay(targetDateCopy, sevenDaysBefore)) {
        todoWithMarks.isSevenDayBefore = true
        return true
      }
      return false
    }

    return isWithinInterval(targetDateCopy, { start: startDateLocal, end: endDateLocal })
  })
}

// 格式化日期范围
const formatDateRange = (start, end) => {
  if (isSameDay(start, end)) {
    return format(start, 'yyyy年M月d日', { locale: zhCN })
  }
  return `${format(start, 'yyyy年M月d日', { locale: zhCN })} - ${format(end, 'M月d日', { locale: zhCN })}`
}

// 格式化日期时间范围
const formatDateTimeRange = (start, end) => {
  const localStart = toLocalTime(start)
  const localEnd = toLocalTime(end)
  if (isSameDay(localStart, localEnd)) {
    return `${format(localStart, 'yyyy年M月d日 HH:mm', { locale: zhCN })} - ${format(localEnd, 'HH:mm', { locale: zhCN })}`
  }
  return `${format(localStart, 'yyyy年M月d日 HH:mm', { locale: zhCN })} - ${format(localEnd, 'M月d日 HH:mm', { locale: zhCN })}`
}

// 获取任务持续时间的样式类
const getDurationClass = (todo) => {
  if (!todo.start_time || !todo.end_time) return 'col-span-1'
  
  const startDate = new Date(todo.start_time + 'Z')
  const endDate = new Date(todo.end_time + 'Z')
  
  // 使用本地变量存储日期
  const startLocal = new Date(startDate.getTime())
  const endLocal = new Date(endDate.getTime())
  startLocal.setHours(0, 0, 0, 0)
  endLocal.setHours(0, 0, 0, 0)
  
  const duration = differenceInDays(endLocal, startLocal)
  
  // 如果是长期任务（超过7天）
  if (duration > 7) {
    return 'col-span-1'
  }
  
  // 计算任务在当前视图中应该越的列数
  const viewStart = viewMode.value === 'month' 
    ? startOfWeek(startOfMonth(currentDate.value), { weekStartsOn: 1 })
    : startOfWeek(currentDate.value, { weekStartsOn: 1 })
  
  const viewEnd = viewMode.value === 'month'
    ? endOfWeek(endOfMonth(currentDate.value), { weekStartsOn: 1 })
    : endOfWeek(currentDate.value, { weekStartsOn: 1 })
  
  // 使用本地变量计算有效日期范围
  const effectiveStart = startLocal < viewStart ? viewStart : startLocal
  const effectiveEnd = endLocal > viewEnd ? viewEnd : endLocal
  
  const visibleDuration = differenceInDays(effectiveEnd, effectiveStart)
  return `col-span-${Math.min(visibleDuration + 1, 7)}`
}

// 任务操作
const openTodoDetails = (todo) => {
  selectedDate.value = todo
}

// 切换任务状态
const toggleTodoStatus = async (todo) => {
  try {
    await todoStore.toggleTodo(todo.id)
    // 保存当前选中的日期
    const currentSelectedDate = new Date(selectedDate.value)
    // 重新加载数据
    await todoStore.fetchTodos()
    // 恢复选中的日期
    selectedDate.value = currentSelectedDate
  } catch (error) {
    console.error('切换任务状态失败:', error)
  }
}

const editTodo = (todo) => {
  // 检查是否有未保存的内容
  if (taskEditorRef.value?.hasUnsavedContent()) {
    pendingEditTodoId.value = todo.id
    showConfirmDialog.value = true
  } else {
    selectedDate.value = null
    nextTick(() => {
      router.push('/?edit=' + todo.id)
    })
  }
}

// 处理确认编辑
const handleConfirmEdit = () => {
  if (pendingEditTodoId.value) {
    selectedDate.value = null
    nextTick(() => {
      router.push('/?edit=' + pendingEditTodoId.value)
      pendingEditTodoId.value = null
    })
  }
}

const deleteTodo = async (todo) => {
  if (confirm('确定要删除这个任务吗？')) {
    await todoStore.deleteTodo(todo.id)
    selectedDate.value = null
  }
}

// 在 script setup 部分添加颜色数组
const taskColors = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500 dark:bg-blue-400' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', dot: 'bg-purple-500 dark:bg-purple-400' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300', dot: 'bg-pink-500 dark:bg-pink-400' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300', dot: 'bg-indigo-500 dark:bg-indigo-400' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-300', dot: 'bg-cyan-500 dark:bg-cyan-400' }
]

// 获取任务颜色
const getTaskColor = (todo) => {
  if (todo.completed) {
    return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-green-500 dark:bg-green-400'
    }
  }
  // 使用任务ID来确定颜色，这样同一个任务在不同日期显示的颜色是一致的
  return taskColors[todo.id % taskColors.length]
}

// 修改时间处理函数，添加时区转换
const toLocalTime = (dateStr) => {
  const date = new Date(dateStr)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
}

// 修改关闭对话框的处理函数
const closeDialog = () => {
  // 使用 nextTick 确保状态更新和动画同步
  nextTick(() => {
    selectedDate.value = null
  })
}

// 使用计算属性缓存一些频繁计算的值
const currentViewDates = computed(() => {
  const viewStart = viewMode.value === 'month' 
    ? startOfWeek(startOfMonth(currentDate.value), { weekStartsOn: 1 })
    : startOfWeek(currentDate.value, { weekStartsOn: 1 })
  
  const viewEnd = viewMode.value === 'month'
    ? endOfWeek(endOfMonth(currentDate.value), { weekStartsOn: 1 })
    : endOfWeek(currentDate.value, { weekStartsOn: 1 })
  
  return { viewStart, viewEnd }
})
</script>

<style scoped>
.col-span-1 { grid-column: span 1 / span 1; }
.col-span-2 { grid-column: span 2 / span 2; }
.col-span-3 { grid-column: span 3 / span 3; }
.col-span-4 { grid-column: span 4 / span 4; }
.col-span-5 { grid-column: span 5 / span 5; }
.col-span-6 { grid-column: span 6 / span 6; }
.col-span-7 { grid-column: span 7 / span 7; }

/* 任务容器样式 */
.task-container {
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem; /* 设置任务之间的间距 */
  min-height: 100%;
}

/* 任务项样式 */
.task-item {
  position: relative;
  flex-shrink: 0;
}

/* 连续任务样式 */
[class*="col-span-"] {
  position: relative;
  z-index: 1;
}

/* 移除绝对定位相关样式 */
[class*="col-span-"] > div {
  width: 100%;
}

/* 调整日期单元格样式 */
.date-cell {
  min-height: 110px;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style> 