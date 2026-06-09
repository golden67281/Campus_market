import api from './axiosInstance';

export const getMe = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);
export const changePassword = (currentPassword, newPassword) => api.put('/users/me/password', { currentPassword, newPassword });
export const checkUsername = (username) => api.get(`/users/check-username?u=${username}`);
export const sendVerificationOTP = (email) => api.post('/users/send-verification-otp', { email });
export const verifyCollegeOTP = (otp) => api.post('/users/verify-college-otp', { otp });
export const getMyListings = () => api.get('/users/me/listings');
export const getUserListings = (userId) => api.get(`/users/${userId}/listings`);
export const getUserProfile = (userId) => api.get(`/users/${userId}`);
export const deactivateAccount = () => api.delete('/users/me?action=deactivate');
export const deleteAccount = () => api.delete('/users/me?action=delete');
export const reportListing = (listingId, data) => api.post(`/reports/listing/${listingId}`, data);

// Signup-time email OTP (public — no auth token needed)
export const sendSignupEmailOTP = (email, name) => api.post('/auth/send-signup-email-otp', { email, name });
export const verifySignupEmailOTP = (email, otp) => api.post('/auth/verify-signup-email-otp', { email, otp });
