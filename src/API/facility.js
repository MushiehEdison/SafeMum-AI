// src/API/facility.js
import API from './axios'

export const getFacilityDashboard       = () => API.get('/api/facility/dashboard')
export const getFacilityAlerts          = () => API.get('/api/facility/alerts')
export const respondToAlert             = (alertId, data) => API.put(`/api/facility/alerts/${alertId}/respond`, data)
export const getFacilityReferrals       = () => API.get('/api/facility/referrals')
export const updateFacilityReferral     = (referralId, data) => API.put(`/api/facility/referrals/${referralId}`, data)
export const updateFacilityCapabilities = (data) => API.put('/api/facility/capabilities', data)
export const getFacilityProfile         = () => API.get('/api/facility/profile')
export const updateFacilityProfile      = (data) => API.put('/api/facility/profile', data)