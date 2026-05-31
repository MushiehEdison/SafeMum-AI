import API from './axios'

export const getProfile       = ()     => API.get('/api/patient/profile')
export const updateProfile    = (data) => API.patch('/api/patient/profile', data)
export const getPregnancyTip     = () => API.get('/api/home/tip')
export const getCheckinHistory   = () => API.get('/api/home/checkins/history')
export const getPregnancyHistory = ()     => API.get('/api/patient/pregnancy/history')