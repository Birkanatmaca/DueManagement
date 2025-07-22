import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register/Register';
import AdminDashboard from './pages/admin/Dashboard';
import Athletes from './pages/admin/Athletes';
import Parents from './pages/admin/Parents';
import UserDashboard from './pages/user/Dashboard';
import Information from './pages/user/Information';
import ResetPassword from './pages/ResetPassword';
import Dues from './pages/admin/Dues';
import UserDues from './pages/user/Dues';

// Private Route bileşeni
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
      return <Navigate to="/login" />;
  }

  // Role kontrolü ekle
  if (role !== 'user' && role !== 'admin') {
      return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
              <PrivateRoute>
                  <AdminDashboard />
              </PrivateRoute>
          } />
          <Route path="/admin/athletes" element={
              <PrivateRoute>
                  <Athletes />
              </PrivateRoute>
          } />
          <Route path="/admin/parents" element={
              <PrivateRoute>
                  <Parents />
              </PrivateRoute>
          } />
          <Route path="/admin/dues" element={
              <PrivateRoute>
                  <Dues />
              </PrivateRoute>
          } />
          
          {/* User routes */}
          <Route path="/user/dashboard" element={
              <PrivateRoute>
                  <UserDashboard />
              </PrivateRoute>
          } />
          <Route path="/user/information" element={
              <PrivateRoute>
                  <Information />
              </PrivateRoute>
          } />
          <Route path="/user/dues" element={
              <PrivateRoute>
                  <UserDues />
              </PrivateRoute>
          } />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;