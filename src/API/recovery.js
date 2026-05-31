import API from './axios'

// ── Check-in ──────────────────────────────────────────────────────────────────
export const getCheckinHistory = ()     => API.get('/api/recovery/checkin')
export const submitCheckin     = (data) => API.post('/api/recovery/checkin', data)
// data: { mood: str, note?: str }

// ── Community posts ───────────────────────────────────────────────────────────
export const getCommunityPosts  = ()       => API.get('/api/recovery/community')
export const createCommunityPost = (data)  => API.post('/api/recovery/community', data)
// data: { content: str }
export const replyToPost        = (id, data) => API.post(`/api/recovery/community/${id}/reply`, data)
// data: { content: str }

// ── Support / counsellors ─────────────────────────────────────────────────────
export const getCounsellors          = ()     => API.get('/api/recovery/counsellors')
export const submitSupportRequest    = (data) => API.post('/api/recovery/support', data)
// data: { type: str, description: str }

export const submitSymptomCheckin = (data) => API.post('/api/recovery/symptom-checkin', data)
// data: { symptoms: [str], note?: str }

export const getRecoveryProgress = () => API.get('/api/recovery/progress')
export const getCheckinQuestions = () => API.get('/api/recovery/checkin/questions')