import { defineStore } from 'pinia'
import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

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
    filteredTodos: (state) => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.completed)
        case 'completed':
          return state.todos.filter(todo => todo.completed)
        default:
          return state.todos
      }
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

    async addTodo(title, userId = null) {
      try {
        const endpoint = userId 
          ? `${API_ENDPOINTS.USER_TODOS}/${userId}/todos`
          : API_ENDPOINTS.TODOS
        
        const response = await api.post(endpoint, { 
          title,
          completed: false
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

    async updateTodo(id, title) {
      const todo = this.todos.find(t => t.id === id)
      if (!todo) return

      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`

        const response = await api.put(endpoint, {
          title,
          completed: todo.completed
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