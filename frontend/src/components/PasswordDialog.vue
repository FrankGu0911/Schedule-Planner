<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 背景遮罩 -->
    <div class="fixed inset-0 bg-black bg-opacity-50"></div>

    <!-- 对话框 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <!-- 标题 -->
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ isAdmin ? '修改用户密码' : '修改密码' }}
        </h3>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 当前密码（仅用户自己修改时需要） -->
          <div v-if="!isAdmin">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              当前密码
            </label>
            <input
              v-model="currentPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="请输入当前密码"
            />
          </div>

          <!-- 新密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ isAdmin ? '新密码' : '新密码' }}
            </label>
            <input
              v-model="newPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :placeholder="isAdmin ? '请输入新密码' : '请输入新密码'"
              ref="newPasswordInput"
            />
          </div>

          <!-- 确认新密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              确认新密码
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="请再次输入新密码"
            />
          </div>

          <!-- 错误提示 -->
          <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </p>

          <!-- 按钮组 -->
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="handleCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? '提交中...' : '确认' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: Boolean,
  isAdmin: Boolean,
  loading: Boolean,
  error: String
})

const emit = defineEmits(['update:show', 'submit', 'cancel'])

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const newPasswordInput = ref(null)

// 监听对话框显示状态，当显示时自动聚焦到新密码输入框
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await nextTick()
    newPasswordInput.value?.focus()
  } else {
    // 清空表单
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
})

const handleSubmit = () => {
  if (newPassword.value !== confirmPassword.value) {
    emit('submit', { error: '两次输入的密码不一致' })
    return
  }

  if (newPassword.value.length < 6) {
    emit('submit', { error: '密码长度不能小于6位' })
    return
  }

  emit('submit', {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script> 