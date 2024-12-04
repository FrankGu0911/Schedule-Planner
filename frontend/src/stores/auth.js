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
  CHANGE_PASSWORD: '/api/v1/auth/password'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    message: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    username: (state) => state.user?.username,
    isAdmin: (state) => state.user?.role === 'admin',
    userStatus: (state) => state.user?.status || 'inactive'
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
      this.message = null
      try {
        const response = await api.post(API_ENDPOINTS.LOGIN, {
          username,
          password
        })
        
        if (response.data?.token && response.data?.user) {
          const { token, user } = response.data
          this.token = token
          this.user = user
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          if (user.status !== 'active') {
            this.error = '账号未激活，请等待管理员审核'
            this.clearAuth()
            return false
          }
          
          router.push('/')
          return true
        }
        throw new Error(response.data?.error || '登录失败')
      } catch (error) {
        console.error('Login error:', error)
        this.clearAuth()
        if (error.response?.data?.error) {
          this.error = error.response.data.error
        } else if (error.response?.status === 401) {
          this.error = '用户名或密码错误'
        } else if (error.response?.status === 403) {
          this.error = '账号未激活，请等待管理员审核'
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
      this.message = null
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
        
        if (response.data?.user) {
          this.message = response.data.message || '注册成功，请等待管理员审核'
          router.push('/login')
          return true
        }
        throw new Error(response.data?.error || '注册失败')
      } catch (error) {
        console.error('Registration error:', error)
        if (error.response?.data?.error) {
          this.error = error.response.data.error
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

    async changePassword(oldPassword, newPassword) {
      this.loading = true
      this.error = null
      try {
        if (!newPassword || newPassword.length < 6) {
          throw new Error('新密码至少需要6个字符')
        }

        const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, {
          old_password: oldPassword,
          new_password: newPassword
        })
        
        if (response.data?.message) {
          return true
        }
        throw new Error(response.data?.error || '修改密码失败')
      } catch (error) {
        console.error('Change password error:', error)
        if (error.response?.data?.error) {
          this.error = error.response.data.error
        } else if (error.request) {
          this.error = '无法连接到服务器，请检查网络连接'
        } else {
          this.error = error.message || '修改密码过程中发生错误'
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
      this.message = null
    }
  }
}) 