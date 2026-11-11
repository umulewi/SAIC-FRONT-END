import client from './client';

export interface HRStaff {
  staff_id: number;
  users_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string | null;
  contract_status?: string | null;
  role_name?: string | null;
  department_name?: string | null;
  is_active?: number;
  kpi_count: number;
  total_points: number;
  eval_count: number;
  task_total: number;
  task_completed: number;
}

export interface KPI {
  id: number;
  title: string;
  description?: string | null;
  target?: string | null;
  created_at: string;
  created_by_email?: string;
  first_name?: string | null;
  last_name?: string | null;
  assigned_count?: number;
}

export interface StaffKPI {
  staff_kpi_id: number;
  due_date?: string | null;
  assigned_at: string;
  kpi_id: number;
  title: string;
  description?: string | null;
  target?: string | null;
  assigned_by_email?: string;
  ab_first?: string;
  ab_last?: string;
  eval_id?: number | null;
  rating?: string | null;
  points?: number | null;
  notes?: string | null;
  evaluated_at?: string | null;
}

export interface PerformanceEvaluation {
  id: number;
  rating: string;
  points: number;
  notes?: string | null;
  evaluated_at: string;
  staff_kpi_id?: number | null;
  kpi_title?: string | null;
  evaluator_email?: string;
  ev_first?: string | null;
  ev_last?: string | null;
}

export interface EvaluationSummary {
  users_id: number;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  role_name?: string | null;
  kpi_score?: number | null;
  eval_status?: string | null;
  cycle_name?: string | null;
  task_total: number;
  task_completed: number;
  performance_pct: number;
}

export async function hrGetStaff(): Promise<HRStaff[]> {
  const { data } = await client.get('/hr/staff');
  return data.staff ?? [];
}

export async function hrGetKpis(): Promise<KPI[]> {
  const { data } = await client.get('/hr/kpis');
  return data.kpis ?? [];
}

export async function hrCreateKpi(payload: { title: string; description?: string; target?: string }) {
  const { data } = await client.post('/hr/kpis', payload);
  return data;
}

export async function hrUpdateKpi(id: number, payload: { title: string; description?: string; target?: string }) {
  const { data } = await client.put(`/hr/kpis/${id}`, payload);
  return data;
}

export async function hrDeleteKpi(id: number) {
  const { data } = await client.delete(`/hr/kpis/${id}`);
  return data;
}

export async function hrGetStaffKpis(userId: number): Promise<StaffKPI[]> {
  const { data } = await client.get(`/hr/staff/${userId}/kpis`);
  return data.kpis ?? [];
}

export async function hrAssignKpi(userId: number, payload: { kpi_id: number; due_date?: string }) {
  const { data } = await client.post(`/hr/staff/${userId}/kpis`, payload);
  return data;
}

export async function hrDeleteStaffKpi(userId: number, staffKpiId: number) {
  const { data } = await client.delete(`/hr/staff/${userId}/kpis/${staffKpiId}`);
  return data;
}

export async function hrGetStaffEvaluations(userId: number): Promise<PerformanceEvaluation[]> {
  const { data } = await client.get(`/hr/staff/${userId}/evaluations`);
  return data.evaluations ?? [];
}

export async function hrAddEvaluation(userId: number, payload: { rating: string; notes?: string; staff_kpi_id?: number }) {
  const { data } = await client.post(`/hr/staff/${userId}/evaluations`, payload);
  return data;
}

export async function hrGetEvaluationsSummary(from?: string, to?: string): Promise<EvaluationSummary[]> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to)   params.to   = to;
  const { data } = await client.get('/hr/evaluations/summary', { params });
  return data.summary ?? [];
}

export async function hrGetMyKpis(): Promise<StaffKPI[]> {
  const { data } = await client.get('/hr/my-kpis');
  return data.kpis ?? [];
}
