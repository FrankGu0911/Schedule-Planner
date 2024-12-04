<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
    <form @submit.prevent="handleSubmit">
      <!-- 标题 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标题
        </label>
        <input
          v-model="form.title"
          type="text"
          required
          class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="请输入任务标题"
        />
      </div>

      <!-- 描述 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          描述
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="请输入任务描述（可选）"
        ></textarea>
      </div>

      <!-- 时间设置 -->
      <div class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            开始时间
          </label>
          <input
            v-model="form.start_time"
            type="datetime-local"
            class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            结束时间
          </label>
          <input
            v-model="form.end_time"
            type="datetime-local"
            :class="[
              'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              form.is_long_term 
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
            ]"
            :disabled="form.is_long_term"
          />
        </div>
      </div>

      <!-- 长期任务 -->
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            长期任务
          </label>
          <!-- 开关按钮 -->
          <button
            type="button"
            @click="form.is_long_term = !form.is_long_term"
            class="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :class="form.is_long_term ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
          >
            <span class="sr-only">启用长期任务</span>
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="form.is_long_term ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ form.is_long_term ? '长期任务无需设置结束时间' : '设置具体的结束时间' }}
        </p>
      </div>

      <!-- 标签 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标签
        </label>
        <div class="space-y-2">
          <!-- 已添加的标签 -->
          <div class="flex flex-wrap gap-2" v-if="form.tags.length > 0">
            <div 
              v-for="tag in form.tags" 
              :key="tag" 
              class="flex items-center px-2 py-1 rounded"
              :style="{ backgroundColor: getTagColor(tag).bgColor, color: getTagColor(tag).textColor }"
            >
              <span class="text-sm">{{ tag }}</span>
              <button
                type="button"
                @click="removeTag(tag)"
                class="ml-1 p-0.5 rounded hover:bg-black/10"
              >
                <Icon icon="ph:x-bold" class="w-3 h-3" />
              </button>
            </div>
          </div>
          <!-- 标签输入框 -->
          <div class="flex items-center space-x-2">
            <input
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              type="text"
              class="flex-grow px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="输入标签后按回车添加"
            />
            <button
              type="button"
              @click="addTag"
              class="px-3 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              添加
            </button>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          取消
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '提交中...' : isEdit ? '保存' : '创建' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  task: {
    type: Object,
    default: () => null
  },
  loading: Boolean
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => props.task?.id !== undefined)
const newTag = ref('')

// 获取当前时间，格式化为 datetime-local 格式（本地时区）
const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 将UTC时间字符串转换为本地 datetime-local 格式
const utcToLocal = (utcStr) => {
  if (!utcStr) return ''
  const date = new Date(utcStr + 'Z')
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 将本地 datetime-local 格式转换为UTC时间字符串（API格式）
const localToUTC = (localStr) => {
  if (!localStr) return null
  const date = new Date(localStr)
  const utcYear = date.getUTCFullYear()
  const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0')
  const utcDay = String(date.getUTCDate()).padStart(2, '0')
  const utcHours = String(date.getUTCHours()).padStart(2, '0')
  const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0')
  const utcSeconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`
}

const form = reactive({
  title: '',
  description: '',
  start_time: getCurrentDateTime(),
  end_time: '',
  is_long_term: false,
  tags: []
})

// 监听长期任务状态，当设置为长期任务时清空结束时间
watch(() => form.is_long_term, (newVal) => {
  if (newVal) {
    form.end_time = ''
  }
})

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

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

// 初始化表单数据
onMounted(() => {
  if (props.task) {
    const { title, description, start_time, end_time, is_long_term, tags } = props.task
    Object.assign(form, {
      title: title || '',
      description: description || '',
      is_long_term: is_long_term || false,
      tags: tags || [],
      // 将UTC时间转换为本地时间显示
      start_time: start_time ? utcToLocal(start_time) : getCurrentDateTime(),
      end_time: end_time ? utcToLocal(end_time) : ''
    })
  }
})

const handleSubmit = () => {
  const data = {
    title: form.title,
    description: form.description || '',
    is_long_term: form.is_long_term,
    // 将本地时间转换为UTC时间提交给API
    start_time: localToUTC(form.start_time),
    end_time: form.is_long_term ? null : localToUTC(form.end_time),
    tags: form.tags
  }
  
  // 如果是编辑模式，需要保持原有的 completed 状态
  if (isEdit.value && props.task.completed !== undefined) {
    data.completed = props.task.completed
  }
  
  emit('submit', data)
}
</script> 