// 获取当前浏览器地址的主机名和端口
const getBaseUrl = () => {
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:8080`
}

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
} 