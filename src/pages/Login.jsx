import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import '../styles/app.css';
import '../components/form.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('error');
  const [role, setRole] = useState('subadmin');


  const navigate = useNavigate();


  const handleLogin = async () => {
    try {
      const endpoint =
        role === 'superadmin' ? '/superadmin/login' : '/subadmin/login';

      const res = await API.post(endpoint, { email, password });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', role);
        setMessage('');

        if (role === 'superadmin') navigate('/superadmin/dashboard');
        else navigate('/organization');
      } else {
        setType('error');
        setMessage(res.data.message || 'Login failed.');
      }
    } catch (error) {
      setType('error');
      setMessage(error?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const clear = () => {
    setMessage('');
  };

  return (
    <div className="page">
      <Navbar title="Login" showLogout={false} />

      <main className="container">
        <div className="card form">
          <h2 className="h-title" style={{ fontSize: 22, marginBottom: 6 }}>
            Welcome back
          </h2>
          <p className="h-sub">Login as Super Admin or Sub Admin.</p>


          <div className="grid" style={{ marginTop: 16 }}>
            <div className="field">
              <div className="label">Login As</div>
              <select
                className="input"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  clear();
                }}
              >
                <option value="subadmin">Sub Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div className="field">
              <div className="label">Email</div>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clear();
                }}
              />
            </div>

            <div className="field">
              <div className="label">Password</div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clear();
                }}
              />
            </div>
          </div>


          <div className="form-actions">
            <button className="btn" type="button" onClick={handleLogin}>
              Login
            </button>

            <span className="small">
              New here?{' '}
              <a className="link" href="/signup">
                Request Sub Admin Access
              </a>

            </span>
          </div>

          {message ? (
            <div className={`notice ${type === 'error' ? 'error' : 'success'}`} style={{ marginTop: 14 }}>
              {message}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default Login;


