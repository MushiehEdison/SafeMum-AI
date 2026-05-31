import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://web-production-4ddb1.up.railway.app',
  timeout: 60000, 
  withCredentials: true,  // sends the httpOnly cookie automatically
})

export default API