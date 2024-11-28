import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

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
    // 确保 URL 末尾没有斜杠
    config.url = config.url.replace(/\/$/, '')
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 如果收到 401 未授权响应，清除本地存储的认证信息
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// API 端点
const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  VERIFY: '/api/v1/auth/verify'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    username: (state) => state.user?.username
  },

  actions: {
    async verifyToken() {
      if (!this.token) {
        return false
      }

      try {
        const response = await api.get(API_ENDPOINTS.VERIFY)
        if (response.data && response.data.user) {
          this.user = response.data.user
          localStorage.setItem('user', JSON.stringify(response.data.user))
          return true
        }
        this.clearAuth()
        return false
      } catch (error) {
        console.error('Token verification failed:', error)
        this.clearAuth()
        return false
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(API_ENDPOINTS.LOGIN, {
          username,
          password
        })
        
        if (response.data && response.data.token) {
          this.token = response.data.token
          this.user = response.data.user || { username }
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          router.push('/')
          return true
        }
        throw new Error('登录失败')
      } catch (error) {
        console.error('Login error:', error)
        this.clearAuth()
        if (error.response) {
          this.error = error.response.data?.message || '登录失败'
        } else if (error.request) {
          this.error = '无法连接到服务器，请检查网络连接'
        } else {
          this.error = error.message || '登录过程中发生错误'
        }
        return false
      } finally {
        this.loading = false
      }
    },

    async register(username, password) {
      this.loading = true
      this.error = null
      try {
        if (!username || username.length < 3) {
          throw new Error('用户名至少需要3个字符')
        }
        if (!password || password.length < 6) {
          throw new Error('密码至少需要6个字符')
        }

        const response = await api.post(API_ENDPOINTS.REGISTER, {
          username,
          password
        })
        
        if (response.data && response.data.token) {
          this.token = response.data.token
          this.user = response.data.user || { username }
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          router.push('/')
          return true
        }
        throw new Error('注册失败')
      } catch (error) {
        console.error('Registration error:', error)
        this.clearAuth()
        if (error.response) {
          this.error = error.response.data?.message || '注册失败'
        } else if (error.request) {
          this.error = '无法连接到服务器，请检查网络连接'
        } else {
          this.error = error.message || '注册过程中发生错误'
        }
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.clearAuth()
      router.push('/login')
    },

    clearError() {
      this.error = null
    }
  }
}) 