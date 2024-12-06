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
    config.url = config.url.replace(/\/$/, '')
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API 端点
const API_ENDPOINTS = {
  TODOS: '/todos',
  USER_TODOS: '/users'
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    filter: 'all', // 'all' | 'active' | 'completed' | 'overdue'
    tagFilter: [], // 标签筛选（数组支持多选）
    loading: false,
    error: null,
    currentUserId: null
  }),

  getters: {
    filteredTodos() {
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
      // 过滤掉超过7天的已完成项
      let result = this.todos.filter(todo => {
        if (todo.completed) {
          const updatedDate = new Date(todo.updated_at);
          return updatedDate >= sevenDaysAgo;
        }
        return true;
      });

      // 根据状态筛选
      switch (this.filter) {
        case 'active':
          result = result.filter(todo => !todo.completed);
          break;
        case 'completed':
          result = result.filter(todo => todo.completed);
          break;
        case 'overdue':
          result = result.filter(todo => {
            if (todo.completed || todo.is_long_term) return false;
            if (!todo.end_time) return false;
            return new Date(todo.end_time) < now;
          });
          break;
      }

      // 标签筛选（持多选）
      if (this.tagFilter.length > 0) {
        result = result.filter(todo => 
          todo.tags?.some(tag => 
            this.tagFilter.some(filterTag => 
              filterTag.toLowerCase() === tag.toLowerCase()
            )
          )
        );
      }

      // 排序：未完成在前，已完成在后
      return result.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
    },

    // 获取所有可用的标签
    availableTags() {
      const tagSet = new Set();
      this.todos.forEach(todo => {
        if (todo.tags) {
          todo.tags.forEach(tag => tagSet.add(tag));
        }
      });
      return Array.from(tagSet).sort();
    },

    // 完成状态统计
    completionStats() {
      const total = this.todos.length;
      const completed = this.todos.filter(todo => todo.completed).length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return {
        total,
        completed,
        active: total - completed,
        percentage
      };
    }
  },

  actions: {
    setFilter(filter) {
      this.filter = filter;
    },

    setTagFilter(tags) {
      this.tagFilter = tags;
    },

    async fetchTodos() {
      this.loading = true;
      try {
        const response = await api.get(API_ENDPOINTS.TODOS);
        this.todos = response.data;
        this.currentUserId = null;
      } catch (error) {
        console.error('Fetch todos error:', error);
        this.error = error.response?.data?.error || '获取待办事项失败';
      } finally {
        this.loading = false;
      }
    },

    async fetchUserTodos(userId) {
      this.loading = true;
      try {
        const response = await api.get(`${API_ENDPOINTS.USER_TODOS}/${userId}/todos`);
        this.todos = response.data;
        this.currentUserId = userId;
      } catch (error) {
        console.error('Fetch user todos error:', error);
        this.error = error.response?.data?.error || '获取用户待办事项失败';
      } finally {
        this.loading = false;
      }
    },

    async addTodo(taskData, userId = null) {
      try {
        const endpoint = userId 
          ? `${API_ENDPOINTS.USER_TODOS}/${userId}/todos`
          : API_ENDPOINTS.TODOS;
        
        const response = await api.post(endpoint, { 
          title: taskData.title,
          description: taskData.description || '',
          is_long_term: taskData.is_long_term ? 1 : 0,
          start_time: taskData.start_time,
          end_time: taskData.end_time,
          tags: taskData.tags
        });
        this.todos.push(response.data);
      } catch (error) {
        console.error('Add todo error:', error);
        this.error = error.response?.data?.error || '添加待办事项失败';
      }
    },

    async toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return;

      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`;

        const response = await api.put(endpoint, {
          title: todo.title,
          completed: !todo.completed
        });
        const index = this.todos.findIndex(t => t.id === id);
        this.todos[index] = response.data;
      } catch (error) {
        console.error('Toggle todo error:', error);
        this.error = error.response?.data?.error || '更新待办事项失败';
      }
    },

    async updateTodo(id, taskData) {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return;

      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`;

        const response = await api.put(endpoint, {
          title: taskData.title,
          description: taskData.description || '',
          is_long_term: taskData.is_long_term ? 1 : 0,
          start_time: taskData.start_time,
          end_time: taskData.end_time,
          tags: taskData.tags,
          completed: taskData.completed !== undefined ? taskData.completed : todo.completed
        });
        const index = this.todos.findIndex(t => t.id === id);
        this.todos[index] = response.data;
      } catch (error) {
        console.error('Update todo error:', error);
        this.error = error.response?.data?.error || '更新待办事项失败';
      }
    },

    async deleteTodo(id) {
      try {
        const endpoint = this.currentUserId
          ? `${API_ENDPOINTS.USER_TODOS}/${this.currentUserId}/todos/${id}`
          : `${API_ENDPOINTS.TODOS}/${id}`;

        await api.delete(endpoint);
        this.todos = this.todos.filter(todo => todo.id !== id);
      } catch (error) {
        console.error('Delete todo error:', error);
        this.error = error.response?.data?.error || '删除待办事项失败';
      }
    },

    clearError() {
      this.error = null;
    }
  }
}) 