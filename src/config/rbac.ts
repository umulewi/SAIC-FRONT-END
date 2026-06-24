import type { RoleConfig } from '../types';

const commonMenuItems = [
  { id: 'profile',       label: 'My Profile',    icon: 'User',          path: 'profile' },
  { id: 'tasks',         label: 'My Tasks',       icon: 'ClipboardList', path: 'tasks' },
  { id: 'leave-request', label: 'Request Leave',  icon: 'CalendarOff',   path: 'leave-request' },
  { id: 'leave-status',  label: 'Leave Status',   icon: 'CalendarCheck', path: 'leave-status' },
  { id: 'my-documents',  label: 'My Documents',   icon: 'FolderOpen',    path: 'my-documents' },
];

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  Admin: {
    apiBase: '/admin',
    dashboardPath: '/dashboard/admin',
    canManageStaff: true,
    menuItems: [
      { id: 'overview',          label: 'Overview',             icon: 'LayoutDashboard', path: 'overview' },
      { id: 'tasks',             label: 'Tasks',                icon: 'ClipboardList',   path: 'tasks' },
      { id: 'leave-management',  label: 'Leave Management',     icon: 'CalendarDays',    path: 'leave-management' },
      { id: 'petty-cash',        label: 'Petty Cash',           icon: 'DollarSign',      path: 'petty-cash' },
      // Staff management — paths use role IDs to match new unified staff endpoint
      { id: 'admin-manager',     label: 'Admin Managers',       icon: 'UserCog',         path: 'staff/6' },
      { id: 'it-officer',        label: 'IT Officers',          icon: 'Monitor',         path: 'staff/7' },
      { id: 'legal-officer',     label: 'Legal & Procurement',  icon: 'Scale',           path: 'staff/8' },
      { id: 'partnership-off',   label: 'Partnership & Client', icon: 'Handshake',       path: 'staff/9' },
      { id: 'marketing-officer', label: 'Marketing Officers',   icon: 'Megaphone',       path: 'staff/10' },
      { id: 'mel-officer',       label: 'MEL Officers',         icon: 'BarChart3',       path: 'staff/11' },
      { id: 'finance-manager',   label: 'Finance Managers',     icon: 'Banknote',        path: 'staff/4' },
      { id: 'accountant',        label: 'Accountants',          icon: 'Calculator',      path: 'staff/5' },
      { id: 'training-manager',  label: 'Training Managers',    icon: 'GraduationCap',   path: 'staff/12' },
      { id: 'training-officer',  label: 'Training Officers',    icon: 'BookOpen',        path: 'staff/13' },
      { id: 'farm-manager',      label: 'Farm & Carbon Mgr',    icon: 'Leaf',            path: 'staff/14' },
      { id: 'crop-officer',      label: 'Crop Production',      icon: 'Sprout',          path: 'staff/15' },
      { id: 'livestock-officer', label: 'Livestock Production', icon: 'Beef',            path: 'staff/16' },
      { id: 'transaction-mgr',   label: 'Transaction Advisory', icon: 'TrendingUp',      path: 'staff/17' },
      { id: 'business-dev',      label: 'Business Development', icon: 'Briefcase',       path: 'staff/18' },
      { id: 'cashier',           label: 'Cashiers',             icon: 'Receipt',         path: 'staff/19' },
      { id: 'driver',            label: 'Drivers',              icon: 'Car',             path: 'staff/20' },
      { id: 'messenger',         label: 'Messengers',           icon: 'Mail',            path: 'staff/21' },
      { id: 'hr-manager-staff',  label: 'HR Managers',          icon: 'Award',           path: 'staff/22' },
      { id: 'staff-directory',   label: 'Staff Directory',      icon: 'BookOpen',        path: 'staff-directory' },
      { id: 'documents',         label: 'Documents',            icon: 'FolderOpen',      path: 'documents' },
      { id: 'kpi-cycles',        label: 'KPI Cycles',           icon: 'CalendarRange',   path: 'kpi-cycles' },
    ],
  },

  'Admin Manager': {
    apiBase: '/admin_manager',
    dashboardPath: '/dashboard/admin_manager',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',  label: 'Overview',  icon: 'LayoutDashboard', path: 'overview' },
      { id: 'my-team',   label: 'My Team',   icon: 'Users',           path: 'my-team' },
      ...commonMenuItems,
    ],
  },

  'IT Officer': {
    apiBase: '/IT_officer',
    dashboardPath: '/dashboard/IT_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  // Exact DB spelling: lowercase 'a', 'p', 'o'
  'Legal and procurement officer': {
    apiBase: '/legal_and_procurement_officer',
    dashboardPath: '/dashboard/legal_and_procurement_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  // Exact DB spelling: lowercase
  'Partnership and client relations officer': {
    apiBase: '/partnership_and_client_relations_officer',
    dashboardPath: '/dashboard/partnership_and_client_relations_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  'Head Marketing Officer': {
    apiBase: '/head_marketing_officer',
    dashboardPath: '/dashboard/head_marketing_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  'MEL Officer': {
    apiBase: '/mel_officer',
    dashboardPath: '/dashboard/mel_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  'Finance Manager': {
    apiBase: '/finance_manager',
    dashboardPath: '/dashboard/finance_manager',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',  label: 'Overview',  icon: 'LayoutDashboard', path: 'overview' },
      { id: 'my-team',   label: 'My Team',   icon: 'Users',           path: 'my-team' },
      ...commonMenuItems,
    ],
  },

  Accountant: {
    apiBase: '/accountant',
    dashboardPath: '/dashboard/accountant',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',    label: 'Overview',    icon: 'LayoutDashboard', path: 'overview' },
      { id: 'petty-cash',  label: 'Petty Cash',  icon: 'DollarSign',      path: 'petty-cash' },
      ...commonMenuItems,
    ],
  },

  'Training Department Manager': {
    apiBase: '/training_department_manager',
    dashboardPath: '/dashboard/training_department_manager',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',  label: 'Overview',  icon: 'LayoutDashboard', path: 'overview' },
      { id: 'my-team',   label: 'My Team',   icon: 'Users',           path: 'my-team' },
      ...commonMenuItems,
    ],
  },

  'Training And Curriculum Development Officer': {
    apiBase: '/training_and_curriculum_development_officer',
    dashboardPath: '/dashboard/training_and_curriculum_development_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  // Exact DB spelling: 'and' lowercase, 'Carbon Credit' capitalised
  'Farm and Carbon Credit Department Manager': {
    apiBase: '/farm_and_carbon_credit_department_manager',
    dashboardPath: '/dashboard/farm_and_carbon_credit_department_manager',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',  label: 'Overview',  icon: 'LayoutDashboard', path: 'overview' },
      { id: 'my-team',   label: 'My Team',   icon: 'Users',           path: 'my-team' },
      ...commonMenuItems,
    ],
  },

  'Crop Production Officer': {
    apiBase: '/crop_production_officer',
    dashboardPath: '/dashboard/crop_production_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  'Livestock Production Officer': {
    apiBase: '/livestock_production_officer',
    dashboardPath: '/dashboard/livestock_production_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  'Transaction Advisory Department Manager': {
    apiBase: '/transaction_advisory_department_manager',
    dashboardPath: '/dashboard/transaction_advisory_department_manager',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',  label: 'Overview',  icon: 'LayoutDashboard', path: 'overview' },
      { id: 'my-team',   label: 'My Team',   icon: 'Users',           path: 'my-team' },
      ...commonMenuItems,
    ],
  },

  'Business Development Officer': {
    apiBase: '/business_development_officer',
    dashboardPath: '/dashboard/business_development_officer',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  Cashier: {
    apiBase: '/cashier',
    dashboardPath: '/dashboard/cashier',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  Driver: {
    apiBase: '/driver',
    dashboardPath: '/dashboard/driver',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  Messenger: {
    apiBase: '/messenger',
    dashboardPath: '/dashboard/messenger',
    canManageStaff: false,
    menuItems: [{ id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: 'overview' }, ...commonMenuItems],
  },

  'HR Manager': {
    apiBase: '/hr_manager',
    dashboardPath: '/dashboard/hr_manager',
    canManageStaff: false,
    menuItems: [
      { id: 'overview',        label: 'Overview',       icon: 'LayoutDashboard', path: 'overview' },
      { id: 'hr-manager',      label: 'Staff & KPIs',   icon: 'Users',           path: 'hr-manager' },
      { id: 'staff-directory', label: 'Staff Directory', icon: 'BookOpen',        path: 'staff-directory' },
      ...commonMenuItems,
    ],
  },
};

/**
 * Maps DB role_id → display label for admin staff management pages.
 * Keys match the role IDs in the `role` table.
 */
export const ADMIN_STAFF_ROLES: Record<number, string> = {
  4:  'Finance Manager',
  5:  'Accountant',
  6:  'Admin Manager',
  7:  'IT Officer',
  8:  'Legal & Procurement Officer',
  9:  'Partnership & Client Relations Officer',
  10: 'Head Marketing Officer',
  11: 'MEL Officer',
  12: 'Training Department Manager',
  13: 'Training & Curriculum Dev. Officer',
  14: 'Farm & Carbon Credit Dept. Manager',
  15: 'Crop Production Officer',
  16: 'Livestock Production Officer',
  17: 'Transaction Advisory Dept. Manager',
  18: 'Business Development Officer',
  19: 'Cashier',
  20: 'Driver',
  21: 'Messenger',
  22: 'HR Manager',
};

export function getRoleConfig(role: string): RoleConfig | null {
  return ROLE_CONFIG[role] ?? null;
}

export function getDashboardPath(role: string): string {
  return ROLE_CONFIG[role]?.dashboardPath ?? '/login';
}
