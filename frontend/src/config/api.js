// 获取当前浏览器地址的主机名和端口
const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location
  const portString = port ? `:${port}` : ''
  return `${protocol}//${hostname}${portString}/api/v1`
}

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
} 