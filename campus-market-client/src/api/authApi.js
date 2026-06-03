import api from './axiosInstance';

export const checkMobile = (mobile) => api.post('/auth/check-mobile', { mobile });
export const getSecurityQuestion = (mobile) => api.post('/auth/security-question', { mobile });
export const sendOtp = (mobile) => api.post('/auth/send-otp', { mobile });
export const verifyOtp = (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp });
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const forgotPassword = (mobile) => api.post('/auth/forgot-password', { mobile });
export const resetPassword = (data) => api.put('/auth/reset-password', data);
