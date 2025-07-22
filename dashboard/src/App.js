import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register/Register';
import AdminDashboard from './pages/admin/Dashboard';
import Athletes from './pages/admin/Athletes';
import Parents from './pages/admin/Parents';
import UserDashboard from './pages/user/Dashboard';
import ResetPassword from './pages/ResetPassword';
import Dues from './pages/admin/Dues';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/athletes" element={<Athletes />} />
          <Route path="/admin/parents" element={<Parents />} />
          <Route path="/admin/dues" element={<Dues />} />
          <Route path="/user/Dashboard" element={<UserDashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
