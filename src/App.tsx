import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getDashboardPath, ADMIN_STAFF_ROLES } from './config/rbac';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import Login from './pages/Login/Login';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';

// Shared pages
import ProfilePage from './pages/shared/ProfilePage';
import MyTasksPage from './pages/shared/MyTasksPage';
import TaskDetailPage from './pages/shared/TaskDetailPage';
import LeaveRequestPage from './pages/shared/LeaveRequestPage';
import LeaveStatusPage from './pages/shared/LeaveStatusPage';
import RoleOverviewPage from './pages/shared/RoleOverviewPage';

// Admin pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminTasksPage from './pages/admin/AdminTasksPage';
import AdminTaskDetailPage from './pages/admin/AdminTaskDetailPage';
import AdminLeaveManagementPage from './pages/admin/AdminLeaveManagementPage';
import AdminPettyCashPage from './pages/admin/AdminPettyCashPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';

// Role-specific pages
import AccountantPettyCashPage from './pages/accountant/AccountantPettyCashPage';

// Non-admin roles: slug → { roleLabel, apiBase }
const NON_ADMIN_ROLES: { slug: string; roleLabel: string; apiBase: string }[] = [
  { slug: 'admin_manager',                          roleLabel: 'Admin Manager',                             apiBase: '/admin_manager' },
  { slug: 'IT_officer',                             roleLabel: 'IT Officer',                                apiBase: '/IT_officer' },
  { slug: 'legal_and_procurement_officer',          roleLabel: 'Legal and procurement officer',             apiBase: '/legal_and_procurement_officer' },
  { slug: 'partnership_and_client_relations_officer', roleLabel: 'Partnership and client relations officer', apiBase: '/partnership_and_client_relations_officer' },
  { slug: 'head_marketing_officer',                 roleLabel: 'Head Marketing Officer',                    apiBase: '/head_marketing_officer' },
  { slug: 'mel_officer',                            roleLabel: 'MEL Officer',                               apiBase: '/mel_officer' },
  { slug: 'finance_manager',                        roleLabel: 'Finance Manager',                           apiBase: '/finance_manager' },
  { slug: 'accountant',                             roleLabel: 'Accountant',                                apiBase: '/accountant' },
  { slug: 'training_department_manager',            roleLabel: 'Training Department Manager',               apiBase: '/training_department_manager' },
  { slug: 'training_and_curriculum_development_officer', roleLabel: 'Training And Curriculum Development Officer', apiBase: '/training_and_curriculum_development_officer' },
  { slug: 'farm_and_carbon_credit_department_manager', roleLabel: 'Farm and Carbon Credit Department Manager', apiBase: '/farm_and_carbon_credit_department_manager' },
  { slug: 'crop_production_officer',                roleLabel: 'Crop Production Officer',                   apiBase: '/crop_production_officer' },
  { slug: 'livestock_production_officer',           roleLabel: 'Livestock Production Officer',              apiBase: '/livestock_production_officer' },
  { slug: 'transaction_advisory_department_manager', roleLabel: 'Transaction Advisory Department Manager',  apiBase: '/transaction_advisory_department_manager' },
  { slug: 'business_development_officer',           roleLabel: 'Business Development Officer',              apiBase: '/business_development_officer' },
  { slug: 'cashier',                                roleLabel: 'Cashier',                                   apiBase: '/cashier' },
  { slug: 'driver',                                 roleLabel: 'Driver',                                    apiBase: '/driver' },
  { slug: 'messenger',                              roleLabel: 'Messenger',                                 apiBase: '/messenger' },
];

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        {/* Admin routes */}
        <Route
          path="/dashboard/admin"
          element={<RoleRoute allowedRoles={['Admin']} basePath="/dashboard/admin" />}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview"          element={<AdminOverviewPage />} />
          <Route path="tasks"             element={<AdminTasksPage />} />
          <Route path="tasks/:id"         element={<AdminTaskDetailPage />} />
          <Route path="leave-management"  element={<AdminLeaveManagementPage />} />
          <Route path="petty-cash"        element={<AdminPettyCashPage />} />

          {/* Staff management — keyed by role ID, matching sidebar paths */}
          {Object.entries(ADMIN_STAFF_ROLES).map(([roleId, label]) => (
            <Route
              key={roleId}
              path={`staff/${roleId}`}
              element={<StaffManagementPage roleId={Number(roleId)} label={label} />}
            />
          ))}
        </Route>

        {/* Non-admin role routes */}
        {NON_ADMIN_ROLES.map(({ slug, roleLabel, apiBase }) => (
          <Route
            key={slug}
            path={`/dashboard/${slug}`}
            element={<RoleRoute allowedRoles={[roleLabel]} basePath={`/dashboard/${slug}`} />}
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"      element={<RoleOverviewPage apiBase={apiBase} roleName={roleLabel} />} />
            <Route path="profile"       element={<ProfilePage apiBase={apiBase} />} />
            <Route path="tasks"         element={<MyTasksPage apiBase={apiBase} />} />
            <Route path="tasks/:id"     element={<TaskDetailPage apiBase={apiBase} />} />
            <Route path="leave-request" element={<LeaveRequestPage apiBase={apiBase} />} />
            <Route path="leave-status"  element={<LeaveStatusPage apiBase={apiBase} />} />
            {slug === 'accountant' && (
              <Route path="petty-cash" element={<AccountantPettyCashPage apiBase={apiBase} />} />
            )}
          </Route>
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
