import API from './axios'

export const getNearbyFacilities = (lat, lng, radius = 50) => {
  const params = lat && lng ? `?lat=${lat}&lng=${lng}&radius=999999` : '';
  return API.get(`/api/map/nearby${params}`);
};

export const getNearbyFacilitiesWithServiceGap = (lat, lng, options = {}) => {
  const { radius = 50, type = 'all', limit = 100 } = options;
  let url = `/api/facilities/nearby?radius=${radius}&type=${type}&limit=${limit}&service_gap=true`;
  if (lat && lng) {
    url += `&lat=${lat}&lng=${lng}`;
  }
  return API.get(url);
};

export const getServiceGapCounties = async () => {
  const response = await API.get('/api/facilities/service-gap/counties');
  return response;
};

export const getFacility = (id) => API.get(`/api/facilities/${id}`);