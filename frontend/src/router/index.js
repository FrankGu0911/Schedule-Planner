import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/TodoList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/change-password',
      component: () => import('../views/ChangePassword.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user-management',
      component: () => import('../views/UserManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/timeline',
      component: () => import('../views/Timeline.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (to.meta.requiresAuth && (!token || !userStr)) {
    // 如果需要认证但没有token或用户信息，重定向到登录页
    next('/login')
    return
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin) {
    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'admin') {
        // 如果需要管理员权限但用户不是管理员，重定向到首页
        next('/')
        return
      }
    } catch (error) {
      next('/login')
      return
    }
  }
  
  // 如果已登录，访问登录或注册页面时重定向到首页
  if (token && userStr && (to.path === '/login' || to.path === '/register')) {
    next('/')
    return
  }
  
  next()
})

export default router 