import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  // Users
  getUsers() {
    return api.get('/users');
  },

  getUser(id) {
    return api.get(`/users/${id}`);
  },

  createUser(userData) {
    return api.post('/users', userData);
  },

  assignManager(userId, managerId) {
    return api.patch(`/users/${userId}/assign-manager`, { managerId });
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`);
  },

  // Vacation Requests
  getVacationRequests(userId) {
    return api.get('/vacation-requests', { params: { userId } });
  },

  createVacationRequest(requestData) {
    return api.post('/vacation-requests', requestData);
  },

  approveVacationRequest(id, managerNotes = '') {
    return api.patch(`/vacation-requests/${id}/approve`, { managerNotes });
  },

  rejectVacationRequest(id, managerNotes = '') {
    return api.patch(`/vacation-requests/${id}/reject`, { managerNotes });
  },

  // Notifications
  sendTestNotification(userId, message = '') {
    return api.post('/notifications/test', { userId, message });
  },

  getNotificationFeed(subscriberId) {
    return api.get(`/notifications/feed/${subscriberId}`);
  }
};
