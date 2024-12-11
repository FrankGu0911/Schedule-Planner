<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    :class="{
      'border-l-4 border-red-500 dark:border-red-400': todo.isOverdue,
      'border-l-4 border-yellow-500 dark:border-yellow-400': todo.isEndingSoon,
      'border-l-4 border-blue-500 dark:border-blue-400': todo.isStartingSoon
    }"
  >
    <div class="p-4 flex">
      <!-- 勾选框 -->
      <div class="flex-shrink-0 self-start sm:self-center mr-3 sm:mr-4 mt-1 sm:mt-0">
        <button
          @click="$emit('toggle')"
          class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          :class="{ 'bg-primary-500 border-primary-500': todo.completed }"
        >
          <Icon
            v-if="todo.completed"
            icon="ph:check-bold"
            class="w-3 h-3 sm:w-4 sm:h-4 text-white"
          />
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="flex-grow min-w-0">
        <!-- 标题和操作按钮 -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 
              class="text-base sm:text-lg font-medium break-words"
              :class="{ 'line-through text-gray-500 dark:text-gray-400': todo.completed }"
            >
              {{ todo.title }}
            </h3>
            <!-- 状态标签 -->
            <div class="mt-1 flex gap-2">
              <span v-if="todo.isOverdue" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                已超时
              </span>
              <span v-else-if="todo.isEndingSoon" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                即将结束
              </span>
              <span v-else-if="todo.isStartingSoon" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                即将开始
              </span>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="flex-shrink-0 flex space-x-1">
            <button
              @click="$emit('edit')"
              class="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              <Icon icon="ph:pencil-bold" class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              @click="$emit('delete')"
              class="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            >
              <Icon icon="ph:trash-bold" class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <!-- 描述 -->
        <p v-if="todo.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 break-words">
          {{ todo.description }}
        </p>

        <!-- 时间信息 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mb-3">
          <div class="flex items-center text-gray-600 dark:text-gray-400">
            <Icon icon="ph:clock" class="w-4 h-4 mr-1 flex-shrink-0" />
            <span class="truncate">开始：{{ formatDateTime(todo.start_time) }}</span>
          </div>
          <div v-if="!todo.is_long_term && todo.end_time" class="flex items-center text-gray-600 dark:text-gray-400">
            <Icon icon="ph:clock-countdown" class="w-4 h-4 mr-1 flex-shrink-0" />
            <span class="truncate">结束：{{ formatDateTime(todo.end_time) }}</span>
          </div>
          <div v-if="todo.is_long_term" class="flex items-center text-blue-600 dark:text-blue-400">
            <Icon icon="ph:infinity-bold" class="w-4 h-4 mr-1 flex-shrink-0" />
            <span>长期任务</span>
          </div>
        </div>

        <!-- 标签 -->
        <div class="flex flex-wrap gap-1.5 sm:gap-2">
          <div
            v-for="tag in todo.tags"
            :key="tag"
            class="px-2 py-0.5 sm:py-1 text-xs rounded max-w-[150px] truncate"
            :style="{ backgroundColor: getTagColor(tag).bgColor, color: getTagColor(tag).textColor }"
          >
            {{ tag }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle', 'edit', 'delete'])

// 格式化日期时间（UTC转本地时间）
const formatDateTime = (utcStr) => {
  if (!utcStr) return ''
  // 将UTC时间字符串转换为本地时间
  const date = new Date(utcStr + 'Z')  // 添加Z表示这是UTC时间
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

// 标签颜色映射
const tagColors = [
  { bgColor: '#E9F5FE', textColor: '#0369A1' }, // 蓝色
  { bgColor: '#F0FDF4', textColor: '#166534' }, // 绿色
  { bgColor: '#FEF3F2', textColor: '#9F1239' }, // 红色
  { bgColor: '#FDF4FF', textColor: '#86198F' }, // 紫色
  { bgColor: '#FFF7ED', textColor: '#9A3412' }, // 橙色
  { bgColor: '#F5F3FF', textColor: '#5B21B6' }, // 靛蓝
]

// 根据标签文本生成固定的颜色
const getTagColor = (tag) => {
  const index = Math.abs(hashCode(tag)) % tagColors.length
  return tagColors[index]
}

// 简单的字符串哈希函数
const hashCode = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}
</script> 