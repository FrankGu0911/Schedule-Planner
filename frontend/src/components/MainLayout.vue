<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
      <div class="h-full px-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h1>
        <div class="flex items-center space-x-4">
          <button
            @click="themeStore.toggleDarkMode"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <Icon
              :icon="themeStore.isDark ? 'ph:sun-bold' : 'ph:moon-bold'"
              class="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
          </button>
          
          <div class="relative group">
            <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              <Icon icon="ph:user-circle" class="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ authStore.username }}</span>
              <Icon icon="ph:caret-down" class="w-4 h-4 text-gray-500" />
            </button>
            
            <div class="absolute w-full h-2 bottom-0 translate-y-full"></div>
            
            <div class="absolute right-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 hidden group-hover:block">
              <router-link
                v-if="authStore.isAdmin"
                to="/user-management"
                class="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                用户管理
              </router-link>
              <router-link
                to="/change-password"
                class="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                修改密码
              </router-link>
              <div class="h-px bg-gray-200 dark:bg-gray-700"></div>
              <button
                @click="authStore.logout"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 侧边栏 -->
    <aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
      <div class="p-4">
        <!-- 进度统计 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">总体进度</h3>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ todoStore.completionStats.percentage }}%
            </span>
          </div>
          <div class="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-500 ease-in-out"
              :style="{ width: todoStore.completionStats.percentage + '%' }"
            ></div>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>已完成 {{ todoStore.completionStats.completed }} 项</span>
            <span>共 {{ todoStore.completionStats.total }} 项</span>
          </div>
        </div>

        <!-- 侧边栏导航 -->
        <nav class="space-y-1">
          <!-- 待办事项 -->
          <router-link
            to="/"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg text-left"
            :class="[$route.path === '/' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']"
          >
            <Icon icon="ph:list-bold" class="w-5 h-5" />
            <span>待办事项</span>
          </router-link>

          <!-- 用户管理（仅管理员可见） -->
          <router-link
            v-if="authStore.isAdmin"
            to="/user-management"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg text-left"
            :class="[$route.path === '/user-management' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']"
          >
            <Icon icon="ph:users-bold" class="w-5 h-5" />
            <span>用户管理</span>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="ml-72 pt-20 p-8">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useTodoStore } from '../stores/todo'

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const todoStore = useTodoStore()

// 根据路由计算页面标题
const title = computed(() => {
  switch (route.path) {
    case '/':
      return '待办事项'
    case '/user-management':
      return '用户管理'
    case '/change-password':
      return '修改密码'
    default:
      return '待办事项'
  }
})
</script> 