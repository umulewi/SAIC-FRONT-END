import client from './client';
import type { Notification } from '../types';

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
}

export async function getNotifications(): Promise<NotificationsResponse> {
  const { data } = await client.get<NotificationsResponse>('/notifications');
  return data;
}

export async function markAsRead(id: number): Promise<void> {
  await client.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await client.patch('/notifications/read-all');
}

export async function deleteNotification(id: number): Promise<void> {
  await client.delete(`/notifications/${id}`);
}
