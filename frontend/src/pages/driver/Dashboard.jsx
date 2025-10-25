import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ambulance, LogOut, User, Activity, Clock, Star } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Ambulance className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">Your driver dashboard</p>
        </div>

        {/* Coming Soon Card */}
        <div className="card text-center py-16">
          <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Ambulance className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Driver Dashboard
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Complete driver features including emergency request management, real-time tracking, 
            and navigation are coming soon.
          </p>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Activity className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Accept Requests</h4>
              <p className="text-sm text-gray-600">Receive and accept emergency requests</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Real-time Navigation</h4>
              <p className="text-sm text-gray-600">Get turn-by-turn directions</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <Star className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Earnings & Stats</h4>
              <p className="text-sm text-gray-600">Track your performance</p>
            </div>
          </div>

          <div className="mt-8">
            <span className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Feature Under Development</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;