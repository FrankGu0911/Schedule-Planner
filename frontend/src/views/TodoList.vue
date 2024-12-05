<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto">
      <!-- 添加任务按钮 -->
      <div class="mb-4 sm:mb-6">
        <button
          v-if="!showTaskEditor"
          @click="showTaskEditor = true"
          class="w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        >
          <Icon icon="ph:plus-circle" class="w-5 h-5 mr-2 text-gray-400" />
          <span class="text-gray-600 dark:text-gray-400">添加任务</span>
        </button>

        <!-- 任务编辑器 -->
        <TaskEditor
          v-else
          :task="editingTodo"
          :loading="todoStore.loading"
          @submit="handleTaskSubmit"
          @cancel="() => {
            showTaskEditor = false
            editingTodo = null
          }"
        />
      </div>

      <!-- 筛选器和统计 -->
      <div class="mb-4 sm:mb-6 space-y-4">
        <!-- 第一：筛选器 -->
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- 状态筛选 -->
          <div class="flex items-center gap-2 sm:w-48 flex-shrink-0">
            <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">状态：</span>
            <div class="flex-1">
              <Dropdown
                v-model="todoStore.filter"
                :options="statusOptions"
                placeholder="选择状态"
              />
            </div>
          </div>

          <!-- 标签筛选 -->
          <div class="flex items-start gap-2 flex-1 max-w-xl">
            <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap mt-2">标签：</span>
            <div class="flex-1 min-w-0">
              <Dropdown
                v-model="selectedTags"
                :options="tagOptions"
                multiple
                placeholder="选择标签"
              />
            </div>
          </div>
        </div>

        <!-- 第二行：统计信息 -->
        <div class="flex flex-wrap items-center gap-4 text-sm border-t dark:border-gray-700 pt-4">
          <div class="flex items-center space-x-1">
            <Icon icon="ph:list-numbers" class="w-4 h-4 text-gray-400" />
            <span class="text-gray-600 dark:text-gray-400">
              总计: {{ todoStore.completionStats.total }}
            </span>
          </div>
          <div class="flex items-center space-x-1">
            <Icon icon="ph:check-circle" class="w-4 h-4 text-green-500" />
            <span class="text-green-600 dark:text-green-400">
              已完成: {{ todoStore.completionStats.completed }}
            </span>
          </div>
          <div class="flex items-center space-x-1">
            <Icon icon="ph:clock" class="w-4 h-4 text-blue-500" />
            <span class="text-blue-600 dark:text-blue-400">
              进行中: {{ todoStore.completionStats.active }}
            </span>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">总体进度</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ todoStore.completionStats.percentage }}%</span>
        </div>
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary-500 transition-all duration-300"
            :style="{ width: todoStore.completionStats.percentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- 任务列表 -->
      <TransitionGroup
        name="list"
        tag="div"
        class="space-y-3 sm:space-y-4"
      >
        <TodoItem
          v-for="todo in todoStore.filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="todoStore.toggleTodo(todo.id)"
          @edit="handleEditTodo(todo)"
          @delete="todoStore.deleteTodo(todo.id)"
        />

        <!-- 空状态 -->
        <div
          v-if="todoStore.filteredTodos.length === 0"
          class="text-center py-8 sm:py-12"
        >
          <Icon
            icon="ph:clipboard-text"
            class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-600"
          />
          <p class="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {{ todoStore.filter === 'all' ? '开始添加您的第一个任务吧' :
               todoStore.filter === 'active' ? '没有进行中的任务' :
               todoStore.filter === 'completed' ? '没有已完成的任务' :
               todoStore.filter === 'overdue' ? '没有已超时的任务' :
               '没有符合条件的任务' }}
          </p>
        </div>
      </TransitionGroup>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodoStore } from '../stores/todo'
import MainLayout from '../components/MainLayout.vue'
import TaskEditor from '../components/TaskEditor.vue'
import TodoItem from '../components/TodoItem.vue'
import Dropdown from '../components/Dropdown.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const todoStore = useTodoStore()
const showTaskEditor = ref(false)
const editingTodo = ref(null)
const selectedTags = ref([])

// 计算超时任务数量
const overdueCount = computed(() => {
  const now = new Date()
  return todoStore.todos.filter(todo => {
    if (todo.completed || todo.is_long_term) return false
    if (!todo.end_time) return false
    return new Date(todo.end_time) < now
  }).length
})

// 状态选项
const statusOptions = computed(() => [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: `已超时 (${overdueCount.value})`, value: 'overdue' }
])

// 标签选项
const tagOptions = computed(() => {
  return todoStore.availableTags.map(tag => ({
    label: tag,
    value: tag
  }))
})

// 监听标签选择变化
watch(selectedTags, (newTags) => {
  todoStore.setTagFilter(newTags)
}, { deep: true })

onMounted(() => {
  const userId = route.query.userId
  if (userId) {
    todoStore.fetchUserTodos(userId)
  } else {
    todoStore.fetchTodos()
  }
})

const handleTaskSubmit = async (taskData) => {
  const userId = route.query.userId
  if (editingTodo.value) {
    await todoStore.updateTodo(editingTodo.value.id, taskData)
    editingTodo.value = null
  } else {
    await todoStore.addTodo(taskData, userId)
  }
  showTaskEditor.value = false
}

const handleEditTodo = (todo) => {
  editingTodo.value = todo
  showTaskEditor.value = true
}
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
  width: 100%;
}
</style> 