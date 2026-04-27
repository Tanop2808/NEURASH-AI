import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

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

export const generateReport = async (prediction, confidence, allProbabilities, email) => {
  const res = await api.post('/report', {
    prediction,
    confidence,
    all_probabilities: allProbabilities,
    email,
  });
  return res.data;
};

export const sendEmailWithPdf = async (formData) => {
  const res = await api.post('/send-email', formData);
  return res.data;
};

export default api;