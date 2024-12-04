<template>
  <MainLayout>
    <!-- 主内容区 -->
    <div class="max-w-3xl mx-auto">
      <!-- 添加新任务 -->
      <div class="mb-8">
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
            
            <div class="flex-grow">
              <input
                v-model="todo.title"
                @blur="todoStore.updateTodo(todo.id, todo.title)"
                class="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                :class="{ 'line-through text-gray-500 dark:text-gray-400': todo.completed }"
              />
            </div>
            
            <button
              @click="todoStore.deleteTodo(todo.id)"
              class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded transition-opacity duration-200"
            >
              <Icon icon="ph:trash-bold" class="w-5 h-5" />
            </button>
          </div>
        </div>

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
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodoStore } from '../stores/todo'
import MainLayout from '../components/MainLayout.vue'

const todoStore = useTodoStore()
const newTodo = ref('')

const handleAddTodo = async () => {
  if (newTodo.value.trim()) {
    await todoStore.addTodo(newTodo.value.trim())
    newTodo.value = ''
  }
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