import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleConfig } from '../config/rbac';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface RoleRouteProps {
  allowedRoles?: string[];
  basePath: string;
}

export default function RoleRoute({ allowedRoles, basePath }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const config = getRoleConfig(user.role);
    return <Navigate to={config?.dashboardPath ?? '/login'} replace />;
  }

  const config = getRoleConfig(user.role);
  if (!config) return <Navigate to="/login" replace />;

  return <DashboardLayout menuItems={config.menuItems} basePath={basePath} />;
}
