import client from './client';
import type { LoginCredentials, LoginResponse } from '../types';

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/login', credentials);
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const { data } = await client.post('/forgot-password', { email });
  return data;
}

export async function resetPasswordApi(token: string, new_password: string): Promise<{ message: string }> {
  const { data } = await client.post('/reset-password', { token, new_password });
  return data;
}
