import client from './client';
import type { LoginCredentials, LoginResponse } from '../types';

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/login', credentials);
  return data;
}
