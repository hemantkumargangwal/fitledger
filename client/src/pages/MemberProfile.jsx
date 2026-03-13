import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Calendar, AlertCircle, History } from 'lucide-react';
import { memberService } from '../services/memberService';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ACTION_LABELS = {
  member_joined: 'Joined gym',
  member_updated: 'Details updated',
  member_renewed: 'Plan renewed',
  payment_received: 'Payment received',
  member_deleted: 'Removed'
};

const MemberProfile = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const [memberRes, activityRes] = await Promise.all([
          memberService.getMemberById(id),
          memberService.getMemberActivity(id).catch(() => ({ activity: [] }))
        ]);
        if (!cancelled) {
          setMember(memberRes.member);
          setActivity(activityRes.activity || []);
        }
      } catch {
        if (!cancelled) setError('Member not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const isExpired = member ? new Date(member.expiryDate) < new Date() : false;
  const isExpiringSoon = member && !isExpired && (() => {
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return new Date(member.expiryDate) <= in30;
  })();

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/members" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
        <div className="py-12 text-center text-slate-500">Loading profile…</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <Link to="/members" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
        <div className="py-12 text-center text-slate-600">{error || 'Member not found.'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/members"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/members?edit=${member._id}`}
            className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-800">{member.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isExpired
                      ? 'bg-red-100 text-red-800'
                      : isExpiringSoon
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring soon' : 'Active'}
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Phone</dt>
                    <dd className="text-slate-800">{member.phone || '—'}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Email</dt>
                    <dd className="text-slate-800">{member.email || '—'}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Joining date</dt>
                    <dd className="text-slate-800">{formatDate(member.joiningDate)}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Expiry date</dt>
                    <dd className="text-slate-800">{formatDate(member.expiryDate)}</dd>
                  </div>
                </div>
              </dl>
              <p className="mt-4 text-sm text-slate-500">
                Plan duration: {member.planDuration} month{member.planDuration !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Member activity log */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Activity log</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">Recent activity for this member</p>
        </div>
        <div className="p-6">
          {activity.length > 0 ? (
            <ul className="space-y-4">
              {activity.map((log) => (
                <li key={log._id} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-400 flex-shrink-0 w-28">
                    {formatDate(log.createdAt)}
                  </span>
                  <div>
                    <span className="font-medium text-slate-700">{ACTION_LABELS[log.action] || log.action}</span>
                    {log.description && <p className="text-sm text-slate-500 mt-0.5">{log.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
