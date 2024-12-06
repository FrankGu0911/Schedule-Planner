import { defineStore } from 'pinia'
import axios from 'axios'
import { API_CONFIG } from '../config/env'

// 创建 axios 实例
const api = axios.create(API_CONFIG)

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const useAuthStore = defineStore('auth', {
  state: () => {
    // 尝试从 localStorage 恢复用户状态
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    let user = null
    
    try {
      if (userStr) {
        user = JSON.parse(userStr)
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
    
    return {
      token: token || null,
      user: user || null
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    username: (state) => state.user?.username,
    role: (state) => state.user?.role
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post('/api/v1/auth/login', {
          username,
          password
        })

        const { token, user } = response.data
        
        // 保存到 store
        this.token = token
        this.user = user
        
        // 保存到 localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return true
      } catch (error) {
        console.error('Login error:', error)
        throw error.response?.data?.error || '登录失败'
      }
    },

    async register(username, password) {
      try {
        const response = await api.post('/api/v1/auth/register', {
          username,
          password
        })
        return response.data
      } catch (error) {
        console.error('Register error:', error)
        throw error.response?.data?.error || '注册失败'
      }
    },

    async changePassword(oldPassword, newPassword) {
      try {
        await api.put('/api/v1/auth/password', {
          old_password: oldPassword,
          new_password: newPassword
        })
      } catch (error) {
        console.error('Change password error:', error)
        throw error.response?.data?.error || '修改密码失败'
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}) 