// ─── TASK TYPES ─────────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus   = 'draft' | 'assigned' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type FileType = 'attachment' | 'submission' | 'feedback';

export type WorkflowStage =
  | 'draft'
  | 'pending_manager'
  | 'pending_team'
  | 'pending_manager_review'
  | 'pending_admin_review'
  | 'completed'
  | 'rejected_to_manager';

export const WORKFLOW_LABELS: Record<WorkflowStage, string> = {
  draft:                  'Draft',
  pending_manager:        'Awaiting Manager',
  pending_team:           'In Progress',
  pending_manager_review: 'Manager Review',
  pending_admin_review:   'Admin Review',
  completed:              'Completed',
  rejected_to_manager:    'Returned to Manager',
};

export const WORKFLOW_BADGE: Record<WorkflowStage, string> = {
  draft:                  'badge-draft',
  pending_manager:        'badge-assigned',
  pending_team:           'badge-inprog',
  pending_manager_review: 'badge-submitted',
  pending_admin_review:   'badge-submitted',
  completed:              'badge-approved',
  rejected_to_manager:    'badge-rejected',
};

export interface TaskAssignment {
  assignment_id: number;
  users_id: number;
  assignment_status: AssignmentStatus;
  assigned_at?: string;
  submitted_at?: string;
  feedback?: string;
  reviewed_at?: string;
  assigned_by?: number;
  assigned_by_role?: 'admin' | 'manager';
  manager_reviewed_at?: string;
  manager_reviewed_by?: number;
  manager_feedback?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  reviewer_email?: string;
}

export interface DeadlineExtension {
  id: number;
  old_deadline?: string;
  new_deadline: string;
  old_time?: string;
  new_time?: string;
  extended_by_email?: string;
  first_name?: string;
  last_name?: string;
  reason?: string;
  created_at: string;
}

export interface TaskComment {
  id: number;
  comment: string;
  created_at: string;
  author_email: string;
  first_name?: string;
  last_name?: string;
}

export interface TaskFile {
  id: number;
  file_name: string;
  original_name: string;
  file_size?: number;
  mime_type?: string;
  file_type: FileType;
  uploaded_at: string;
  uploader_email: string;
}

export interface EnhancedTask {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  workflow_stage?: WorkflowStage;
  scope?: 'standard' | 'team_only';
  instructions?: string;
  deadline?: string;
  deadline_time?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  creator_email?: string;
  assignee_count?: number;
  assignee_names?: string;
  comment_count?: number;
  file_count?: number;
  assignees?: TaskAssignment[];
  comments?: TaskComment[];
  files?: TaskFile[];
  deadline_extensions?: DeadlineExtension[];
}

export interface TasksResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  tasks: EnhancedTask[];
}

// ─── NOTIFICATION TYPES ─────────────────────────────────────────────────────

export type NotificationType =
  | 'task_assigned'
  | 'task_comment'
  | 'task_submitted'
  | 'task_approved'
  | 'task_rejected'
  | 'task_status';

export interface Notification {
  id: number;
  users_id: number;
  type: NotificationType;
  title: string;
  message?: string;
  task_id?: number;
  task_title?: string;
  is_read: number;
  created_at: string;
}

// ─── ANALYTICS TYPES ────────────────────────────────────────────────────────

export interface AnalyticsData {
  total_tasks: number;
  by_status: {
    draft:       number;
    assigned:    number;
    in_progress: number;
    submitted:   number;
    approved:    number;
    rejected:    number;
  };
  overdue: number;
  completion_rate: number;
  by_priority: Array<{ priority: TaskPriority; count: number }>;
  user_performance: Array<{
    users_id:       number;
    email:          string;
    full_name:      string;
    total_assigned: number;
    approved:       number;
    rejected:       number;
    submitted:      number;
    in_progress:    number;
    assigned:       number;
  }>;
  recent_tasks: EnhancedTask[];
}

// ─── CORE AUTH TYPES ─────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
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

export type Task = EnhancedTask;

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

export interface PettyCash {
  id?: number;
  users_id?: number;
  item: string;
  cash: number;
  date: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  grand_total?: number;
  receipt_file?: string | null;
  receipt_original?: string | null;
}

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid' | 'other';

export interface LeaveRequest {
  id?: number;
  users_id?: number;
  email?: string;
  role_id?: number;
  role_name?: string;
  department_name?: string;
  first_name?: string;
  last_name?: string;
  leave_type?: LeaveType;
  reason: string;
  start_date: string;
  end_date: string;
  days_count?: number;
  /** lowercase: 'pending' | 'approved' | 'rejected' */
  status?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_by_name?: string;
  requested_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveBalance {
  leave_type: LeaveType;
  total_days: number;
  used_days: number;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  upcoming: number;
}

export interface LeaveTypeCount {
  leave_type: string;
  count: number;
}

export interface TeamMember {
  staff_id: number;
  users_id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string;
  gender?: string;
  province?: string;
  district?: string;
  role_name?: string;
  total_tasks: number;
  in_progress: number;
  submitted: number;
  approved: number;
  rejected: number;
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
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  manager_id?: number | null;
  profile_photo?: string | null;
  bank_name?: string | null;
  bank_account_no?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  contract_status?: 'active' | 'expired' | 'terminated' | 'probation' | null;
  contract_file?: string | null;
  contract_original?: string | null;
}

export interface DirectoryStaff extends StaffMember {
  total_points: number;
  eval_count: number;
  kpi_count: number;
  task_total: number;
  task_completed: number;
}

export interface StaffPerformanceEval {
  id: number;
  rating: string;
  points: number;
  notes?: string | null;
  evaluated_at: string;
  kpi_title?: string | null;
  evaluator_name?: string | null;
}

export interface StaffPerformanceKpi {
  staff_kpi_id: number;
  title: string;
  description?: string | null;
  target?: string | null;
  due_date?: string | null;
  assigned_at: string;
}

export interface StaffPerformanceDetail {
  staff: {
    staff_id: number;
    users_id: number;
    first_name: string;
    last_name: string;
    email: string;
    role_name?: string;
    department_name?: string;
    profile_photo?: string | null;
  };
  evaluations: StaffPerformanceEval[];
  kpis: StaffPerformanceKpi[];
  summary: {
    total_points: number;
    eval_count: number;
    kpi_count: number;
    task_total: number;
    task_completed: number;
    kpi_score: number;
    task_score: number;
    performance_pct: number;
  };
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
