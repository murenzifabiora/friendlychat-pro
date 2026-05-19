import axios, { AxiosInstance } from 'axios';

const API_URL = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : 'http://localhost:5001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  register: (username: string, email: string, password: string) =>
    apiClient.post('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data: any) => apiClient.put('/auth/profile', data),

  logout: () => {
    localStorage.removeItem('token');
  },
};

export const userService = {
  getAllUsers: () => apiClient.get('/users'),
  getUser: (id: string) => apiClient.get(`/users/${id}`),
  getContacts: () => apiClient.get('/users/contacts'),
  addContact: (contactId: string) => apiClient.post('/users/add-contact', { contactId }),
  removeContact: (contactId: string) => apiClient.post('/users/remove-contact', { contactId }),
  updateStatus: (status: string) => apiClient.post('/users/status', { status }),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
};

export const chatService = {
  getMessages: (userId: string) => apiClient.get(`/chat/messages/${userId}`),
  sendMessage: (recipientId: string, content: string, type: string = 'text', mediaUrl?: string) =>
    apiClient.post('/chat/send', { recipientId, content, type, mediaUrl }),
  markAsRead: (messageIds: string[]) => apiClient.post('/chat/mark-read', { messageIds }),
  getUnreadCount: () => apiClient.get('/chat/unread-count'),
  uploadMedia: (formData: FormData) =>
    apiClient.post('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const voiceAnalysisService = {
  analyzeVoice: (data: any) => apiClient.post('/voice-analysis', data),
  getHistory: () => apiClient.get('/voice-analysis/history'),
};

export const storyService = {
  createStory: (content: string, image?: string, visibility?: string) =>
    apiClient.post('/stories', { content, image, visibility }),
  getFeed: () => apiClient.get('/stories/feed'),
  getUserStories: (userId: string) => apiClient.get(`/stories/user/${userId}`),
  likeStory: (storyId: string) => apiClient.post(`/stories/${storyId}/like`),
  deleteStory: (storyId: string) => apiClient.delete(`/stories/${storyId}`),
  addComment: (storyId: string, content: string) =>
    apiClient.post(`/stories/${storyId}/comments`, { content }),
  deleteComment: (commentId: string) => apiClient.delete(`/stories/comments/${commentId}`),
  likeComment: (commentId: string) => apiClient.post(`/stories/comments/${commentId}/like`),
};

export const followService = {
  followUser: (userId: string) => apiClient.post(`/follows/${userId}/follow`),
  unfollowUser: (userId: string) => apiClient.delete(`/follows/${userId}/follow`),
  getFollowers: (userId: string) => apiClient.get(`/follows/${userId}/followers`),
  getFollowing: (userId: string) => apiClient.get(`/follows/${userId}/following`),
  isFollowing: (userId: string) => apiClient.get(`/follows/${userId}/is-following`),
};

export const notificationService = {
  getNotifications: (page = 1, limit = 20) =>
    apiClient.get(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (notificationId: string) =>
    apiClient.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => apiClient.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId: string) =>
    apiClient.delete(`/notifications/${notificationId}`),
};

export const storySearchService = {
  search: (q: string) => apiClient.get(`/stories/search?q=${encodeURIComponent(q)}`),
  searchByHashtag: (hashtag: string) =>
    apiClient.get(`/stories/search?hashtag=${encodeURIComponent(hashtag)}`),
  getTrendingHashtags: () => apiClient.get('/stories/trending-hashtags'),
};

export default apiClient;
