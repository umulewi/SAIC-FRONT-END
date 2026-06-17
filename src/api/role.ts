import client from './client';
import type { StaffProfile, Task, AssignedTask, LeaveRequest, StaffMember, RoleInfo, Department } from '../types';

// ─── Non-admin role endpoints ─────────────────────────────────────────────

export async function getProfile(apiBase: string): Promise<StaffProfile> {
  const { data } = await client.get(`${apiBase}/profile`);
  return data.profile;
}

export async function getAssignedTasks(apiBase: string): Promise<AssignedTask[]> {
  const { data } = await client.get(`${apiBase}/assigned_tasks`);
  return data.tasks ?? data.assigned_tasks ?? [];
}

export async function submitTask(
  apiBase: string,
  payload: { task_id: number; comment?: string; file_path?: string }
) {
  const { data } = await client.post(`${apiBase}/task_submission`, payload);
  return data;
}

export async function requestLeave(
  apiBase: string,
  payload: { reason: string; start_date: string; end_date: string }
) {
  const { data } = await client.post(`${apiBase}/leave_requests`, payload);
  return data;
}

export async function getLeaveStatus(apiBase: string): Promise<LeaveRequest[]> {
  const { data } = await client.get(`${apiBase}/leave_status`);
  return data.leave_requests ?? [];
}

// ─── Admin — roles & departments ─────────────────────────────────────────

export async function adminGetRoles(): Promise<RoleInfo[]> {
  const { data } = await client.get('/admin/roles');
  return data.roles ?? [];
}

export async function adminGetDepartments(): Promise<Department[]> {
  const { data } = await client.get('/admin/departments');
  return data.departments ?? [];
}

// ─── Admin — staff CRUD ───────────────────────────────────────────────────

/** Fetch all staff, optionally filtered by role_id */
export async function adminGetStaff(roleId?: number): Promise<StaffMember[]> {
  const url = roleId ? `/admin/staff?role_id=${roleId}` : '/admin/staff';
  const { data } = await client.get(url);
  return data.staff ?? [];
}

export async function adminCreateStaff(payload: Record<string, unknown>) {
  const { data } = await client.post('/admin/staff', payload);
  return data;
}

export async function adminUpdateStaff(staffId: number, payload: Record<string, unknown>) {
  const { data } = await client.put(`/admin/staff/${staffId}`, payload);
  return data;
}

export async function adminDeleteStaff(staffId: number) {
  const { data } = await client.delete(`/admin/staff/${staffId}`);
  return data;
}

// ─── Admin — tasks ────────────────────────────────────────────────────────

export async function adminGetTasks(): Promise<Task[]> {
  const { data } = await client.get('/admin/tasks');
  return data.tasks ?? [];
}

export async function adminCreateTask(payload: Partial<Task>) {
  const { data } = await client.post('/admin/tasks', payload);
  return data;
}

export async function adminUpdateTask(id: number, payload: Partial<Task>) {
  const { data } = await client.put(`/admin/tasks/${id}`, payload);
  return data;
}

export async function adminDeleteTask(id: number) {
  const { data } = await client.delete(`/admin/tasks/${id}`);
  return data;
}

// ─── Admin — assigned tasks ───────────────────────────────────────────────

export async function adminGetAssignedTasks(): Promise<AssignedTask[]> {
  const { data } = await client.get('/admin/assigned_tasks');
  return data.assigned_tasks ?? [];
}

export async function adminAssignTask(payload: { task_id: number; assigned_to: number }) {
  const { data } = await client.post('/admin/assigned_tasks', payload);
  return data;
}

export async function adminDeleteAssignedTask(id: number) {
  const { data } = await client.delete(`/admin/assigned_tasks/${id}`);
  return data;
}

// ─── Admin — leave management ─────────────────────────────────────────────

export async function adminGetLeaveRequests(): Promise<LeaveRequest[]> {
  const { data } = await client.get('/admin/leave-management');
  return data.leave_requests ?? [];
}

export async function adminUpdateLeaveStatus(id: number, status: string) {
  const { data } = await client.put(`/admin/leave-management/${id}`, { status });
  return data;
}
