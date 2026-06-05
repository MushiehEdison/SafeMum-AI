// src/API/chw.js
import API from './axios'

export const getCHWDashboard = () => API.get('/api/chw/dashboard')
export const getCHWCases = () => API.get('/api/chw/cases')
export const getCHWCaseById = (caseId) => API.get(`/api/chw/cases/${caseId}`)
export const updateCHWCase = (caseId, data) => API.put(`/api/chw/cases/${caseId}`, data)
export const getCHWProfile = () => API.get('/api/chw/profile')
export const updateCHWProfile = (data) => API.put('/api/chw/profile', data)
export const getCHWPatients = () => API.get('/api/chw/patients')
export const getCHWSchedule = () => API.get('/api/chw/schedule')

// ── NEW: Community ─────────────────────────────────────────
export const getCHWCommunityPosts = () => API.get('/api/chw/community')
export const replyToPostAsCHW = (postId, content) =>
  API.post(`/api/chw/community/${postId}/reply`, { content })

// ── NEW: Check-in response ─────────────────────────────────
export const respondToCheckin = (caseId, note) =>
  API.post(`/api/chw/cases/${caseId}/respond-to-checkin`, { note })