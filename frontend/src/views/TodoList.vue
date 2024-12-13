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
        <Transition name="fade">
          <TaskEditor
            v-if="showTaskEditor"
            ref="taskEditorRef"
            :task="editingTodo"
            :loading="todoStore.loading"
            @submit="handleTaskSubmit"
            @cancel="handleEditorCancel"
          />
        </Transition>
      </div>

      <!-- 筛选器和统计 -->
      <div class="mb-4 sm:mb-6 space-y-4">
        <!-- 第一行：筛选器 -->
        <div class="flex items-center gap-6">
          <!-- 状态筛选 -->
          <div class="w-[180px] flex-shrink-0">
            <Dropdown
              v-model="todoStore.filter"
              :options="statusOptions"
              placeholder="选择状态"
            />
          </div>

          <!-- 标签筛选 -->
          <div class="flex-1">
            <Dropdown
              v-model="selectedTags"
              :options="tagOptions"
              multiple
              placeholder="选择标签"
            />
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
          @toggle-star="todoStore.toggleStarred(todo.id)"
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
               todoStore.filter === 'starred' ? '没有星标任务' :
               '没有符合条件的任务' }}
          </p>
        </div>
      </TransitionGroup>
    </div>
    <el-dialog
      v-model="dialogVisible"
      :title="formatDialogTitle"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <!-- 对话内容 -->
    </el-dialog>

    <!-- 添加确认对话框 -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="确认编辑"
      message="当前有未保存的内容，是否确定要编辑新的任务？"
      @confirm="handleConfirmEdit"
    />
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodoStore } from '../stores/todo'
import MainLayout from '../components/MainLayout.vue'
import TaskEditor from '../components/TaskEditor.vue'
import TodoItem from '../components/TodoItem.vue'
import Dropdown from '../components/Dropdown.vue'
import { useRoute } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const todoStore = useTodoStore()
const showTaskEditor = ref(false)
const editingTodo = ref(null)
const selectedTags = ref([])
const dialogVisible = ref(false)
const currentDate = ref(new Date())
const taskEditorRef = ref(null)
const showConfirmDialog = ref(false)
const pendingEditTodo = ref(null)

// 计算超时任务数量
const overdueCount = computed(() => {
  const now = new Date()
  return todoStore.todos.filter(todo => {
    if (todo.completed || todo.is_long_term) return false
    if (!todo.end_time) return false
    return new Date(todo.end_time + 'Z') < now
  }).length
})

// 状态选项
const statusOptions = computed(() => [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: `已超时 (${overdueCount.value})`, value: 'overdue' },
  { label: '星标任务', value: 'starred' }
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
  if (editingTodo.value) {
    await todoStore.updateTodo(editingTodo.value.id, taskData)
    editingTodo.value = null
  } else {
    await todoStore.addTodo(taskData)
  }
  showTaskEditor.value = false
}

const handleEditorCancel = () => {
  showTaskEditor.value = false
  nextTick(() => {
    editingTodo.value = null
  })
}

const handleEditTodo = (todo) => {
  // 检查是否有未保存的内容
  if (showTaskEditor.value && taskEditorRef.value?.hasUnsavedContent()) {
    pendingEditTodo.value = todo
    showConfirmDialog.value = true
  } else {
    editingTodo.value = { ...todo }
    showTaskEditor.value = true
    nextTick(() => {
      const editorElement = taskEditorRef.value?.$el
      if (editorElement) {
        const headerHeight = 64
        const marginTop = 20
        const targetPosition = editorElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - marginTop
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    })
  }
}

// 处理确认编辑
const handleConfirmEdit = () => {
  if (pendingEditTodo.value) {
    editingTodo.value = { ...pendingEditTodo.value }
    showTaskEditor.value = true
    pendingEditTodo.value = null
    nextTick(() => {
      const editorElement = taskEditorRef.value?.$el
      if (editorElement) {
        const headerHeight = 64
        const marginTop = 20
        const targetPosition = editorElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - marginTop
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    })
  }
}

// 添加计算属性用于对话框标题
const formatDialogTitle = computed(() => {
  if (!dialogVisible) return ''
  const date = new Date(currentDate.value + 'Z')
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
})

// 处理对话框关闭
const handleDialogClose = (done) => {
  dialogVisible.value = false
  // 使用nextTick确保DOM更新后再重置数据
  nextTick(() => {
    currentDate.value = new Date()
  })
  done()
}

// 清空标签���择
const clearTags = () => {
  selectedTags.value = []
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