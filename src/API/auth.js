import API from './axios'

// ── Patient ───────────────────────────────────────────────────────────────────
export const registerPatient  = (data) => API.post('/api/patient/auth/register', data)
export const loginPatient     = (data) => API.post('/api/patient/auth/login', data)
export const getPatientMe     = ()     => API.get('/api/patient/auth/me')
export const logoutPatient    = ()     => API.post('/api/patient/auth/logout')
export const refreshPatient   = ()     => API.post('/api/patient/auth/refresh')

// ── CHW ───────────────────────────────────────────────────────────────────────
export const registerCHW  = (data) => API.post('/api/chw/auth/register', data)
export const loginCHW     = (data) => API.post('/api/chw/auth/login', data)
export const getCHWMe     = ()     => API.get('/api/chw/auth/me')

// ── Facility ──────────────────────────────────────────────────────────────────
// export const registerFacility = (data) => API.post('/api/facility/auth/register', data)
// export const loginFacility    = (data) => API.post('/api/facility/auth/login', data)
// export const getFacilityMe    = ()     => API.get('/api/facility/auth/me')

// ── Admin ─────────────────────────────────────────────────────────────────────
// export const loginAdmin = (data) => API.post('/api/admin/auth/login', data)