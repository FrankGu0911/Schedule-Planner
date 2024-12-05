<template>
  <MainLayout>
    <div class="w-full lg:max-w-[calc(100vw-20rem)] lg:mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <!-- 顶部控制栏 -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-4">
            <button
              @click="today"
              class="px-3 py-1.5 text-sm font-medium rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40"
            >
              今天
            </button>
            <div class="flex items-center space-x-2">
              <button
                @click="previousPeriod"
                class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <Icon icon="ph:caret-left-bold" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                @click="nextPeriod"
                class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <Icon icon="ph:caret-right-bold" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ currentPeriodLabel }}
            </h2>
          </div>
          <div class="flex items-center space-x-2">
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
    <TransitionRoot appear :show="!!selectedDate && !isClosing" as="template">
      <Dialog 
        as="div" 
        @close="closeDialog" 
        class="relative z-50"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
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

const router = useRouter()
const todoStore = useTodoStore()
const viewMode = ref('month')
const currentDate = ref(new Date())
const selectedDate = ref(null)
const isClosing = ref(false)

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
  return todoStore.todos.filter(todo => {
    if (!todo.start_time || !todo.end_time) return false
    
    const endDate = new Date(todo.end_time)
    const startDate = new Date(todo.start_time)
    
    // 确保日期是凌晨 00:00:00
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    startDate.setHours(0, 0, 0, 0)
    
    const duration = differenceInDays(endDate, startDate)

    // 如果是长期任务，不显示
    if (todo.is_long_term) {
      return false
    }

    // 如果持续时间超过7天，只显示结束时间和倒数第7天
    if (duration > 7) {
      const sevenDaysBefore = addDays(endDate, -7)
      sevenDaysBefore.setHours(0, 0, 0, 0)
      
      if (isSameDay(targetDate, endDate)) {
        // 在结束日显示，添加标记表明是结束日
        todo.isEndDay = true
        return true
      }
      if (isSameDay(targetDate, sevenDaysBefore)) {
        // 在倒数第7天显示，添加标记表明是倒数第7天
        todo.isSevenDayBefore = true
        return true
      }
      return false
    }

    // 对于短期任务（7天及以内），如果日期在任务的开始和结束日期之间，就显示
    return isWithinInterval(targetDate, { start: startDate, end: endDate })
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
  const startDate = new Date(todo.start_time)
  const endDate = new Date(todo.end_time)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  
  const duration = differenceInDays(endDate, startDate)
  
  // 如果是长期任务（超过7天）
  if (duration > 7) {
    return 'col-span-1'
  }
  
  // 计算任务在当前视图中应该跨越的列数
  const viewStart = viewMode.value === 'month' 
    ? startOfWeek(startOfMonth(currentDate.value), { weekStartsOn: 1 })
    : startOfWeek(currentDate.value, { weekStartsOn: 1 })
  
  const viewEnd = viewMode.value === 'month'
    ? endOfWeek(endOfMonth(currentDate.value), { weekStartsOn: 1 })
    : endOfWeek(currentDate.value, { weekStartsOn: 1 })
  
  // 如果任务的开始日期在视图范围之前，从视图开始日期算起
  const effectiveStart = startDate < viewStart ? viewStart : startDate
  // 如果任务的结束日期在视图范围之后，到视图结束日期为止
  const effectiveEnd = endDate > viewEnd ? viewEnd : endDate
  
  const visibleDuration = differenceInDays(effectiveEnd, effectiveStart)
  return `col-span-${Math.min(visibleDuration + 1, 7)}`
}

// 任务操作
const openTodoDetails = (todo) => {
  selectedDate.value = todo
}

const toggleTodoStatus = async (todo) => {
  await todoStore.toggleTodo(todo.id)
  selectedDate.value = todoStore.todos.find(t => t.id === todo.id)
}

const editTodo = (todo) => {
  selectedDate.value = null
  router.push('/?edit=' + todo.id)
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

// 优化关闭对话框的处理函数
const closeDialog = () => {
  if (isClosing.value) return
  isClosing.value = true
  // 使用 nextTick 确保状态更新后再执行动画
  nextTick(() => {
    setTimeout(() => {
      selectedDate.value = null
      isClosing.value = false
    }, 300) // 增加延迟时间，确保动画完全结束
  })
}
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
.min-h-[100px] {
  min-height: 110px;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style> 