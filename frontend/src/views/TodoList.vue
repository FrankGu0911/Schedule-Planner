<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto">
      <!-- 添加任务按钮 -->
      <div class="mb-6">
        <button
          v-if="!showTaskEditor"
          @click="showTaskEditor = true"
          class="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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

      <!-- 筛选器 -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">状态：</span>
          <select
            v-model="todoStore.filter"
            class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">全部</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        <!-- 统计信息 -->
        <div class="flex items-center space-x-4 text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            总计: {{ todoStore.completionStats.total }}
          </span>
          <span class="text-green-600 dark:text-green-400">
            已完成: {{ todoStore.completionStats.completed }}
          </span>
          <span class="text-blue-600 dark:text-blue-400">
            进行中: {{ todoStore.completionStats.active }}
          </span>
        </div>
      </div>

      <!-- 任务列表 -->
      <TransitionGroup
        name="list"
        tag="div"
        class="space-y-4"
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
      </TransitionGroup>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodoStore } from '../stores/todo'
import MainLayout from '../components/MainLayout.vue'
import TaskEditor from '../components/TaskEditor.vue'
import TodoItem from '../components/TodoItem.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const todoStore = useTodoStore()
const showTaskEditor = ref(false)
const editingTodo = ref(null)

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
}
</style> 