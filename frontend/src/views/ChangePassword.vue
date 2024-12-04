<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <div class="w-full flex items-center justify-center p-8">
      <div class="w-full max-w-md">
        <!-- 主题切换按钮 -->
        <button
          @click="themeStore.toggleDarkMode"
          class="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
        >
          <Icon
            :icon="themeStore.isDark ? 'ph:sun-bold' : 'ph:moon-bold'"
            class="w-5 h-5 text-gray-600 dark:text-gray-400"
          />
        </button>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">修改密码</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">请输入您的旧密码和新密码</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="oldPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                旧密码
              </label>
              <input
                id="oldPassword"
                v-model="oldPassword"
                type="password"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="请输入旧密码"
              />
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                新密码
              </label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="请输入新密码"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="请再次输入新密码"
              />
            </div>

            <div v-if="error" class="text-red-500 text-sm text-center">
              {{ error }}
            </div>

            <div v-if="authStore.error" class="text-red-500 text-sm text-center">
              {{ authStore.error }}
            </div>

            <div v-if="authStore.message" class="text-green-500 text-sm text-center">
              {{ authStore.message }}
            </div>

            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full flex justify-center items-center h-11 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon
                v-if="authStore.loading"
                icon="ph:circle-notch-bold"
                class="w-5 h-5 mr-2 animate-spin"
              />
              <span>{{ authStore.loading ? '修改中...' : '修改密码' }}</span>
            </button>

            <button
              type="button"
              @click="router.back()"
              class="w-full flex justify-center items-center h-11 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              返回
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }

  try {
    const success = await authStore.changePassword(oldPassword.value, newPassword.value)
    if (success) {
      // 等待一会儿显示成功消息，然后返回
      setTimeout(() => {
        router.back()
      }, 1500)
    }
  } catch (err) {
    console.error('Change password failed:', err)
  }
}
</script> 