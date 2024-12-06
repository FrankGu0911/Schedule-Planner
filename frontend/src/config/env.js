// 获取当前环境
const isDev = import.meta.env.MODE === 'development'

// 获取当前浏览器地址的主机名和端口
const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location
  if (isDev) {
    // 开发环境使用8080端口，不包含 /api/v1 前缀
    return `${protocol}//${hostname}:8080`
  } else {
    // 生产环境直接使用相对路径，让 Nginx 处理代理
    return ''
  }
}

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
} 