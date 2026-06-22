import { useEffect, useState, type ReactNode } from 'react';
import {
  User, Phone, MapPin, Building2, BadgeCheck,
  CreditCard, Calendar, FileText, ExternalLink,
  Mail, BriefcaseBusiness,
} from 'lucide-react';
import { getProfile } from '../../api/role';
import type { StaffProfile } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';
import '../admin/AdminStaffDirectoryPage.css';

interface ProfilePageProps { apiBase: string; }

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return (
    <div className="asd-detail-row">
      <span className="asd-detail-icon">{icon}</span>
      <span className="asd-detail-label">{label}</span>
      <span className="asd-detail-value">{value || '—'}</span>
    </div>
  );
}

function ContractBadge({ status }: { status?: string | null }) {
  return <span className={`asd-status asd-status-${status ?? 'none'}`}>{status ?? '—'}</span>;
}

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

  const hasLocation = profile.province || profile.district || profile.sector || profile.cell || profile.village;
  const hasContract = profile.contract_status || profile.contract_start || profile.contract_end || profile.contract_file;
  const hasBanking  = profile.bank_name || profile.bank_account_no;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your personal and account information" />

      {/* ── Hero card ── */}
      <div className="asd-detail-modal" style={{ position: 'static', maxWidth: '100%', boxShadow: 'var(--shadow-md, 0 2px 12px rgba(0,0,0,.08))', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>

        <div className="asd-detail-header">
          <div className="asd-detail-hero">
            <div className="asd-detail-avatar">
              {profile.profile_photo
                ? <img src={`/uploads/${profile.profile_photo}`} alt="" className="asd-avatar-img" />
                : <span>{initials(profile.first_name, profile.last_name)}</span>
              }
            </div>
            <div>
              <h3 className="asd-detail-name">{fullName}</h3>
              <p className="asd-detail-role">{profile.role_name ?? '—'}</p>
              {profile.department_name && <p className="asd-detail-dept">{profile.department_name}</p>}
            </div>
          </div>
          <span className={`asd-status asd-status-${profile.is_active ? 'active' : 'none'}`} style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
            {profile.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="asd-detail-body">
          <div className="asd-detail-columns">

            {/* Left column */}
            <div className="asd-detail-col">
              <p className="asd-detail-section-title"><User size={13} /> Personal Information</p>
              <div className="asd-detail-card">
                <InfoRow icon={<Mail size={13} />}  label="Email"  value={profile.email} />
                <InfoRow icon={<Phone size={13} />} label="Phone"  value={profile.telephone} />
                <InfoRow icon={<User size={13} />}  label="Gender" value={profile.gender} />
                {profile.department_name && (
                  <InfoRow icon={<Building2 size={13} />} label="Department" value={profile.department_name} />
                )}
                <div className="asd-detail-row">
                  <span className="asd-detail-icon"><BadgeCheck size={13} /></span>
                  <span className="asd-detail-label">Role</span>
                  <span className="asd-detail-value">{profile.role_name ?? '—'}</span>
                </div>
              </div>

              {hasLocation && (
                <>
                  <p className="asd-detail-section-title" style={{ marginTop: '1rem' }}><MapPin size={13} /> Location</p>
                  <div className="asd-detail-card">
                    <InfoRow icon={<MapPin size={13} />}            label="Province" value={profile.province} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="District" value={profile.district} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="Sector"   value={profile.sector} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="Cell"     value={profile.cell} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="Village"  value={profile.village} />
                  </div>
                </>
              )}
            </div>

            {/* Right column */}
            <div className="asd-detail-col">
              {hasContract && (
                <>
                  <p className="asd-detail-section-title"><BriefcaseBusiness size={13} /> Contract</p>
                  <div className="asd-detail-card">
                    <div className="asd-detail-row">
                      <span className="asd-detail-icon"><FileText size={13} /></span>
                      <span className="asd-detail-label">Status</span>
                      <span className="asd-detail-value"><ContractBadge status={profile.contract_status} /></span>
                    </div>
                    <InfoRow icon={<Calendar size={13} />}          label="Start Date" value={fmtDate(profile.contract_start)} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="End Date"   value={fmtDate(profile.contract_end)} />
                    {profile.contract_file && (
                      <div className="asd-detail-row">
                        <span className="asd-detail-icon"><FileText size={13} /></span>
                        <span className="asd-detail-label">File</span>
                        <a href={`/uploads/${profile.contract_file}`} target="_blank" rel="noreferrer"
                          className="asd-contract-link">
                          {profile.contract_original ?? 'View Contract'} <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}

              {hasBanking && (
                <>
                  <p className="asd-detail-section-title" style={{ marginTop: hasContract ? '1rem' : 0 }}><CreditCard size={13} /> Banking</p>
                  <div className="asd-detail-card">
                    <InfoRow icon={<CreditCard size={13} />}        label="Bank"    value={profile.bank_name} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="Account" value={profile.bank_account_no} />
                  </div>
                </>
              )}

              {!hasContract && !hasBanking && (
                <>
                  <p className="asd-detail-section-title"><BadgeCheck size={13} /> Account</p>
                  <div className="asd-detail-card">
                    <div className="asd-detail-row">
                      <span className="asd-detail-icon"><BadgeCheck size={13} /></span>
                      <span className="asd-detail-label">Status</span>
                      <span className="asd-detail-value">{profile.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="asd-detail-row">
                      <span className="asd-detail-icon"><Building2 size={13} /></span>
                      <span className="asd-detail-label">Managed by</span>
                      <span className="asd-detail-value">SAIC Administration</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
