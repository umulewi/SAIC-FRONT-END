import client from './client';
import type { EnhancedTask, TasksResponse, AnalyticsData } from '../types';

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: string;
  instructions?: string;
  deadline?: string;
  assign_to?: number[];
}

// ─── Task CRUD ────────────────────────────────────────────────────────────────

export async function getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const { data } = await client.get<TasksResponse>(`/tasks?${params}`);
  return data;
}

export async function getTask(id: number): Promise<EnhancedTask> {
  const { data } = await client.get<{ success: boolean; task: EnhancedTask }>(`/tasks/${id}`);
  return data.task;
}

export async function createTask(payload: CreateTaskPayload): Promise<{ task_id: number }> {
  const { data } = await client.post('/tasks', payload);
  return data;
}

export async function updateTask(id: number, payload: Partial<CreateTaskPayload> & { status?: string }): Promise<void> {
  await client.put(`/tasks/${id}`, payload);
}

export async function deleteTask(id: number): Promise<void> {
  await client.delete(`/tasks/${id}`);
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function assignTask(taskId: number, userIds: number[]): Promise<void> {
  await client.post(`/tasks/${taskId}/assign`, { user_ids: userIds });
}

export async function removeAssignee(taskId: number, userId: number): Promise<void> {
  await client.delete(`/tasks/${taskId}/assignees/${userId}`);
}

// ─── Status ───────────────────────────────────────────────────────────────────

export async function updateTaskStatus(taskId: number, status: string): Promise<void> {
  await client.patch(`/tasks/${taskId}/status`, { status });
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitTask(taskId: number, files: File[], comment?: string): Promise<void> {
  const form = new FormData();
  if (comment?.trim()) form.append('comment', comment.trim());
  files.forEach(f => form.append('files', f));
  await client.post(`/tasks/${taskId}/submit`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ─── Review ───────────────────────────────────────────────────────────────────

export async function reviewTask(
  taskId: number,
  decision: 'approved' | 'rejected',
  feedback?: string,
  assignmentId?: number
): Promise<void> {
  await client.post(`/tasks/${taskId}/review`, {
    decision,
    feedback,
    assignment_id: assignmentId,
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(taskId: number, comment: string): Promise<void> {
  await client.post(`/tasks/${taskId}/comments`, { comment });
}

// ─── File Upload ──────────────────────────────────────────────────────────────

export async function uploadTaskFiles(taskId: number, files: File[], fileType = 'attachment'): Promise<void> {
  const form = new FormData();
  form.append('file_type', fileType);
  files.forEach(f => form.append('files', f));
  await client.post(`/tasks/${taskId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  const { data } = await client.get<{ success: boolean; analytics: AnalyticsData }>('/admin/analytics');
  return data.analytics;
}

export async function downloadExport(): Promise<void> {
  const response = await client.get('/admin/analytics/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `saic-tasks-${new Date().toISOString().slice(0,10)}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
