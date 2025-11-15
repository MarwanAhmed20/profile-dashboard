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
      throw new Error(data.detail || data.error || JSON.stringify(data) || 'Request failed');
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
  login: (username, password) =>
    apiCall('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  
  register: (userData) =>
    apiCall('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getProfile: () => apiCall('/auth/profile/'),
};

export const studentsAPI = {
  getAll: () => apiCall('/students/'),
  getMe: () => apiCall('/students/me/'),
  getById: (id) => apiCall(`/students/${id}/`),
  create: (data) =>
    apiCall('/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/${id}/`, { method: 'DELETE' }),
};

export const domainsAPI = {
  getAll: () => apiCall('/students/domains'),
};

export const assessmentsAPI = {
  getAll: () => apiCall('/assessments/'),
  getById: (id) => apiCall(`/assessments/${id}/`),
};
