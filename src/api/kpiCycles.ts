import client from './client';

export interface EvalSchedule {
  id: number;
  name: string;
  days_of_week: string; // comma-separated: "1,4" = Mon,Thu (0=Sun..6=Sat)
  start_time: string;   // "09:00:00"
  end_time: string;     // "17:00:00"
  scope: 'all' | 'departments';
  is_active: number;
  created_by?: number;
  created_at?: string;
}

export interface KpiCycle {
  id: number;
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  status: 'draft' | 'scheduled' | 'open' | 'closed';
  scope: 'all' | 'departments';
  auto_open: number;
  auto_close: number;
  notif_sent?: number;
  created_at?: string;
  // Aggregated counts returned by list endpoint
  evaluated_count?: number;
  submitted_count?: number;
  approved_count?: number;
  returned_count?: number;
  // For create/update payloads
  department_ids?: number[];
}

export interface CycleDashboard {
  total_staff: number;
  evaluated_count: number;
  draft_count: number;
  submitted_count: number;
  approved_count: number;
  returned_count: number;
  pending_count: number;
  completion_pct: number;
  hr_evaluators: {
    users_id: number;
    first_name: string | null;
    last_name: string | null;
    submitted_count: number;
  }[];
}

export interface CycleStaffMember {
  staff_id: number;
  users_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_name?: string | null;
  department_name?: string | null;
  profile_photo?: string | null;
  eval_id?: number | null;
  kpi_score?: number | null;
  comments?: string | null;
  eval_status?: 'draft' | 'submitted' | 'approved' | 'returned' | null;
  review_comment?: string | null;
  evaluator_name?: string | null;
  submitted_at?: string | null;
}

export interface CycleEvaluation {
  id: number;
  users_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_name?: string | null;
  department_name?: string | null;
  kpi_score?: number | null;
  comments?: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'returned';
  review_comment?: string | null;
  evaluator_name?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
}

export interface CycleKpiBreakdown {
  kpi_id: number;
  title: string;
  target?: string | null;
  rating: string;
  points: number;
  notes?: string | null;
  evaluated_at: string;
}

export async function getCycleStaffKpis(cycleId: number, usersId: number): Promise<CycleKpiBreakdown[]> {
  const { data } = await client.get(`/kpi-cycles/${cycleId}/evaluations/${usersId}/kpis`);
  return data.kpis ?? [];
}

export async function listKpiCycles(): Promise<KpiCycle[]> {
  const { data } = await client.get('/kpi-cycles');
  return data.cycles ?? [];
}

export async function getKpiCycle(id: number): Promise<KpiCycle> {
  const { data } = await client.get(`/kpi-cycles/${id}`);
  return data.cycle;
}

export async function createKpiCycle(
  payload: Omit<KpiCycle, 'id' | 'status' | 'notif_sent' | 'created_at' | 'evaluated_count' | 'submitted_count' | 'approved_count' | 'returned_count'> & { department_ids?: number[] }
) {
  const { data } = await client.post('/kpi-cycles', payload);
  return data;
}

export async function updateKpiCycle(
  id: number,
  payload: Partial<KpiCycle> & { department_ids?: number[] }
) {
  const { data } = await client.put(`/kpi-cycles/${id}`, payload);
  return data;
}

export async function deleteKpiCycle(id: number) {
  const { data } = await client.delete(`/kpi-cycles/${id}`);
  return data;
}

export async function openKpiCycle(id: number) {
  const { data } = await client.post(`/kpi-cycles/${id}/open`);
  return data;
}

export async function closeKpiCycle(id: number) {
  const { data } = await client.post(`/kpi-cycles/${id}/close`);
  return data;
}

export async function reopenKpiCycle(id: number) {
  const { data } = await client.post(`/kpi-cycles/${id}/reopen`);
  return data;
}

export async function getCycleStaff(id: number): Promise<CycleStaffMember[]> {
  const { data } = await client.get(`/kpi-cycles/${id}/staff`);
  return data.staff ?? [];
}

export async function getCycleDashboard(id: number): Promise<CycleDashboard> {
  const { data } = await client.get(`/kpi-cycles/${id}/dashboard`);
  return data.dashboard;
}

export async function getCycleEvaluations(id: number): Promise<CycleEvaluation[]> {
  const { data } = await client.get(`/kpi-cycles/${id}/evaluations`);
  return data.evaluations ?? [];
}

export async function saveEvaluation(
  cycleId: number,
  usersId: number,
  payload: { kpi_score?: number | null; comments?: string; action: 'save' | 'submit' }
) {
  const { data } = await client.put(`/kpi-cycles/${cycleId}/evaluations/${usersId}`, payload);
  return data;
}

export async function reviewEvaluation(
  cycleId: number,
  evalId: number,
  payload: { action: 'approve' | 'return'; review_comment?: string }
) {
  const { data } = await client.put(`/kpi-cycles/${cycleId}/evaluations/${evalId}/review`, payload);
  return data;
}

// ─── Evaluation Schedules ─────────────────────────────────────────────────────

export async function listSchedules(): Promise<EvalSchedule[]> {
  const { data } = await client.get('/kpi-cycles/schedules');
  return data.schedules ?? [];
}

export async function createSchedule(payload: Omit<EvalSchedule, 'id' | 'created_by' | 'created_at'>) {
  const { data } = await client.post('/kpi-cycles/schedules', payload);
  return data;
}

export async function updateSchedule(id: number, payload: Partial<EvalSchedule>) {
  const { data } = await client.put(`/kpi-cycles/schedules/${id}`, payload);
  return data;
}

export async function deleteSchedule(id: number) {
  const { data } = await client.delete(`/kpi-cycles/schedules/${id}`);
  return data;
}
