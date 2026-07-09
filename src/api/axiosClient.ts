// CrimeSphere AI — Axios Client
// Configured for FastAPI backend integration

import axios from 'axios';

// Replace with your FastAPI server URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach auth token
axiosClient.interceptors.request.use(
  (config) => {
    // TODO: Pull token from secure storage
    // const token = await SecureStore.getItemAsync('auth_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Trigger logout / token refresh
    }
    return Promise.reject(error);
  }
);
