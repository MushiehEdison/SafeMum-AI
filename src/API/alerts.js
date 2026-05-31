import API from './axios'

// ── Send ──────────────────────────────────────────────────────────────────────
export const sendEmergencyAlert = (data) => API.post('/api/emergency', data)
// data: { location: { lat, lng }, type, message, patientId }

export const sendSOSAlert = (data) => API.post('/api/alerts/sos', data)
// data: { location: { lat, lng }, patientId }

// ── Status ────────────────────────────────────────────────────────────────────
export const getAlertStatus  = (id)   => API.get(`/api/alerts/${id}/status`)
export const cancelAlert     = (id)   => API.delete(`/api/alerts/${id}`)
export const getActiveAlerts = ()     => API.get('/api/alerts/active')
export const getAlertHistory = ()     => API.get('/api/alerts/history')

// ── Contacts ──────────────────────────────────────────────────────────────────
export const getEmergencyContacts    = ()     => API.get('/api/alerts/contacts')
export const addEmergencyContact     = (data) => API.post('/api/alerts/contacts', data)
export const updateEmergencyContact  = (id, data) => API.put(`/api/alerts/contacts/${id}`, data)
export const deleteEmergencyContact  = (id)   => API.delete(`/api/alerts/contacts/${id}`)