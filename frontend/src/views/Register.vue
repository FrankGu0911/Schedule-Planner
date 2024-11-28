<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- 左侧装饰区域 -->
    <div class="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700"></div>
      <div class="relative z-10 flex flex-col justify-center items-center text-white p-12">
        <img src="/ms-todo-logo.webp" alt="Logo" class="w-16 h-16 mb-8" />
        <h1 class="text-4xl font-bold mb-4">Microsoft To Do</h1>
        <p class="text-lg text-primary-100 text-center max-w-md">
          加入我们，开始规划您的每一天
        </p>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-700 to-transparent"></div>
    </div>

    <!-- 右侧注册区域 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
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
            <img src="/ms-todo-logo.webp" alt="Logo" class="w-12 h-12 mx-auto mb-4 lg:hidden" />
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">创建账户</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">开始您的待办事项之旅</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="请输入密码"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="请再次输入密码"
              />
            </div>

            <div v-if="error || authStore.error" class="text-red-500 text-sm text-center">
              {{ error || authStore.error }}
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
              <span>{{ authStore.loading ? '注册中...' : '注册' }}</span>
            </button>
          </form>

          <div class="text-center">
            <router-link
              to="/login"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              已有账户？立即登录
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  try {
    await authStore.register(username.value, password.value)
  } catch (err) {
    console.error('Registration failed:', err)
  }
}
</script> 