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
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">欢迎回来</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">请登录您的账户</p>
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

            <div v-if="authStore.error" class="text-red-500 text-sm text-center">
              {{ authStore.error }}
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
              <span>{{ authStore.loading ? '登录中...' : '登录' }}</span>
            </button>
          </form>

          <div class="text-center">
            <router-link
              to="/register"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              还没有账户？立即注册
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

const handleSubmit = async () => {
  try {
    await authStore.login(username.value, password.value)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script> 