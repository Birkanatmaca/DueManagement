// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AuthPage from './features/auth/AuthPage.jsx';
import Dashboard from './features/admin/AdminDashboard.jsx';
// import ParentDashboard from './features/parentDashboard/ParentDashboard.jsx';


function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
