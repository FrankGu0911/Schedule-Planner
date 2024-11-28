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
  VERIFY: '/api/v1/auth/verify'  // 假设有这个验证端点
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
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
        // 尝试获取用户信息来验证 token
        const response = await api.get(API_ENDPOINTS.VERIFY)
        this.user = response.data.user
        return true
      } catch (error) {
        console.error('Token verification failed:', error)
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        return false
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(API_ENDPOINTS.LOGIN, {
          username,
          password
        })
        
        if (response.data.token) {
          this.token = response.data.token
          this.user = response.data.user
          localStorage.setItem('token', response.data.token)
          router.push('/')
        } else {
          throw new Error('登录响应中没有token')
        }
      } catch (error) {
        console.error('Login error:', error)
        if (error.response) {
          // 服务器响应的错误
          this.error = error.response.data.error || '登录失败'
        } else if (error.request) {
          // 请求发出但没有收到响应
          this.error = '无法连接到服务器，请检查网络连接'
        } else {
          // 其他错误
          this.error = error.message || '登录过程中发生错误'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(username, password) {
      this.loading = true
      this.error = null
      try {
        // 添加基本的验证
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
        
        if (response.data.token) {
          this.token = response.data.token
          this.user = response.data.user
          localStorage.setItem('token', response.data.token)
          router.push('/')
        } else {
          throw new Error('注册响应中没有token')
        }
      } catch (error) {
        console.error('Registration error:', error)
        if (error.response) {
          // 服务器响应的错误
          this.error = error.response.data.error || '注册失败'
        } else if (error.request) {
          // 请求发出但没有收到响应
          this.error = '无法连接到服务器，请检查网络连接'
        } else {
          // 其他错误
          this.error = error.message || '注册过程中发生错误'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },

    clearError() {
      this.error = null
    }
  }
}) 