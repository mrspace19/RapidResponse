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
import ActiveRide from './pages/driver/ActiveRide';
import RegisterAmbulance from './pages/driver/RegisterAmbulance';
import OperatorDashboard from './pages/operator/Dashboard';
import HospitalDashboard from './pages/hospital/Dashboard';
import EmergencyRequest from './pages/patient/EmergencyRequest';
import PrivateBooking from './pages/patient/PrivateBooking';
import TrackAmbulance from './pages/patient/TrackAmbulance';
import MyRequests from './pages/patient/MyRequests';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AmbulanceDetails from './pages/driver/AmbulanceDetails';
import Settings from './pages/Settings';

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
          <Route
            path="/driver/register-ambulance"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <RegisterAmbulance />
              </ProtectedRoute>
          }
          />
          <Route
            path="/driver/active-ride/:requestId"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <ActiveRide />
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
          {/* Admin Routes - Separate from normal user routes */}
<Route path="/admin/login" element={<AdminLogin />} />
<Route
  path="/admin/dashboard"
  element={
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  }
/>

{/* Driver Ambulance Routes */}
<Route
  path="/driver/register-ambulance"
  element={
    <ProtectedRoute allowedRoles={['driver']}>
      <RegisterAmbulance />
    </ProtectedRoute>
  }
/>
<Route
  path="/driver/ambulance-details"
  element={
    <ProtectedRoute allowedRoles={['driver']}>
      <AmbulanceDetails />
    </ProtectedRoute>
  }
/>

{/* Settings Route */}
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
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