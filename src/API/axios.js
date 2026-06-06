import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000, 
  withCredentials: true,
})

export default API