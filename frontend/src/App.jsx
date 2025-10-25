import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/Dashboard';
import DriverDashboard from './pages/driver/Dashboard';
import OperatorDashboard from './pages/operator/Dashboard';
import HospitalDashboard from './pages/hospital/Dashboard';
import EmergencyRequest from './pages/patient/EmergencyRequest';
import PrivateBooking from './pages/patient/PrivateBooking';
import TrackAmbulance from './pages/patient/TrackAmbulance';
import MyRequests from './pages/patient/MyRequests';
import Profile from './pages/Profile';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { isAuthenticated, loading, fetchUser, user } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const getDashboardByRole = () => {
    switch (user?.role) {
      case 'driver':
        return <DriverDashboard />;
      case 'operator':
        return <OperatorDashboard />;
      case 'hospital_admin':
        return <HospitalDashboard />;
      case 'admin':
        return <OperatorDashboard />; // Admin uses operator dashboard with more features
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {getDashboardByRole()}
              </ProtectedRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/emergency"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <EmergencyRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/private-booking"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PrivateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:requestId"
            element={
              <ProtectedRoute allowedRoles={['patient', 'driver']}>
                <TrackAmbulance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;