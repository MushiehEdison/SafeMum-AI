import API from './axios'

export const getNearbyFacilities = (lat, lng, radius = 50) => {
  const params = lat && lng ? `?lat=${lat}&lng=${lng}&radius=999999` : '';
  return API.get(`/api/map/nearby${params}`);
};

export const getFacility = (id) => API.get(`/api/facilities/${id}`)