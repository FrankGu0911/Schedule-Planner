<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useTodoStore } from './stores/todo'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const todoStore = useTodoStore()

onBeforeMount(async () => {
  // 初始化主题
  themeStore.initTheme()
  
  // 恢复用户状态
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      
      // 如果用户状态不是active，清除认证信息并跳转到登录页
      if (user.status !== 'active') {
        authStore.clearAuth()
        if (router.currentRoute.value.meta.requiresAuth) {
          router.push('/login')
        }
        return
      }
      
      authStore.token = token
      authStore.user = user
      
      // 如果当前路由需要认证，加载任务数据
      if (router.currentRoute.value.meta.requiresAuth) {
        await todoStore.fetchTodos()
      }
    } catch (error) {
      console.error('Failed to restore user state:', error)
      authStore.clearAuth()
      if (router.currentRoute.value.meta.requiresAuth) {
        router.push('/login')
      }
    }
  } else if (router.currentRoute.value.meta.requiresAuth) {
    router.push('/login')
  }
})
</script>

<style>
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
