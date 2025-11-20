const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getToken = () => localStorage.getItem('access_token');

const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
      return;
    }

    // Handle 204 No Content (successful delete)
    if (response.status === 204) {
      return { success: true };
    }

    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      // Throw error with the response data for better error handling
      const errorMessage = data.detail || data.error || JSON.stringify(data);
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Make sure the backend is running at ' + API_URL);
    }
    throw error;
  }
};

export const authAPI = {
  login: (email, password) =>
    apiCall('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (userData) =>
    apiCall('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getProfile: () => apiCall('/auth/profile/'),
};

export const studentsAPI = {
  getAll: () => apiCall('/students/list/'),
  getMe: () => apiCall('/students/me/'),
  getById: (id) => apiCall(`/students/list/${id}/`),
  getStrengthsWeaknesses: (id) => apiCall(`/students/list/${id}/strengths-weaknesses/`),
  getWeeklyProgress: (id) => apiCall(`/students/list/${id}/weekly-progress/`),
  create: (data) =>
    apiCall('/students/list/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/list/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/list/${id}/`, { method: 'DELETE' }),
};

export const domainsAPI = {
  getAll: () => apiCall('/students/domains/'),
  create: (data) =>
    apiCall('/students/domains/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/domains/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/domains/${id}/`, { method: 'DELETE' }),
};

export const assessmentsAPI = {
  getAll: () => apiCall('/assessments/'),
  getById: (id) => apiCall(`/assessments/${id}/`),
};

export const coursesAPI = {
  getAll: () => apiCall('/students/courses/'),
  getById: (id) => apiCall(`/students/courses/${id}/`),
  create: (data) =>
    apiCall('/students/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/courses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/courses/${id}/`, { method: 'DELETE' }),
};

export const announcementsAPI = {
  getAll: () => apiCall('/students/announcements/'),
  getById: (id) => apiCall(`/students/announcements/${id}/`),
  create: (data) =>
    apiCall('/students/announcements/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/announcements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/announcements/${id}/`, { method: 'DELETE' }),
};

export const projectsAPI = {
  getAll: () => apiCall('/students/projects/'),
  getById: (id) => apiCall(`/students/projects/${id}/`),
  create: (data) =>
    apiCall('/students/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/projects/${id}/`, { method: 'DELETE' }),
  review: (id, data) =>
    apiCall(`/students/projects/${id}/review/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getNotifications: () => apiCall('/students/projects/notifications/'),
  markNotificationsRead: (projectIds) =>
    apiCall('/students/projects/mark_notifications_read/', {
      method: 'POST',
      body: JSON.stringify({ project_ids: projectIds }),
    }),
};

export const notificationsAPI = {
  getAll: () => apiCall('/students/notifications/'),
  getUnreadCount: () => apiCall('/students/notifications/unread_count/'),
  markRead: (id) =>
    apiCall(`/students/notifications/${id}/mark_read/`, {
      method: 'POST',
    }),
  markAllRead: () =>
    apiCall('/students/notifications/mark_all_read/', {
      method: 'POST',
    }),
};
