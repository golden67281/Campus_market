import api from './axiosInstance';

export const getConversations = () => {
  return api.get('/chats');
};

export const getChatHistory = (productId, partnerId) => {
  return api.get(`/chats/${productId}/${partnerId}`);
};

export const sendMessage = (payload) => {
  return api.post('/chats', payload);
};
