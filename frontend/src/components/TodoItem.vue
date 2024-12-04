<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="p-4 flex">
      <!-- 勾选框 -->
      <div class="flex-shrink-0 self-center mr-4">
        <button
          @click="$emit('toggle')"
          class="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          :class="{ 'bg-primary-500 border-primary-500': todo.completed }"
        >
          <Icon
            v-if="todo.completed"
            icon="ph:check-bold"
            class="w-4 h-4 text-white"
          />
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="flex-grow">
        <!-- 标题 -->
        <h3 
          class="text-lg font-medium mb-2"
          :class="{ 'line-through text-gray-500 dark:text-gray-400': todo.completed }"
        >
          {{ todo.title }}
        </h3>

        <!-- 描述 -->
        <p v-if="todo.description" class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {{ todo.description }}
        </p>

        <!-- 时间信息 -->
        <div class="flex flex-wrap gap-4 text-sm mb-3">
          <div class="flex items-center text-gray-600 dark:text-gray-400">
            <Icon icon="ph:clock" class="w-4 h-4 mr-1" />
            <span>开始：{{ formatDateTime(todo.start_time) }}</span>
          </div>
          <div v-if="!todo.is_long_term && todo.end_time" class="flex items-center text-gray-600 dark:text-gray-400">
            <Icon icon="ph:clock-countdown" class="w-4 h-4 mr-1" />
            <span>结束：{{ formatDateTime(todo.end_time) }}</span>
          </div>
          <div v-if="todo.is_long_term" class="flex items-center text-blue-600 dark:text-blue-400">
            <Icon icon="ph:infinity-bold" class="w-4 h-4 mr-1" />
            <span>长期任务</span>
          </div>
        </div>

        <!-- 标签 -->
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in todo.tags"
            :key="tag"
            class="px-2 py-1 text-xs rounded"
            :style="{ backgroundColor: getTagColor(tag).bgColor, color: getTagColor(tag).textColor }"
          >
            {{ tag }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end mt-4 space-x-2">
          <button
            @click="$emit('edit')"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            <Icon icon="ph:pencil-bold" class="w-5 h-5" />
          </button>
          <button
            @click="$emit('delete')"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          >
            <Icon icon="ph:trash-bold" class="w-5 h-5" />
          </button>
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
  const date = new Date(utcStr.replace(' ', 'T') + 'Z')
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