import { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

import '../styles/app.css';
import '../components/form.css';

function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState({ type: 'loading', message: '' });

  const fetchRequests = async () => {
    try {
      setStatus({ type: 'loading', message: '' });
      const res = await API.get('/superadmin/requests');
      setRequests(res.data);
      setStatus({ type: 'success', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error?.response?.data?.message || 'Failed to load requests.',
      });
    }
  };


  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/superadmin/approve/${id}`);
      setStatus({
        type: 'success',
        message: res.data.message || 'Request approved.',
      });
      fetchRequests();
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error?.response?.data?.message || 'Approve failed. Please try again.',
      });
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await API.put(`/superadmin/reject/${id}`);
      setStatus({
        type: 'success',
        message: res.data.message || 'Request rejected.',
      });
      fetchRequests();
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error?.response?.data?.message || 'Reject failed. Please try again.',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return (
    <div className="page">
      <Navbar title="Super Admin" onLogout={handleLogout} />

      <main className="container" style={{ paddingTop: 26 }}>
        <div className="card">
          <div className="header">
            <div>
              <h2 className="h-title" style={{ fontSize: 22, marginBottom: 6 }}>
                Pending Requests
              </h2>
              <p className="h-sub">Review and manage sub admin requests.</p>
            </div>
          </div>

          {status.message && (
            <div className={`notice ${status.type === 'error' ? 'error' : 'success'}`}>
              {status.message}
            </div>
          )}

          {requests.length === 0 ? (
            <div className="notice">No pending requests found.</div>
          ) : (
            <div className="grid" style={{ marginTop: 14 }}>
              {requests.map((req) => (
                <div key={req._id} className="k" style={{ gridColumn: '1 / -1' }}>
                  <div className="kv">
                    <div className="k" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div className="key">Name</div>
                      <div className="val">{req.name}</div>
                    </div>
                    <div className="k" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div className="key">Email</div>
                      <div className="val">{req.email}</div>
                    </div>
                    <div className="k" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div className="key">Organization</div>
                      <div className="val">{req.organization || req.organizationId}</div>
                    </div>

                    <div className="k" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div className="key">Status</div>
                      <div className="val">{req.status}</div>
                    </div>
                  </div>

                  <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleApprove(req._id)}
                      style={{ background: 'linear-gradient(135deg, #22c55e, #86efac)', color: '#0b1220' }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleReject(req._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SuperAdminDashboard;

