import { apiClient } from './apiClient';

export const login = async (credentials: any) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const register = async (credentials: any) => {
  const { data } = await apiClient.post('/auth/register', credentials);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};
