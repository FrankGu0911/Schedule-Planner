<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(async () => {
  // 初始化主题
  themeStore.initTheme()
  
  // 验证 token
  if (authStore.token) {
    const isValid = await authStore.verifyToken()
    if (!isValid && router.currentRoute.value.meta.requiresAuth) {
      router.push('/login')
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
