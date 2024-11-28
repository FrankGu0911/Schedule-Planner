<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
      <div class="h-full px-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">待办事项</h1>
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
            
            <div class="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 hidden group-hover:block">
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

        <nav class="space-y-1">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="todoStore.setFilter(filter.value)"
            :class="[
              'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
              todoStore.filter === filter.value
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <Icon :icon="filter.icon" class="w-5 h-5" />
            <span>{{ filter.label }}</span>
            <span class="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {{ filter.value === 'all' ? todoStore.completionStats.total : 
                 filter.value === 'active' ? todoStore.completionStats.active :
                 todoStore.completionStats.completed }}
            </span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="ml-72 pt-20 p-8">
      <!-- 添加新任务 -->
      <div class="max-w-3xl mx-auto mb-8">
        <form @submit.prevent="handleAddTodo" class="relative">
          <input
            v-model="newTodo"
            type="text"
            placeholder="添加任务"
            class="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Icon
            icon="ph:plus-circle"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </form>
      </div>

      <!-- 任务列表 -->
      <div class="max-w-3xl mx-auto">
        <TransitionGroup
          name="list"
          tag="div"
          class="space-y-2"
        >
          <div
            v-for="todo in todoStore.filteredTodos"
            :key="todo.id"
            class="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div class="p-4 flex items-center space-x-4">
              <button
                @click="todoStore.toggleTodo(todo.id)"
                class="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                :class="{ 'bg-primary-500 border-primary-500': todo.completed }"
              >
                <Icon
                  v-if="todo.completed"
                  icon="ph:check-bold"
                  class="w-4 h-4 text-white"
                />
              </button>
              
              <div class="flex-1 min-w-0">
                <h3
                  class="text-gray-900 dark:text-white text-base font-medium truncate"
                  :class="{ 'line-through text-gray-500 dark:text-gray-400': todo.completed }"
                >
                  {{ todo.title }}
                </h3>
                <p
                  v-if="todo.description"
                  class="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate"
                  :class="{ 'line-through': todo.completed }"
                >
                  {{ todo.description }}
                </p>
              </div>

              <button
                @click="todoStore.deleteTodo(todo.id)"
                class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 focus:outline-none transition-opacity"
              >
                <Icon icon="ph:trash-bold" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </TransitionGroup>

        <!-- 空状态 -->
        <div
          v-if="todoStore.filteredTodos.length === 0"
          class="text-center py-12"
        >
          <Icon
            icon="ph:clipboard-text"
            class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600"
          />
          <p class="mt-4 text-gray-500 dark:text-gray-400">
            {{ todoStore.filter === 'all' ? '开始添加您的第一个任务吧' :
               todoStore.filter === 'active' ? '没有进行中的任务' :
               '没有已完成的任务' }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodoStore } from '../stores/todo'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const todoStore = useTodoStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const newTodo = ref('')

const filters = [
  { label: '所有任务', value: 'all', icon: 'ph:list-bold' },
  { label: '进行中', value: 'active', icon: 'ph:clock-bold' },
  { label: '已完成', value: 'completed', icon: 'ph:check-circle-bold' }
]

const handleAddTodo = async () => {
  if (newTodo.value.trim()) {
    await todoStore.addTodo(newTodo.value.trim())
    newTodo.value = ''
  }
}

onMounted(async () => {
  // 确保用户已认证
  if (authStore.isAuthenticated) {
    await todoStore.fetchTodos()
  }
})
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style> 