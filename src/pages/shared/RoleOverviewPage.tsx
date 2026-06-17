import { useEffect, useState } from 'react';
import { ClipboardList, CalendarCheck, Send, User } from 'lucide-react';
import { getAssignedTasks, getLeaveStatus, getProfile } from '../../api/role';
import { StatCard } from '../../components/Common/Card';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';

interface RoleOverviewPageProps {
  apiBase: string;
  roleName: string;
}

export default function RoleOverviewPage({ apiBase, roleName }: RoleOverviewPageProps) {
  const [taskCount, setTaskCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getProfile(apiBase),
      getAssignedTasks(apiBase),
      getLeaveStatus(apiBase),
    ]).then(([profileRes, tasksRes, leavesRes]) => {
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value;
        setProfileName(p.first_name ? `${p.first_name} ${p.last_name ?? ''}`.trim() : p.email);
      }
      if (tasksRes.status === 'fulfilled') setTaskCount(tasksRes.value.length);
      if (leavesRes.status === 'fulfilled') setLeaveCount(leavesRes.value.length);
      setLoading(false);
    });
  }, [apiBase]);

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  const pendingLeaves = leaveCount;

  return (
    <div>
      <PageHeader
        title={`Welcome${profileName ? `, ${profileName}` : ''}!`}
        subtitle={`${roleName} Dashboard`}
      />

      <div className="stats-grid">
        <StatCard label="Assigned Tasks" value={taskCount} icon={<ClipboardList size={20} />} color="green" />
        <StatCard label="Leave Requests" value={pendingLeaves} icon={<CalendarCheck size={20} />} color="blue" />
        <StatCard label="Submissions" value="—" icon={<Send size={20} />} color="amber" />
        <StatCard label="Profile Status" value="Active" icon={<User size={20} />} color="green" />
      </div>

      <div className="overview-cards">
        <div className="overview-card">
          <h3>Quick Actions</h3>
          <ul className="quick-actions">
            <li>View and manage your assigned tasks</li>
            <li>Submit completed tasks for review</li>
            <li>Request leave and track approval status</li>
            <li>View your profile information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
