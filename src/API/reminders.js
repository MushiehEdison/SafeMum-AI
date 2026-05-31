import API from './axios'

export const getReminders     = ()           => API.get('/api/reminders/')
export const createReminder   = (data)       => API.post('/api/reminders/', data)
export const updateReminder   = (id, data)   => API.patch(`/api/reminders/${id}`, data)
export const completeReminder = (id)         => API.post(`/api/reminders/${id}/complete`)
export const deleteReminder   = (id)         => API.delete(`/api/reminders/${id}`)