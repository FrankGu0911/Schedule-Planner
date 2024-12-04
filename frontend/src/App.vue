<template>
  <router-view></router-view>
  <ToastContainer />
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useTodoStore } from './stores/todo'
import ToastContainer from './components/ToastContainer.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const todoStore = useTodoStore()

onBeforeMount(async () => {
  // 初始化主题
  themeStore.initTheme()
  
  // 检查认证状态
  if (!authStore.isAuthenticated) {
    // 如果没有认证，且当前路由需要认证，则跳转到登录页
    if (router.currentRoute.value.meta.requiresAuth) {
      router.replace('/login')
    }
    return
  }
  
  // 如果用户状态不是 active，清除认证信息并跳转到登录页
  if (authStore.user?.status !== 'active') {
    authStore.logout()
    if (router.currentRoute.value.meta.requiresAuth) {
      router.replace('/login')
    }
    return
  }
  
  // 如果当前路由需要认证，加载任务数据
  if (router.currentRoute.value.meta.requiresAuth) {
    try {
      await todoStore.fetchTodos()
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      // 如果获取数据失败，可能是 token 过期，清除认证信息
      authStore.logout()
      router.replace('/login')
    }
  }
})
</script>

<style>
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
