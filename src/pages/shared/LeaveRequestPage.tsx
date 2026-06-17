import { useState, type FormEvent } from 'react';
import { CalendarOff, CheckCircle } from 'lucide-react';
import { requestLeave } from '../../api/role';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import './SharedPages.css';

interface LeaveRequestPageProps { apiBase: string; }

export default function LeaveRequestPage({ apiBase }: LeaveRequestPageProps) {
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !startDate || !endDate) {
      setError('All fields are required.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await requestLeave(apiBase, { reason: reason.trim(), start_date: startDate, end_date: endDate });
      setSuccess('Leave request submitted successfully!');
      setReason('');
      setStartDate('');
      setEndDate('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to submit leave request.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Request Leave" subtitle="Submit a leave request for approval" />

      <Card className="form-card">
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="saic-form">
          <div className="form-group">
            <label htmlFor="reason">Reason for Leave *</label>
            <textarea
              id="reason"
              rows={4}
              placeholder="Briefly describe the reason for your leave…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Start Date *</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">End Date *</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            <CalendarOff size={15} />
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </Card>
    </div>
  );
}
