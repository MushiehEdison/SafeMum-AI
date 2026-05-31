import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://safemumapi.onrender.com',
  withCredentials: true,  // sends the httpOnly cookie automatically
})

export default API