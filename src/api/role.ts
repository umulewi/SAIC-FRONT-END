import client from './client';
import type {
  StaffProfile, Task, AssignedTask, LeaveRequest, LeaveBalance,
  LeaveStats, LeaveTypeCount, StaffMember, RoleInfo, Department, PettyCash, TeamMember,
} from '../types';

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
  payload: { reason: string; start_date: string; end_date: string; leave_type: string }
) {
  const { data } = await client.post(`${apiBase}/leave_requests`, payload);
  return data;
}

export async function getLeaveStatus(apiBase: string): Promise<LeaveRequest[]> {
  const { data } = await client.get(`${apiBase}/leave_status`);
  return data.leave_requests ?? [];
}

export async function getLeaveBalance(apiBase: string): Promise<LeaveBalance[]> {
  const { data } = await client.get(`${apiBase}/leave_balance`);
  return data.balances ?? [];
}

export async function getSubmissionCount(apiBase: string): Promise<number> {
  const { data } = await client.get(`${apiBase}/submission_count`);
  return data.count ?? 0;
}

export async function getMyTeam(apiBase: string): Promise<TeamMember[]> {
  const { data } = await client.get(`${apiBase}/my_team`);
  return data.team ?? [];
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

export async function adminUploadStaffPhoto(staffId: number, formData: FormData) {
  const { data } = await client.patch(`/admin/staff/${staffId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function adminUploadStaffContract(staffId: number, formData: FormData) {
  const { data } = await client.patch(`/admin/staff/${staffId}/contract`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function adminGetStaffDirectory(
  params?: { date_from?: string; date_to?: string }
): Promise<import('../types').DirectoryStaff[]> {
  const { data } = await client.get('/admin/staff-directory', { params });
  return data.staff ?? [];
}

export async function adminGetStaffPerformance(
  staffId: number,
  params?: { date_from?: string; date_to?: string }
): Promise<import('../types').StaffPerformanceDetail> {
  const { data } = await client.get(`/admin/staff/${staffId}/performance`, { params });
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

export async function adminGetLeaveRequests(filters?: {
  status?: string;
  leave_type?: string;
  search?: string;
}): Promise<LeaveRequest[]> {
  const params = new URLSearchParams();
  if (filters?.status)     params.set('status',     filters.status);
  if (filters?.leave_type) params.set('leave_type', filters.leave_type);
  if (filters?.search)     params.set('search',     filters.search);
  const { data } = await client.get(`/admin/leave-management?${params}`);
  return data.leave_requests ?? [];
}

export async function adminGetLeaveStats(): Promise<{ stats: LeaveStats; by_type: LeaveTypeCount[] }> {
  const { data } = await client.get('/admin/leave-management/stats');
  return { stats: data.stats, by_type: data.by_type ?? [] };
}

export async function adminUpdateLeaveStatus(
  id: number,
  status: string,
  rejection_reason?: string
) {
  const { data } = await client.put(`/admin/leave-management/${id}`, { status, rejection_reason });
  return data;
}

// ─── Petty Cash (Accountant) ──────────────────────────────────────────────

export async function getPettyCash(
  apiBase: string,
  filters?: { from_date?: string; to_date?: string; search?: string }
): Promise<PettyCash[]> {
  const params = new URLSearchParams();
  if (filters?.from_date) params.set('from_date', filters.from_date);
  if (filters?.to_date)   params.set('to_date',   filters.to_date);
  if (filters?.search)    params.set('search',    filters.search);
  const qs = params.toString();
  const { data } = await client.get(`${apiBase}/petty_cash${qs ? `?${qs}` : ''}`);
  return data.petty_cash ?? [];
}

export async function createPettyCash(
  apiBase: string,
  payload: FormData
) {
  const { data } = await client.post(`${apiBase}/petty_cash`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updatePettyCash(
  apiBase: string,
  id: number,
  payload: FormData
) {
  const { data } = await client.put(`${apiBase}/petty_cash/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deletePettyCash(apiBase: string, id: number) {
  const { data } = await client.delete(`${apiBase}/petty_cash/${id}`);
  return data;
}

// ─── Petty Cash (Admin) ───────────────────────────────────────────────────

export async function adminGetPettyCash(filters?: {
  search?: string;
  from_date?: string;
  to_date?: string;
}): Promise<{ records: PettyCash[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.search)    params.set('search',    filters.search);
  if (filters?.from_date) params.set('from_date', filters.from_date);
  if (filters?.to_date)   params.set('to_date',   filters.to_date);
  const { data } = await client.get(`/admin/petty-cash?${params}`);
  return { records: data.petty_cash ?? [], total: data.total ?? 0 };
}
