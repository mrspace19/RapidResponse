import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Ambulance, 
  Clock, 
  Heart, 
  MapPin, 
  History,
  User,
  LogOut
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useEmergencyStore from '../../store/emergencyStore';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getMyRequests, myRequests } = useEmergencyStore();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const result = await getMyRequests({ limit: 5 });
    if (result.success) {
      calculateStats(result.data.data);
    }
  };

  const calculateStats = (requests) => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const active = requests.filter(r =>
      ['pending', 'searching', 'accepted', 'en_route_to_pickup', 'patient_picked', 'en_route_to_hospital'].includes(r.status)
    ).length;
    
    setStats({ total, completed, active });
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      searching: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Ambulance className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Rapid Response</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Your emergency services dashboard. Stay safe and connected.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Emergency Button */}
          <button
            onClick={() => navigate('/emergency')}
            className="group relative bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"></div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center pulse-ring">
                <Phone className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-1">Emergency Request</h3>
                <p className="text-red-100">Request immediate ambulance service</p>
              </div>
            </div>
          </button>

          {/* Private Booking */}
          <button
            onClick={() => navigate('/private-booking')}
            className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Ambulance className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Private Booking</h3>
                <p className="text-gray-600">Schedule a private ambulance</p>
              </div>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <History className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Requests</h3>
            <button
              onClick={() => navigate('/my-requests')}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              View All →
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-12">
              <Ambulance className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No requests yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Your emergency and private bookings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/track/${request._id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          request.serviceType === 'emergency'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        {request.serviceType === 'emergency' ? (
                          <Phone
                            className={`w-5 h-5 ${
                              request.serviceType === 'emergency'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}
                          />
                        ) : (
                          <Ambulance className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {request.emergencyType?.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{request.pickupLocation?.address}</span>
                  </div>

                  {request.assignedAmbulanceId && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm">
                        <Ambulance className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Ambulance: {request.assignedAmbulanceId.registrationNumber}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical Info Reminder */}
        {(!user?.medicalHistory?.bloodGroup || user.emergencyContacts?.length === 0) && (
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <Heart className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-semibold mb-1">
                  Complete Your Medical Profile
                </h4>
                <p className="text-yellow-700 text-sm mb-3">
                  Adding your medical history and emergency contacts helps us provide better care.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
