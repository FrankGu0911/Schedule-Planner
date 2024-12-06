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
              <span>{{ authStore.loading ? '注册中...' : '注册' }}</span>
            </button>
          </form>

          <div class="text-center space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              注册后需要等待管理员审核激活账号
            </p>
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
import { useToastStore } from '../stores/toast'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    toastStore.show('两次输入的密码不一致', 'error')
    return
  }

  try {
    const response = await authStore.register(username.value, password.value)
    toastStore.show('注册成功，请等待管理员审核', 'success')
    await router.replace('/login')
  } catch (err) {
    console.error('Registration failed:', err)
    toastStore.show(err, 'error')
  }
}
</script> 