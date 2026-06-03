import api from './axiosInstance';

export const getMe = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);
export const checkUsername = (username) => api.get(`/users/check-username?u=${username}`);
export const verifyCollegeEmail = (email) => api.post('/users/verify-college-email', { email });
export const getMyListings = () => api.get('/users/me/listings');
export const getUserListings = (userId) => api.get(`/users/${userId}/listings`);
export const deactivateAccount = () => api.delete('/users/me?action=deactivate');
export const deleteAccount = () => api.delete('/users/me?action=delete');
export const reportListing = (listingId, data) => api.post(`/reports/listing/${listingId}`, data);
