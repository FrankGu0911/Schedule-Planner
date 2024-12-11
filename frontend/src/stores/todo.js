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
    filter: 'all', // all, active, completed, overdue, starred
    tagFilter: [], // 标签筛选
    loading: false,
    error: null,
    currentUserId: null
  }),

  getters: {
    filteredTodos() {
      let result = [...this.todos];

      // 状态筛选
      switch (this.filter) {
        case 'active':
          result = result.filter(todo => !todo.completed);
          break;
        case 'completed':
          result = result.filter(todo => todo.completed);
          break;
        case 'overdue':
          result = result.filter(todo => {
            if (todo.completed || todo.is_long_term || !todo.end_time) return false;
            return new Date(todo.end_time + 'Z') < new Date();
          });
          break;
        case 'starred':
          result = result.filter(todo => todo.is_starred);
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

      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // 添加任务状态标记
      result = result.map(todo => {
        const startTime = todo.start_time ? new Date(todo.start_time + 'Z') : null;
        const endTime = todo.end_time ? new Date(todo.end_time + 'Z') : null;
        const isStarted = startTime && startTime <= now;
        
        return {
          ...todo,
          isOverdue: !todo.completed && !todo.is_long_term && endTime && endTime < now,
          isEndingSoon: !todo.completed && !todo.is_long_term && isStarted && endTime && endTime > now && endTime <= next24h,
          isStartingSoon: !todo.completed && !todo.is_long_term && startTime && startTime > now && startTime <= next24h
        };
      });
      
      // 对任务进行分类
      const overdueTasks = result.filter(todo => todo.isOverdue);

      const inProgressTasks = result.filter(todo => {
        const startTime = todo.start_time ? new Date(todo.start_time + 'Z') : null;
        const endTime = todo.end_time ? new Date(todo.end_time + 'Z') : null;
        return !todo.completed && !todo.is_long_term && startTime && startTime <= now && (!endTime || endTime >= now);
      });

      const upcomingTasks = result.filter(todo => todo.isStartingSoon);

      const longTermTasks = result.filter(todo => 
        !todo.completed && todo.is_long_term
      );

      const notStartedTasks = result.filter(todo => {
        const startTime = todo.start_time ? new Date(todo.start_time + 'Z') : null;
        return !todo.completed && !todo.is_long_term && startTime && startTime > next24h;
      });

      const completedTasks = result.filter(todo => todo.completed);

      // 按指定顺序合并所有任务
      const sortedResult = [
        ...overdueTasks.sort((a, b) => new Date(a.end_time + 'Z') - new Date(b.end_time + 'Z')),
        ...inProgressTasks.sort((a, b) => new Date(a.end_time + 'Z') - new Date(b.end_time + 'Z')),
        ...upcomingTasks.sort((a, b) => new Date(a.start_time + 'Z') - new Date(b.start_time + 'Z')),
        ...longTermTasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        ...notStartedTasks.sort((a, b) => new Date(a.start_time + 'Z') - new Date(b.start_time + 'Z')),
        ...completedTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      ];

      return sortedResult;
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

    async addTodo(todoData, userId = null) {
      this.loading = true;
      try {
        const endpoint = userId ? `${API_ENDPOINTS.USER_TODOS}/${userId}/todos` : API_ENDPOINTS.TODOS;
        const response = await api.post(endpoint, {
          ...todoData,
          is_starred: todoData.is_starred || false
        });
        this.todos.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Add todo error:', error);
        this.error = error.response?.data?.error || '添加待办事项失败';
        throw error;
      } finally {
        this.loading = false;
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

    async updateTodo(id, todoData) {
      this.loading = true;
      try {
        const response = await api.put(`${API_ENDPOINTS.TODOS}/${id}`, todoData);
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
          this.todos[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Update todo error:', error);
        this.error = error.response?.data?.error || '更新待办事项失败';
        throw error;
      } finally {
        this.loading = false;
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

    async toggleStarred(id) {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return;
      
      try {
        const response = await api.put(`${API_ENDPOINTS.TODOS}/${id}`, {
          is_starred: !todo.is_starred
        });
        const index = this.todos.findIndex(t => t.id === id);
        if (index !== -1) {
          this.todos[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Toggle starred error:', error);
        this.error = error.response?.data?.error || '更新星标状态失败';
        throw error;
      }
    },

    clearError() {
      this.error = null;
    }
  }
}) 