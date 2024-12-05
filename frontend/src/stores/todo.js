import { defineStore } from 'pinia'
import axios from 'axios'
import { API_CONFIG } from '../config/api'

// 创建 axios 实例
const api = axios.create(API_CONFIG)

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.url = config.url.replace(/\/$/, '')
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API 端点
const API_ENDPOINTS = {
  TODOS: '/api/v1/todos',
  USER_TODOS: '/api/v1/users'
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    filter: 'all', // 'all' | 'active' | 'completed'
    loading: false,
    error: null,
    currentUserId: null
  }),

  getters: {
    filteredTodos() {
      const now = new Date()
      const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
      
      // 将待办事项分类
      const todos = this.todos.reduce((acc, todo) => {
        const startTime = todo.start_time ? new Date(todo.start_time) : null
        const endTime = todo.end_time ? new Date(todo.end_time) : null
        
        if (todo.is_long_term) {
          acc.longTerm.push(todo)
        } else if (startTime) {
          if (startTime <= in12Hours) {
            acc.ongoing.push(todo)
          } else {
            acc.notStarted.push(todo)
          }
        } else {
          acc.notStarted.push(todo)
        }
        return acc
      }, {
        ongoing: [],
        longTerm: [],
        notStarted: []
      })

      // 打印分类后的结果
      console.log('分类结果：')
      console.log('进行中:', todos.ongoing.map(t => t.title))
      console.log('长期任务:', todos.longTerm.map(t => t.title))
      console.log('未开始:', todos.notStarted.map(t => t.title))

      // 对各类任务进行排序
      todos.ongoing.sort((a, b) => {
        const aEnd = a.end_time ? new Date(a.end_time) : new Date('9999-12-31')
        const bEnd = b.end_time ? new Date(b.end_time) : new Date('9999-12-31')
        return aEnd - bEnd
      })

      todos.longTerm.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })

      todos.notStarted.sort((a, b) => {
        const aStart = a.start_time ? new Date(a.start_time) : new Date('9999-12-31')
        const bStart = b.start_time ? new Date(b.start_time) : new Date('9999-12-31')
        return aStart - bStart
      })

      // 打印排序后的结果
      console.log('\n排序后：')
      console.log('进行中:', todos.ongoing.map(t => t.title))
      console.log('长期任务:', todos.longTerm.map(t => t.title))
      console.log('未开始:', todos.notStarted.map(t => t.title))

      // 最终结果
      let result = [...todos.ongoing, ...todos.longTerm, ...todos.notStarted]
      console.log('\n最终顺序:', result.map(t => t.title))

      if (this.filter === 'active') {
        result = result.filter(todo => !todo.completed)
      } else if (this.filter === 'completed') {
        result = result.filter(todo => todo.completed)
      }

      if (this.tagFilter) {
        result = result.filter(todo => 
          todo.tags?.some(tag => tag.toLowerCase().includes(this.tagFilter.toLowerCase()))
        )
      }

      return result
    },
    completionStats: (state) => {
      const total = state.todos.length
      const completed = state.todos.filter(todo => todo.completed).length
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
      return {
        total,
        completed,
        active: total - completed,
        percentage
      }
    }
  },

  actions: {
    async fetchTodos() {
      this.loading = true
      try {
        const response = await api.get(API_ENDPOINTS.TODOS)
        this.todos = response.data
        this.currentUserId = null
      } catch (error) {
        console.error('Fetch todos error:', error)
        this.error = error.response?.data?.error || '获取待办事项失败'
      } finally {
        this.loading = false
      }
    },

    async fetchUserTodos(userId) {
      this.loading = true
      try {
        const response = await api.get(`${API_ENDPOINTS.USER_TODOS}/${userId}/todos`)
        this.todos = response.data
        this.currentUserId = userId
      } catch (error) {
        console.error('Fetch user todos error:', error)
        this.error = error.response?.data?.error || '获取用户待办事项失败'
      } finally {
        this.loading = false
      }
    },

    async addTodo(taskData, userId = null) {
      try {
        const endpoint = userId 
          ? `${API_ENDPOINTS.USER_TODOS}/${userId}/todos`
          : API_ENDPOINTS.TODOS
        
        const response = await api.post(endpoint, { 
          title: taskData.title,
          description: taskData.description || '',
          is_long_term: taskData.is_long_term ? 1 : 0,
          start_time: taskData.start_time,
          end_time: taskData.end_time,
          tags: taskData.tags
        })
        this.todos.push(response.data)
      } catch (error) {
        console.error('Add todo error:', error)
        this.error = error.response?.data?.error || '添加待办事项失败'
      }
    },

    async toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (!todo) return

      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`

        const response = await api.put(endpoint, {
          title: todo.title,
          completed: !todo.completed
        })
        const index = this.todos.findIndex(t => t.id === id)
        this.todos[index] = response.data
      } catch (error) {
        console.error('Toggle todo error:', error)
        this.error = error.response?.data?.error || '更新待办事项失败'
      }
    },

    async updateTodo(id, taskData) {
      const todo = this.todos.find(t => t.id === id)
      if (!todo) return

      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`

        const response = await api.put(endpoint, {
          title: taskData.title,
          description: taskData.description || '',
          is_long_term: taskData.is_long_term ? 1 : 0,
          start_time: taskData.start_time,
          end_time: taskData.end_time,
          tags: taskData.tags,
          completed: taskData.completed !== undefined ? taskData.completed : todo.completed
        })
        const index = this.todos.findIndex(t => t.id === id)
        this.todos[index] = response.data
      } catch (error) {
        console.error('Update todo error:', error)
        this.error = error.response?.data?.error || '更新待办事项失败'
      }
    },

    async deleteTodo(id) {
      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`

        await api.delete(endpoint)
        this.todos = this.todos.filter(todo => todo.id !== id)
      } catch (error) {
        console.error('Delete todo error:', error)
        this.error = error.response?.data?.error || '删除待办事项失败'
      }
    },

    setFilter(filter) {
      this.filter = filter
    },

    clearError() {
      this.error = null
    }
  }
}) 