import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/app.css';
import '../components/form.css';

const ORG_CONFIG = {
  school: {
    icon: '🏫', label: 'School', memberLabel: 'Student', membersLabel: 'Students',
    extraLabel: 'Class / Grade', extraPlaceholder: 'e.g. Class 10-A', color: '#6366f1',
  },
  gym: {
    icon: '💪', label: 'Gym', memberLabel: 'Member', membersLabel: 'Members',
    extraLabel: 'Membership Plan', extraPlaceholder: 'e.g. Monthly, Annual', color: '#f59e0b',
  },
  hospital: {
    icon: '🏥', label: 'Hospital', memberLabel: 'Patient', membersLabel: 'Patients',
    extraLabel: 'Ward / Department', extraPlaceholder: 'e.g. Cardiology', color: '#ef4444',
  },
  clinic: {
    icon: '🩺', label: 'Clinic', memberLabel: 'Patient', membersLabel: 'Patients',
    extraLabel: 'Department', extraPlaceholder: 'e.g. General', color: '#06b6d4',
  },
  office: {
    icon: '🏢', label: 'Office', memberLabel: 'Employee', membersLabel: 'Employees',
    extraLabel: 'Department / Role', extraPlaceholder: 'e.g. Engineering', color: '#8b5cf6',
  },
};

const DEFAULT_CONFIG = {
  icon: '🏢', label: 'Organization', memberLabel: 'Member', membersLabel: 'Members',
  extraLabel: 'Details', extraPlaceholder: '', color: '#8b5cf6',
};

function OrganizationPage() {
  const [orgData, setOrgData] = useState(null);
  const [members, setMembers] = useState([]);
  const [pageStatus, setPageStatus] = useState({ type: 'loading', message: '' });
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', extra: '' });
  const [addStatus, setAddStatus] = useState('');
  const [addError, setAddError] = useState('');
  const [removing, setRemoving] = useState(null);

  const decoded = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  }, []);

  const cfg = useMemo(() => {
    if (!orgData?.type) return DEFAULT_CONFIG;
    return ORG_CONFIG[orgData.type] || DEFAULT_CONFIG;
  }, [orgData]);

  const fetchOrg = async () => {
    try {
      const res = await API.get('/subadmin/organization');
      const first = res.data?.organizations?.[0] || null;
      setOrgData(first);
      setPageStatus({ type: 'success', message: '' });
      if (first) fetchMembers(first._id);
    } catch {
      setPageStatus({ type: 'error', message: 'Failed to load organization.' });
    }
  };

  const fetchMembers = async (orgId) => {
    try {
      const res = await API.get('/subadmin/users', { params: { organizationId: orgId } });
      setMembers(res.data?.users || []);
    } catch {
      setMembers([]);
    }
  };

  useEffect(() => { fetchOrg(); }, []);

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email) {
      setAddError('Name and email are required.');
      return;
    }
    try {
      setAddError('');
      setAddStatus('loading');
      await API.post('/subadmin/users', { ...addForm, organizationId: orgData._id });
      setAddStatus('success');
      setAddForm({ name: '', email: '', phone: '', extra: '' });
      fetchMembers(orgData._id);
      setTimeout(() => setAddStatus(''), 1500);
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Failed to add member.');
      setAddStatus('');
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      setRemoving(memberId);
      await API.delete(`/subadmin/users/${memberId}`, { params: { organizationId: orgData._id } });
      fetchMembers(orgData._id);
    } catch {
      alert('Failed to remove member.');
    } finally {
      setRemoving(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const canAdd = orgData?.permissions?.includes('USER_ADD');
  const canRemove = orgData?.permissions?.includes('USER_REMOVE');

  if (pageStatus.type === 'loading') {
    return (
      <div className="page">
        <Navbar title="Organization" onLogout={handleLogout} />
        <main className="container" style={{ paddingTop: 40 }}>
          <div className="notice">Loading your organization...</div>
        </main>
      </div>
    );
  }

  if (pageStatus.type === 'error') {
    return (
      <div className="page">
        <Navbar title="Organization" onLogout={handleLogout} />
        <main className="container" style={{ paddingTop: 40 }}>
          <div className="notice error">{pageStatus.message}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar title={orgData ? `${cfg.icon} ${orgData.name}` : 'Organization'} onLogout={handleLogout} />

      <main className="container" style={{ paddingTop: 26 }}>

        {/* Org Info Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg, ${cfg.color}44, ${cfg.color}22)`,
              border: `1px solid ${cfg.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
            }}>
              {cfg.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{orgData?.name}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{cfg.label}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {orgData?.permissions?.map((p) => (
                <span key={p} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20,
                  background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44`
                }}>
                  {p.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="key">Total {cfg.membersLabel}</div>
              <div className="val" style={{ fontSize: 22, fontWeight: 700, color: cfg.color }}>{members.length}</div>
            </div>
            <div>
              <div className="key">Logged in as</div>
              <div className="val">{decoded?.name || 'Sub Admin'}</div>
            </div>
          </div>
        </div>

        {/* Add Member Card */}
        {canAdd && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              ➕ Add {cfg.memberLabel}
            </h3>
            <div className="grid grid-2">
              <div className="field">
                <div className="label">Full Name *</div>
                <input className="input" type="text" value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <div className="label">Email *</div>
                <input className="input" type="email" value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="field">
                <div className="label">Phone</div>
                <input className="input" type="tel" value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="field">
                <div className="label">{cfg.extraLabel}</div>
                <input className="input" type="text" placeholder={cfg.extraPlaceholder} value={addForm.extra}
                  onChange={(e) => setAddForm((f) => ({ ...f, extra: e.target.value }))} />
              </div>
            </div>
            {addError && <div className="notice error" style={{ marginTop: 8 }}>{addError}</div>}
            {addStatus === 'success' && <div className="notice success" style={{ marginTop: 8 }}>✅ {cfg.memberLabel} added!</div>}
            <div className="form-actions" style={{ marginTop: 14 }}>
              <button className="btn" type="button" onClick={handleAdd} disabled={addStatus === 'loading'}>
                {addStatus === 'loading' ? 'Adding...' : `Add ${cfg.memberLabel}`}
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="card">
          <div className="header" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>
              {cfg.icon} {cfg.membersLabel} ({members.length})
            </h3>
          </div>
          {members.length === 0 ? (
            <div className="notice">No {cfg.membersLabel.toLowerCase()} added yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map((m) => (
                <div key={m._id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                  alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{m.email}</div>
                    {m.phone && <div style={{ fontSize: 12, color: '#64748b' }}>📞 {m.phone}</div>}
                  </div>
                  <div>
                    {m.extra && (
                      <span style={{
                        fontSize: 12, padding: '3px 8px', borderRadius: 20,
                        background: `${cfg.color}18`, color: cfg.color
                      }}>
                        {m.extra}
                      </span>
                    )}
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                      Added {m.addedAt ? new Date(m.addedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  {canRemove && (
                    <button className="btn btn-danger" type="button"
                      style={{ fontSize: 12, padding: '6px 12px' }}
                      disabled={removing === m._id}
                      onClick={() => handleRemove(m._id)}>
                      {removing === m._id ? '...' : 'Remove'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default OrganizationPage;