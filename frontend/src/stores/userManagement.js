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
  USERS: '/api/v1/admin/users',
  ACTIVATE_USER: (id) => `/api/v1/admin/users/${id}/activate`,
  BLOCK_USER: (id) => `/api/v1/admin/users/${id}/block`,
  CHANGE_ROLE: (id) => `/api/v1/admin/users/${id}/role`,
  RESET_PASSWORD: (id) => `/api/v1/admin/users/${id}/password`
}

export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchUsers(status = '', role = '') {
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (role) params.append('role', role)

        const response = await api.get(API_ENDPOINTS.USERS + (params.toString() ? `?${params.toString()}` : ''))
        if (response.data?.users) {
          this.users = response.data.users
        }
      } catch (error) {
        console.error('Fetch users error:', error)
        this.error = error.response?.data?.error || '获取用户列表失败'
      } finally {
        this.loading = false
      }
    },

    async activateUser(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(API_ENDPOINTS.ACTIVATE_USER(userId))
        if (response.data?.user) {
          const index = this.users.findIndex(u => u.id === userId)
          if (index !== -1) {
            this.users[index] = response.data.user
          }
        }
      } catch (error) {
        console.error('Activate user error:', error)
        this.error = error.response?.data?.error || '激活用户失败'
      } finally {
        this.loading = false
      }
    },

    async blockUser(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(API_ENDPOINTS.BLOCK_USER(userId))
        if (response.data?.user) {
          const index = this.users.findIndex(u => u.id === userId)
          if (index !== -1) {
            this.users[index] = response.data.user
          }
        }
      } catch (error) {
        console.error('Block user error:', error)
        this.error = error.response?.data?.error || '禁用用户失败'
      } finally {
        this.loading = false
      }
    },

    async changeRole(userId, newRole) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(API_ENDPOINTS.CHANGE_ROLE(userId), { role: newRole })
        if (response.data?.user) {
          const index = this.users.findIndex(u => u.id === userId)
          if (index !== -1) {
            this.users[index] = response.data.user
          }
        }
      } catch (error) {
        console.error('Change role error:', error)
        this.error = error.response?.data?.error || '修改用户角色失败'
      } finally {
        this.loading = false
      }
    },

    async resetPassword(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(API_ENDPOINTS.RESET_PASSWORD(userId), {
          password: '123456' // 默认密码
        })
        if (response.data?.message) {
          alert('密码已重置为：123456')
        }
      } catch (error) {
        console.error('Reset password error:', error)
        this.error = error.response?.data?.error || '重置密码失败'
      } finally {
        this.loading = false
      }
    }
  }
}) 