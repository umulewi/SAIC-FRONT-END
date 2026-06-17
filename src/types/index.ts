export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface StaffProfile {
  users_id?: number;
  staff_id?: number;
  email: string;
  role_id?: number;
  role_name?: string;
  department_name?: string;
  is_active?: number;
  first_name?: string;
  last_name?: string;
  telephone?: string;
  gender?: string;
  address?: string;
  manager_id?: number | null;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  created_by?: number;
  created_at?: string;
  creator_email?: string;
}

export interface AssignedTask {
  assignment_id?: number;
  id?: number;
  task_id: number;
  assigned_to?: number;
  assigned_at?: string;
  title: string;
  description?: string;
  deadline?: string;
  created_by?: number;
  created_at?: string;
  task_title?: string;
  assigned_user_email?: string;
}

export interface TaskSubmission {
  id?: number;
  task_id: number;
  assigned_to?: number;
  file_path?: string;
  comment?: string;
  status?: string;
  submitted_at?: string;
}

export interface LeaveRequest {
  id?: number;
  users_id?: number;
  email?: string;
  role_id?: number;
  role_name?: string;
  reason: string;
  start_date: string;
  end_date: string;
  /** lowercase: 'pending' | 'approved' | 'rejected' */
  status?: string;
  requested_at?: string;
}

/** Unified staff record returned by GET /api/admin/staff */
export interface StaffMember {
  staff_id: number;
  users_id: number;
  email: string;
  role_id?: number;
  role_name?: string;
  department_name?: string;
  is_active?: number;
  first_name: string;
  last_name: string;
  telephone?: string;
  gender?: string;
  address?: string;
  manager_id?: number | null;
}

export interface RoleInfo {
  id: number;
  name: string;
  department_id?: number | null;
  department_name?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export type RoleKey =
  | 'Admin'
  | 'Admin Manager'
  | 'IT Officer'
  | 'Legal and procurement officer'
  | 'Partnership and client relations officer'
  | 'Head Marketing Officer'
  | 'MEL Officer'
  | 'Finance Manager'
  | 'Accountant'
  | 'Training Department Manager'
  | 'Training And Curriculum Development Officer'
  | 'Farm and Carbon Credit Department Manager'
  | 'Crop Production Officer'
  | 'Livestock Production Officer'
  | 'Transaction Advisory Department Manager'
  | 'Business Development Officer'
  | 'Cashier'
  | 'Driver'
  | 'Messenger';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface RoleConfig {
  apiBase: string;
  dashboardPath: string;
  menuItems: MenuItem[];
  canManageStaff: boolean;
}
