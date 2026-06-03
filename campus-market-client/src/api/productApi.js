import api from './axiosInstance';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const markSold = (id) => api.put(`/products/${id}/mark-sold`);
export const renewListing = (id) => api.put(`/products/${id}/renew`);
export const incrementView = (id) => api.post(`/products/${id}/view`);
export const searchProducts = (params) => api.get('/products/search', { params });
export const uploadImage = (formData) => api.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
