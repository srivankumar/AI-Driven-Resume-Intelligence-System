import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import CreateJob from './pages/CreateJob';
import AllApplications from './pages/AllApplications';
import TopCandidates from './pages/TopCandidates';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/apply/:jobId"
            element={
              <ProtectedRoute>
                <ApplyJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-job"
            element={
              <ProtectedRoute requireAdmin>
                <CreateJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute requireAdmin>
                <AllApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/top-candidates"
            element={
              <ProtectedRoute requireAdmin>
                <TopCandidates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/job/:jobId/applications"
            element={
              <ProtectedRoute requireAdmin>
                <AllApplications />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
