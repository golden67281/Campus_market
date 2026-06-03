import api from './axiosInstance';

export const expressInterest = (data) => api.post('/interests', data);
export const getMyInterests = () => api.get('/interests/mine');
export const getProductInterests = (productId) => api.get(`/interests/product/${productId}`);
export const getSellerContact = (productId) => api.get(`/interests/contact/${productId}`);
