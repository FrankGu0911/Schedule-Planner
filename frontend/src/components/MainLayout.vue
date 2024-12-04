<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-30">
      <div class="h-full px-4 flex items-center justify-between">
        <div class="flex items-center">
          <!-- 侧边栏切换按钮 -->
          <button
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mr-2"
            type="button"
          >
            <Icon
              :icon="sidebarOpen ? 'ph:x-bold' : 'ph:list-bold'"
              class="w-6 h-6 text-gray-600 dark:text-gray-400"
            />
          </button>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h1>
        </div>
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
            
            <div class="absolute right-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 hidden group-hover:block z-50">
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
                @click="handleLogout"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 侧边栏遮罩层 -->
    <div
      v-if="sidebarOpen && !isLargeScreen"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="closeSidebar"
    ></div>

    <!-- 侧边栏 -->
    <aside
      class="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 z-20 overflow-y-auto"
      :class="[
        isLargeScreen ? (sidebarOpen ? 'w-72' : 'w-20') : (sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full')
      ]"
    >
      <div class="p-4">
        <!-- 进度统计 -->
        <div class="mb-6">
          <!-- 展开状态的进度显示 -->
          <template v-if="sidebarOpen">
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
          </template>

          <!-- 收起状态的进度显示 -->
          <template v-else-if="isLargeScreen">
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full border-2 relative mb-2"
                :class="[
                  todoStore.completionStats.percentage >= 80 ? 'border-green-500 dark:border-green-400' :
                  todoStore.completionStats.percentage >= 50 ? 'border-blue-500 dark:border-blue-400' :
                  todoStore.completionStats.percentage >= 20 ? 'border-yellow-500 dark:border-yellow-400' :
                  'border-red-500 dark:border-red-400'
                ]"
              >
                <div class="absolute inset-0 flex items-center justify-center text-sm font-medium"
                  :class="[
                    todoStore.completionStats.percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                    todoStore.completionStats.percentage >= 50 ? 'text-blue-600 dark:text-blue-400' :
                    todoStore.completionStats.percentage >= 20 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  ]"
                >
                  {{ todoStore.completionStats.percentage }}%
                </div>
              </div>
              <div class="text-xs text-center text-gray-500 dark:text-gray-400">
                {{ todoStore.completionStats.completed }}/{{ todoStore.completionStats.total }}
              </div>
            </div>
          </template>
        </div>

        <!-- 侧边栏导航 -->
        <nav class="space-y-1">
          <!-- 待办事项 -->
          <router-link
            to="/"
            class="flex items-center px-3 py-2 rounded-lg text-left"
            :class="[
              $route.path === '/' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              { 'justify-center': !sidebarOpen && isLargeScreen }
            ]"
            @click="closeSidebarOnMobile"
          >
            <Icon icon="ph:list-bold" class="w-6 h-6" />
            <span v-if="sidebarOpen || !isLargeScreen" class="ml-3">待办事项</span>
          </router-link>

          <!-- 用户管理（仅管理员可见） -->
          <router-link
            v-if="authStore.isAdmin"
            to="/user-management"
            class="flex items-center px-3 py-2 rounded-lg text-left"
            :class="[
              $route.path === '/user-management' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              { 'justify-center': !sidebarOpen && isLargeScreen }
            ]"
            @click="closeSidebarOnMobile"
          >
            <Icon icon="ph:users-bold" class="w-6 h-6" />
            <span v-if="sidebarOpen || !isLargeScreen" class="ml-3">用户管理</span>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main
      class="transition-all duration-300"
      :class="[
        'pt-24 px-4 lg:px-8',
        isLargeScreen ? (sidebarOpen ? 'ml-72' : 'ml-20') : ''
      ]"
    >
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useTodoStore } from '../stores/todo'
import { useToastStore } from '../stores/toast'
import { useResponsive } from '../composables/useResponsive'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const todoStore = useTodoStore()
const toastStore = useToastStore()
const { isDesktop } = useResponsive()

// 侧边栏状态
const sidebarOpen = ref(false)
const isLargeScreen = computed(() => isDesktop.value)

// 从 localStorage 读取状态
const SIDEBAR_STATE_KEY = 'sidebarState'
const loadSidebarState = () => {
  if (isLargeScreen.value) {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
    sidebarOpen.value = savedState === null ? true : savedState === 'true'
  } else {
    sidebarOpen.value = false
  }
}

// 保存状态到 localStorage
const saveSidebarState = (state) => {
  if (isLargeScreen.value) {
    localStorage.setItem(SIDEBAR_STATE_KEY, state.toString())
  }
}

// 监听屏幕尺寸变化
watch(isDesktop, (newValue) => {
  loadSidebarState()
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  saveSidebarState(sidebarOpen.value)
}

// 在移动端关闭侧边栏
const closeSidebarOnMobile = () => {
  if (!isLargeScreen.value) {
    sidebarOpen.value = false
  }
}

// 关闭侧边栏（移动端点击遮罩层时调用）
const closeSidebar = () => {
  if (!isLargeScreen.value) {
    sidebarOpen.value = false
  }
}

// 处理退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 初始化
onMounted(async () => {
  loadSidebarState()
  // 获取待办事项数据
  await todoStore.fetchTodos()
})

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