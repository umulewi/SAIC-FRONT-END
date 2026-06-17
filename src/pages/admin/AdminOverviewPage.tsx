import { useEffect, useState } from 'react';
import { ClipboardList, ClipboardCheck, Users, CalendarDays } from 'lucide-react';
import { adminGetTasks, adminGetAssignedTasks, adminGetStaff, adminGetLeaveRequests } from '../../api/role';
import { StatCard } from '../../components/Common/Card';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import '../shared/SharedPages.css';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [taskCount,    setTaskCount]    = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [staffCount,   setStaffCount]   = useState(0);
  const [leaveCount,   setLeaveCount]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminGetTasks(),
      adminGetAssignedTasks(),
      adminGetStaff(),
      adminGetLeaveRequests(),
    ]).then(([tasks, assigned, staff, leaves]) => {
      if (tasks.status    === 'fulfilled') setTaskCount(tasks.value.length);
      if (assigned.status === 'fulfilled') setAssignedCount(assigned.value.length);
      if (staff.status    === 'fulfilled') setStaffCount(staff.value.length);
      if (leaves.status   === 'fulfilled') {
        const pending = leaves.value.filter(l => !l.status || l.status === 'pending').length;
        setLeaveCount(pending);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin dashboard…" />;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.email ?? 'Admin'}!`}
        subtitle="System Administrator — Full access to all modules"
      />

      <div className="stats-grid">
        <StatCard label="Total Tasks"       value={taskCount}     icon={<ClipboardList size={20} />}  color="green" />
        <StatCard label="Task Assignments"  value={assignedCount} icon={<ClipboardCheck size={20} />} color="blue" />
        <StatCard label="Total Staff"       value={staffCount}    icon={<Users size={20} />}           color="amber" />
        <StatCard label="Pending Leaves"    value={leaveCount}    icon={<CalendarDays size={20} />}    color="green" />
      </div>

      <div className="overview-cards">
        <div className="overview-card">
          <h3>Admin Capabilities</h3>
          <ul className="quick-actions">
            <li>Create, assign, update and delete tasks for all staff</li>
            <li>Manage all staff accounts across all 18 roles</li>
            <li>View and approve or reject leave requests</li>
            <li>Monitor task submissions and approvals</li>
            <li>Full CRUD operations on the unified staff table</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
