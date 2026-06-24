import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SubAdminSignup from './pages/SubAdminSignup';

import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OrganizationPage from './pages/OrganizationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SubAdminSignup />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/organization" element={<OrganizationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
