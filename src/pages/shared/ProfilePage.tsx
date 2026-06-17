import { useEffect, useState } from 'react';
import { User, Phone, MapPin, Building2, BadgeCheck } from 'lucide-react';
import { getProfile } from '../../api/role';
import type { StaffProfile } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';

interface ProfilePageProps { apiBase: string; }

export default function ProfilePage({ apiBase }: ProfilePageProps) {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getProfile(apiBase)
      .then(setProfile)
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [apiBase]);

  if (loading) return <LoadingSpinner message="Loading profile…" />;
  if (error)   return <div className="page-error">{error}</div>;
  if (!profile) return null;

  const fullName = profile.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : profile.email;

  const initials = profile.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : profile.email.substring(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your personal and account information" />

      <div className="profile-grid">
        <Card className="profile-card-main">
          <div className="profile-hero">
            <div className="profile-avatar">{initials}</div>
            <div>
              <h2 className="profile-name">{fullName}</h2>
              <span className="profile-role-badge">{profile.role_name ?? '—'}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <User size={15} />
              <span className="detail-label">Email</span>
              <span className="detail-value">{profile.email}</span>
            </div>

            {profile.telephone && (
              <div className="detail-row">
                <Phone size={15} />
                <span className="detail-label">Phone</span>
                <span className="detail-value">{profile.telephone}</span>
              </div>
            )}

            {profile.gender && (
              <div className="detail-row">
                <User size={15} />
                <span className="detail-label">Gender</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>{profile.gender}</span>
              </div>
            )}

            {profile.address && (
              <div className="detail-row">
                <MapPin size={15} />
                <span className="detail-label">Address</span>
                <span className="detail-value">{profile.address}</span>
              </div>
            )}

            {profile.department_name && (
              <div className="detail-row">
                <Building2 size={15} />
                <span className="detail-label">Department</span>
                <span className="detail-value">{profile.department_name}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="profile-card-info" title="Account Information">
          <div className="info-list">
            <div className="info-item">
              <BadgeCheck size={14} />
              <span>Role: <strong>{profile.role_name ?? '—'}</strong></span>
            </div>
            {profile.department_name && (
              <div className="info-item">
                <Building2 size={14} />
                <span>Department: <strong>{profile.department_name}</strong></span>
              </div>
            )}
            <div className="info-item">
              <User size={14} />
              <span>Account status: <strong>{profile.is_active ? 'Active' : 'Inactive'}</strong></span>
            </div>
            <div className="info-item">
              <BadgeCheck size={14} />
              <span>Account managed by SAIC Administration</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
