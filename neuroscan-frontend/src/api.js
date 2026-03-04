import axios from 'axios';

const BASE_URL = 'https://neurash-ai.onrender.com';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (username, password) => {
  const res = await api.post('/login', { username, password });
  return res.data;
};

export const predict = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/predict', form);
  return res.data;
};

export const generateReport = async (prediction, confidence, allProbabilities) => {
  const res = await api.post('/report', {
    prediction,
    confidence,
    all_probabilities: allProbabilities,
  });
  return res.data;
};

export default api;