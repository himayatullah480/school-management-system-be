import { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/app.css';
import '../components/form.css';

const ORG_TYPES = {
  school: '🏫 School',
  gym: '💪 Gym',
  hospital: '🏥 Hospital',
  clinic: '🩺 Clinic',
  office: '🏢 Office',
};

function SubAdminRequest() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', organizationId: '' });
  const [orgs, setOrgs] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/superadmin/organizations')
      .then((res) => setOrgs(res.data?.organizations || []))
      .catch(() => setOrgs([]));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const { name, email, password, confirmPassword, organizationId } = form;
    if (!name || !email || !password || !confirmPassword || !organizationId) {
      setStatus({ type: 'error', message: 'Please fill all fields.' });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      setStatus({ type: 'loading', message: '' });
      const res = await API.post('/subadmin/register', { name, email, password, organizationId });
      setStatus({ type: 'success', message: res.data.message || 'Request submitted!' });
      setTimeout(() => navigate('/'), 1400);
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || 'Signup failed.' });
    }
  };

  const grouped = orgs.reduce((acc, o) => {
    acc[o.type] = acc[o.type] || [];
    acc[o.type].push(o);
    return acc;
  }, {});

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <main className="container" style={{ maxWidth: 560 }}>
        <div className="card form">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>🏢</span>
            </div>
            <h2 className="h-title" style={{ fontSize: 22, marginBottom: 4 }}>Request Sub Admin Access</h2>
            <p className="h-sub">Select your organization and submit for approval.</p>
          </div>

          <div className="grid">
            <div className="field">
              <div className="label">Full Name</div>
              <input className="input" type="text" value={form.name} onChange={set('name')} />
            </div>

            <div className="field">
              <div className="label">Email</div>
              <input className="input" type="email" value={form.email} onChange={set('email')} />
            </div>

            <div className="field">
              <div className="label">Password</div>
              <input className="input" type="password" value={form.password} onChange={set('password')} />
            </div>

            <div className="field">
              <div className="label">Confirm Password</div>
              <input className="input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>Passwords do not match</div>
              )}
            </div>

            <div className="field">
              <div className="label">Organization</div>
              <select className="input" value={form.organizationId} onChange={set('organizationId')}>
                <option value="">Select organization</option>
                {Object.entries(grouped).map(([type, list]) => (
                  <optgroup key={type} label={ORG_TYPES[type] || type}>
                    {list.map((o) => (
                      <option key={o._id} value={o._id}>{o.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {orgs.length === 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  No organizations found. Contact Super Admin.
                </div>
              )}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button className="btn" type="button" onClick={handleSubmit} disabled={status.type === 'loading'}>
              {status.type === 'loading' ? 'Submitting...' : 'Submit Request'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/')} style={{ marginLeft: 10 }}>
              Back to Login
            </button>
          </div>

          {status.message && (
            <div className={`notice ${status.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: 14 }}>
              {status.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SubAdminRequest;