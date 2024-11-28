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
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // 如果需要认证但没有 token，重定向到登录页
    next('/login')
  } else if (token && (to.path === '/login' || to.path === '/register')) {
    // 如果已经登录，访问登录或注册页面时重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router 