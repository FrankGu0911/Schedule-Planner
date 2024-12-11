<template>
  <div ref="editorRef" class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 标题输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标题
        </label>
        <input
          v-model="formData.title"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="输入任务标题"
        />
      </div>

      <!-- 描述输入 -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          描述
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          @input="autoResize"
          ref="descriptionTextarea"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white min-h-[80px] overflow-hidden resize-none"
          placeholder="请输入任务描述（可选）"
        ></textarea>
      </div>

      <!-- 长期任务选项 -->
      <div class="flex items-center">
        <input
          id="is_long_term"
          v-model="formData.is_long_term"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="is_long_term" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          这是一个长期任务（无结束时间）
        </label>
      </div>

      <!-- 时间设置 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="start_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            开始时间
          </label>
          <input
            id="start_time"
            v-model="formData.start_time"
            type="datetime-local"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label for="end_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            结束时间
          </label>
          <input
            id="end_time"
            v-model="formData.end_time"
            type="datetime-local"
            :required="!formData.is_long_term"
            :disabled="formData.is_long_term"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <!-- 标签输入 -->
      <div>
        <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标签
        </label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="tag in formData.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-md text-sm"
            :style="{ backgroundColor: getTagColor(tag).bgColor, color: getTagColor(tag).textColor }"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(tag)"
              class="ml-1 focus:outline-none"
              :style="{ color: getTagColor(tag).textColor }"
            >
              <Icon icon="ph:x-bold" class="w-3 h-3" />
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <input
            id="tagInput"
            v-model="newTag"
            type="text"
            @keydown.enter.prevent="addTag"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="输入标签后按回车添加"
          />
          <button
            type="button"
            @click="addTag"
            class="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            添加
          </button>
        </div>
      </div>

      <!-- 智能识别部分 -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-y-4">
          <textarea
            v-model="aiInput"
            rows="3"
            class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="粘贴您的任务内容在此，我们将自动识别并整理您的待办事项。例：明天下午3点与团队开会"
          ></textarea>
          <div class="flex justify-end">
            <button
              type="button"
              @click="handleAIRecognition"
              :disabled="aiLoading || !aiInput.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Icon v-if="aiLoading" icon="ph:circle-notch-bold" class="w-4 h-4 animate-spin" />
              <span>{{ aiLoading ? '识别中...' : '智能识别' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          取消
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '保存中...' : (task ? '更新' : '创建') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import { API_CONFIG } from '../config/env'
import { useToastStore } from '../stores/toast'
import { useAuthStore } from '../stores/auth'

// 创建专门用于 AI 请求的 axios 实例，设置更长的超时时间
const api = axios.create({
  ...API_CONFIG,
  timeout: 20000  // 20 秒超时
})

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const toastStore = useToastStore()
const authStore = useAuthStore()

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 表单数据
const formData = ref({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  is_long_term: false,
  tags: []
})

// 初始化表单数据
const initializeForm = () => {
  if (props.task) {
    const { title, description, start_time, end_time, is_long_term, is_starred, tags } = props.task
    // 将UTC时间转换为本地时间用于显示
    const utcToLocal = (utcStr) => {
      if (!utcStr) return ''
      // 将UTC时间转换为本地时间，并格式化为datetime-local所需的格式
      const date = new Date(utcStr + 'Z')
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    formData.value = {
      title: title || '',
      description: description || '',
      start_time: utcToLocal(start_time),
      end_time: end_time ? utcToLocal(end_time) : '',
      is_long_term: is_long_term || false,
      tags: tags || []
    }
  } else {
    // 设置默认开始时间为当前本地时间
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    formData.value = {
      title: '',
      description: '',
      start_time: `${year}-${month}-${day}T${hours}:${minutes}`,
      end_time: '',
      is_long_term: false,
      tags: []
    }
  }
}

// 监听 task 属性变化
watch(() => props.task, (newTask) => {
  if (newTask || newTask === null) {
    nextTick(() => {
      initializeForm()
    })
  }
}, { immediate: true })

// 组件卸载前清理
onBeforeUnmount(() => {
  formData.value = {
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    is_long_term: false,
    tags: []
  }
})

// 新标签输入
const newTag = ref('')

// 标签颜色映射
const tagColors = [
  { bgColor: '#E9F5FE', textColor: '#0369A1' }, // 蓝色
  { bgColor: '#F0FDF4', textColor: '#166534' }, // 绿色
  { bgColor: '#FEF3F2', textColor: '#9F1239' }, // 红色
  { bgColor: '#FDF4FF', textColor: '#86198F' }, // 紫色
  { bgColor: '#FFF7ED', textColor: '#9A3412' }, // 橙色
  { bgColor: '#F5F3FF', textColor: '#5B21B6' }, // 靛蓝
]

// 根据标签文本生成颜色
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

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
  newTag.value = ''
}

// 移除标签
const removeTag = (tag) => {
  formData.value.tags = formData.value.tags.filter(t => t !== tag)
}

// 处理表单提交
const handleSubmit = () => {
  // 验证结束时间不早于开始时间
  if (!formData.value.is_long_term && formData.value.end_time) {
    const startTime = new Date(formData.value.start_time)
    const endTime = new Date(formData.value.end_time)
    if (endTime < startTime) {
      toastStore.show('结束时间不能早于开始时间', 'error')
      return
    }
  }

  // 转换本地时间为UTC格式
  const localToUTC = (localDateTimeStr) => {
    if (!localDateTimeStr) return ''
    const date = new Date(localDateTimeStr)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const formattedData = {
    ...formData.value,
    start_time: localToUTC(formData.value.start_time),
    end_time: formData.value.is_long_term ? '' : localToUTC(formData.value.end_time),
    is_starred: props.task?.is_starred || false
  }

  emit('submit', formattedData)
}

const editorRef = ref(null)

// 添加一个方法来检查是否有未保存的内容
const hasUnsavedContent = () => {
  if (!formData.value) return false
  return formData.value.title.trim() !== '' || 
         formData.value.description.trim() !== '' || 
         aiInput.value.trim() !== ''
}

// 暴露方法给父组件
defineExpose({
  scrollIntoView: () => {
    nextTick(() => {
      editorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  },
  hasUnsavedContent
})

// AI 识别相关
const aiInput = ref('')
const aiLoading = ref(false)

// AI 识别处理函数
const handleAIRecognition = async () => {
  if (!aiInput.value.trim()) {
    toastStore.show('请输入任务内容', 'error')
    return
  }

  aiLoading.value = true

  try {
    const response = await api.post('/ai/process', {
      input: aiInput.value.trim()
    })

    // 解析响应数据
    if (response.data?.data?.status === 'succeeded' && response.data?.data?.outputs) {
      const taskInfo = response.data.data.outputs
      
      // 填充表单数据
      formData.value = {
        ...formData.value,
        title: taskInfo.title || aiInput.value.trim(),
        description: taskInfo.description || '',
        start_time: taskInfo.start_time ? taskInfo.start_time.replace(' ', 'T').slice(0, 16) : formData.value.start_time,
        end_time: taskInfo.end_time ? taskInfo.end_time.replace(' ', 'T').slice(0, 16) : formData.value.end_time,
        is_long_term: taskInfo.is_long_term === 1,
        tags: taskInfo.tags || []
      }

      // 显示成功提示
      toastStore.show('已成功识别任务内容', 'success')
    } else {
      throw new Error(response.data?.data?.error || '无效的响应数据')
    }
  } catch (error) {
    console.error('AI recognition error:', error)
    toastStore.show(error.response?.data?.error || '识别失败，请重试', 'error')
  } finally {
    aiLoading.value = false
  }
}

const descriptionTextarea = ref(null)

const autoResize = () => {
  const textarea = descriptionTextarea.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

// 组件挂载时初始化高度
onMounted(() => {
  nextTick(() => {
    autoResize()
  })
})

// 在表单数据更新时重新计算高度
watch(() => formData.value.description, () => {
  nextTick(() => {
    autoResize()
  })
})
</script>