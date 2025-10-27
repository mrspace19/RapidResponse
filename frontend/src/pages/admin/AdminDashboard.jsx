import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  Ambulance,
  Users,
  Hospital,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ambulanceAPI, userAPI, hospitalAPI, emergencyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected, all
  const [ambulances, setAmbulances] = useState([]);
  const [stats, setStats] = useState({
    totalAmbulances: 0,
    pendingVerification: 0,
    verified: 0,
    totalUsers: 0,
    activeRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all ambulances
      const ambulanceResponse = await ambulanceAPI.getAllAmbulances({
        page: 1,
        limit: 100
      });
      
      let filteredAmbulances = ambulanceResponse.data.data;
      
      // Filter based on active tab
      if (activeTab === 'pending') {
        filteredAmbulances = filteredAmbulances.filter(
          amb => !amb.isVerified && (!amb.verificationStatus || amb.verificationStatus === 'pending')
        );
      } else if (activeTab === 'approved') {
        filteredAmbulances = filteredAmbulances.filter(amb => amb.isVerified);
      } else if (activeTab === 'rejected') {
        filteredAmbulances = filteredAmbulances.filter(
          amb => amb.verificationStatus === 'rejected'
        );
      }
      
      setAmbulances(filteredAmbulances);
      
      // Calculate stats
      setStats({
        totalAmbulances: ambulanceResponse.data.total,
        pendingVerification: ambulanceResponse.data.data.filter(
          amb => !amb.isVerified && (!amb.verificationStatus || amb.verificationStatus === 'pending')
        ).length,
        verified: ambulanceResponse.data.data.filter(amb => amb.isVerified).length,
        totalUsers: 0, // Will be fetched separately
        activeRequests: 0 // Will be fetched separately
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleVerify = async (ambulanceId) => {
    try {
      await ambulanceAPI.verifyAmbulance(ambulanceId);
      toast.success('Ambulance verified successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify ambulance');
    }
  };

  const handleReject = async (ambulanceId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      // Update ambulance with rejection
      await ambulanceAPI.updateAmbulance(ambulanceId, {
        verificationStatus: 'rejected',
        rejectionReason: reason
      });
      toast.success('Ambulance rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject ambulance');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-600 to-red-500 p-2 rounded-lg">
<Shield className="w-6 h-6 text-white" />
</div>
<div>
<h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
<p className="text-sm text-gray-400">Rapid Response Management</p>
</div>
</div><button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>

  {/* Stats */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
            <Ambulance className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.totalAmbulances}</p>
        <p className="text-sm text-gray-400">Total Ambulances</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-900/50 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.pendingVerification}</p>
        <p className="text-sm text-gray-400">Pending Verification</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.verified}</p>
        <p className="text-sm text-gray-400">Verified Ambulances</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.activeRequests}</p>
        <p className="text-sm text-gray-400">Active Requests</p>
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
      <div className="flex border-b border-gray-700">
        {[
          { key: 'pending', label: 'Pending Verification', count: stats.pendingVerification },
          { key: 'approved', label: 'Approved', count: stats.verified },
          { key: 'rejected', label: 'Rejected', count: 0 },
          { key: 'all', label: 'All Ambulances', count: stats.totalAmbulances }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'text-red-500 border-b-2 border-red-500 bg-gray-900/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>

    {/* Ambulance List */}
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {activeTab === 'pending' ? 'Pending Verification' :
           activeTab === 'approved' ? 'Approved Ambulances' :
           activeTab === 'rejected' ? 'Rejected Ambulances' :
           'All Ambulances'}
        </h2>

        {ambulances.length === 0 ? (
          <div className="text-center py-12">
            <Ambulance className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No ambulances found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ambulances.map((ambulance) => (
              <div 
                key={ambulance._id}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Ambulance className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {ambulance.registrationNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ambulance.type === 'ALS' 
                            ? 'bg-purple-900/50 text-purple-400 border border-purple-700'
                            : 'bg-blue-900/50 text-blue-400 border border-blue-700'
                        }`}>
                          {ambulance.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ambulance.serviceType === 'government'
                            ? 'bg-green-900/50 text-green-400 border border-green-700'
                            : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                        }`}>
                          {ambulance.serviceType}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 mb-1">Driver</p>
                          <p className="text-gray-300 font-semibold">
                            {ambulance.driverId?.name || 'N/A'}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {ambulance.driverId?.phone || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Vehicle</p>
                          <p className="text-gray-300 font-semibold">
                            {ambulance.vehicleDetails?.make} {ambulance.vehicleDetails?.model}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {ambulance.vehicleDetails?.year} • {ambulance.vehicleDetails?.color}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Equipment</p>
                          <p className="text-gray-300 font-semibold">
                            {ambulance.equipment?.length || 0} items
                          </p>
                        </div>
                      </div>

                      {ambulance.equipment && ambulance.equipment.length > 0 && (
                        <div className="mb-4">
                          <p className="text-gray-500 text-sm mb-2">Available Equipment:</p>
                          <div className="flex flex-wrap gap-2">
                            {ambulance.equipment.slice(0, 5).map((eq, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700"
                              >
                                {eq.name}
                              </span>
                            ))}
                            {ambulance.equipment.length > 5 && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700">
                                +{ambulance.equipment.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Registered: {new Date(ambulance.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Rides: {ambulance.totalRides || 0}</span>
                        <span>•</span>
                        <span>Rating: {ambulance.rating?.average?.toFixed(1) || '0.0'} ★</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {activeTab === 'pending' && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleVerify(ambulance._id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(ambulance._id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'rejected' && ambulance.rejectionReason && (
                    <div className="ml-4 max-w-xs">
                      <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                        <p className="text-xs text-red-400 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-300">{ambulance.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</div>);
};
export default AdminDashboard;