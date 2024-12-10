<template>
  <div class="task-list">
    <div class="filters-section">
      <div class="status-filters-container">
        <div class="status-filters">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            @click="todoStore.setFilter(filter.value)"
            :class="['filter-btn', { active: todoStore.filter === filter.value }]"
          >
            {{ filter.label }}
            <span v-if="filter.value === 'overdue'" class="overdue-count">
              {{ getOverdueCount() }}
            </span>
          </button>
        </div>
      </div>
      
      <div class="tag-filters">
        <div class="tag-filter-label">标签筛选：</div>
        <div class="tag-filter">
          <Dropdown
            v-model="selectedTag"
            :options="tagOptions"
            placeholder="选择标签"
            :multiple="true"
            @update:modelValue="handleTagFilter"
          />
        </div>
      </div>
    </div>

    <div class="stats-container">
      <div class="completion-stats">
        <span>总计: {{ todoStore.completionStats.total }}</span>
        <span>已完成: {{ todoStore.completionStats.completed }}</span>
        <span>进行中: {{ todoStore.completionStats.active }}</span>
        <span>完成率: {{ todoStore.completionStats.percentage }}%</span>
      </div>
    </div>

    <div class="tasks">
      <div v-for="todo in todoStore.filteredTodos" :key="todo.id" class="task-item">
        <div class="task-content">
          <div class="task-main">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="todoStore.toggleTodo(todo.id)"
              class="task-checkbox"
            />
            <div class="task-info">
              <h3 :class="['task-title', { completed: todo.completed }]">
                {{ todo.title }}
              </h3>
              <p v-if="todo.description" class="task-description">
                {{ todo.description }}
              </p>
              <div class="task-meta">
                <div v-if="todo.start_time || todo.end_time" class="task-time">
                  <span v-if="todo.start_time">开始: {{ formatDateTime(todo.start_time) }}</span>
                  <span v-if="todo.end_time">结束: {{ formatDateTime(todo.end_time) }}</span>
                </div>
                <div v-if="todo.tags && todo.tags.length" class="task-tags">
                  <span 
                    v-for="tag in todo.tags" 
                    :key="tag" 
                    class="tag"
                    :style="{ backgroundColor: getTagColor(tag).bgColor, color: getTagColor(tag).textColor }"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button @click="editTodo(todo)" class="action-btn edit">
              编辑
            </button>
            <button @click="todoStore.deleteTodo(todo.id)" class="action-btn delete">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="showConfirmDialog"
      title="确认编辑"
      message="当前有未保存的内容，是否确定要编辑新的任务？"
      @confirm="handleConfirmEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTodoStore } from '../stores/todo'
import Dropdown from './Dropdown.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const todoStore = useTodoStore()
const selectedTag = ref('')
const showConfirmDialog = ref(false)
const pendingEditTodo = ref(null)

const filters = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已超时', value: 'overdue' }
]

// 格式化日期时间
const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 标签颜色映射
const tagColors = [
  { bgColor: '#E9F5FE', textColor: '#0369A1' }, // 蓝色
  { bgColor: '#F0FDF4', textColor: '#166534' }, // 绿色
  { bgColor: '#FEF3F2', textColor: '#9F1239' }, // 红色
  { bgColor: '#FDF4FF', textColor: '#86198F' }, // 紫色
  { bgColor: '#FFF7ED', textColor: '#9A3412' }, // 橙色
  { bgColor: '#F5F3FF', textColor: '#5B21B6' }  // 靛蓝
]

// 根据标签文本生成固定的颜色
const getTagColor = (tag) => {
  const index = Math.abs(hashCode(tag)) % tagColors.length
  return tagColors[index]
}

// 简单的字符串哈希函数
const hashCode = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

const editTodo = (todo) => {
  emit('edit', todo)
}

// 添加 emit 定义
const emit = defineEmits(['edit'])

// 处理标签筛选
const handleTagFilter = () => {
  todoStore.setTagFilter(selectedTag.value)
}

// 获取超时任务数量
const getOverdueCount = () => {
  const now = new Date()
  return todoStore.todos.filter(todo => {
    if (todo.completed || todo.is_long_term) return false
    if (!todo.end_time) return false
    return new Date(todo.end_time) < now
  }).length
}

// 将标签转换为下拉选项格式
const tagOptions = computed(() => {
  return [
    { label: '全部标签', value: '' },
    ...todoStore.availableTags.map(tag => ({
      label: tag,
      value: tag
    }))
  ]
})
</script>

<style scoped>
.task-list {
  padding: 20px;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.status-filters-container {
  width: 100%;
}

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f7fafc;
}

.filter-btn.active {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.tag-filters {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.tag-filter-label {
  font-size: 0.9rem;
  color: #4a5568;
  white-space: nowrap;
  font-weight: 500;
}

.tag-filter {
  flex: 1;
  min-width: 200px;
  max-width: 800px;
}

.stats-container {
  margin-bottom: 20px;
  padding: 10px;
  background: #f7fafc;
  border-radius: 6px;
}

.completion-stats {
  display: flex;
  gap: 20px;
  color: #4a5568;
  font-size: 0.9rem;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.task-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.task-main {
  display: flex;
  gap: 12px;
  flex: 1;
}

.task-checkbox {
  margin-top: 4px;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
}

.task-title.completed {
  text-decoration: line-through;
  color: #a0aec0;
}

.task-description {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
}

.task-time {
  color: #718096;
  display: flex;
  gap: 12px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  color: #4299e1;
  background: #ebf8ff;
}

.action-btn.edit:hover {
  background: #bee3f8;
}

.action-btn.delete {
  color: #e53e3e;
  background: #fff5f5;
}

.action-btn.delete:hover {
  background: #fed7d7;
}

.overdue-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 6px;
  background-color: #e53e3e;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
}
</style> 