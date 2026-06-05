import axios from 'axios'

const API = axios.create({
  baseURL: '/',          // ← use Vite proxy, not direct URL
  timeout: 60000, 
  withCredentials: true,
})

export default API