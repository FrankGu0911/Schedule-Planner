import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  // 初始化时就获取窗口宽度
  const width = ref(window.innerWidth)
  const isMobile = ref(width.value <= 768)
  const isTablet = ref(width.value > 768 && width.value <= 1024)
  const isDesktop = ref(width.value > 1024)

  const onResize = () => {
    width.value = window.innerWidth
    isMobile.value = width.value <= 768
    isTablet.value = width.value > 768 && width.value <= 1024
    isDesktop.value = width.value > 1024
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return {
    width,
    isMobile,
    isTablet,
    isDesktop
  }
} 