import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ambulance, 
  LogOut, 
  User, 
  Activity, 
  Clock, 
  Star,
  MapPin,
  Phone,
  Navigation,
  Power,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import socketService from '../../services/socket';
import geolocationService from '../../services/geolocation';
import { ambulanceAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [driverStatus, setDriverStatus] = useState('offline');
  const [ambulance, setAmbulance] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);
  const [stats, setStats] = useState({
    totalRides: 0,
    todayRides: 0,
    rating: 0,
    earnings: 0
  });

  useEffect(() => {
    fetchAmbulanceDetails();
    setupSocketListeners();

    return () => {
      cleanupLocationTracking();
      socketService.offAll();
    };
  }, []);

const fetchAmbulanceDetails = async () => {
  try {
    const response = await ambulanceAPI.getMyAmbulance();
    const ambulanceData = response.data.data;
    
    setAmbulance(ambulanceData);
    setDriverStatus(ambulanceData.status);
    
    // Fetch stats
    try {
      const statsResponse = await ambulanceAPI.getStats(ambulanceData._id);
      setStats({
        totalRides: statsResponse.data.data.totalRides || 0,
        todayRides: 0,
        rating: statsResponse.data.data.rating?.average || 0,
        earnings: statsResponse.data.data.totalEarnings || 0
      });
    } catch (statsError) {
      console.error('Error fetching stats:', statsError);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      // Only redirect if ambulance truly doesn't exist
      toast.error('Please register your ambulance first');
      navigate('/driver/register-ambulance');
    } else {
      console.error('Error fetching ambulance:', error);
      toast.error('Failed to load ambulance details');
    }
  }
};

  const setupSocketListeners = () => {
    socketService.onNewRequest((data) => {
      console.log('New emergency request:', data);
      toast.success('New emergency request nearby!', {
        icon: '🚨',
        duration: 5000
      });
      
      setIncomingRequests(prev => [...prev, data]);
      
      setTimeout(() => {
        setIncomingRequests(prev => prev.filter(req => req.requestId !== data.requestId));
      }, 120000);
    });

    socketService.onRequestTaken((data) => {
      setIncomingRequests(prev => prev.filter(req => req.requestId !== data.requestId));
    });

    socketService.onRequestCancelled((data) => {
      toast.error('Request cancelled by patient');
      setIncomingRequests(prev => prev.filter(req => req.requestId !== data.requestId));
      if (activeRequest?.requestId === data.requestId) {
        setActiveRequest(null);
        setDriverStatus('available');
      }
    });
  };

  const startLocationTracking = () => {
    const watchId = geolocationService.watchPosition(
      (position) => {
        setCurrentLocation(position);
        
        if (ambulance && driverStatus !== 'offline') {
          ambulanceAPI.updateLocation(ambulance._id, {
            longitude: position.longitude,
            latitude: position.latitude
          }).catch(err => console.error('Location update failed:', err));

          if (activeRequest) {
            socketService.updateLocation({
              ambulanceId: ambulance._id,
              location: position,
              requestId: activeRequest.requestId
            });
          }
        }
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Unable to track location');
      }
    );
    
    setLocationWatchId(watchId);
  };

  const cleanupLocationTracking = () => {
    if (locationWatchId) {
      geolocationService.clearWatch();
      setLocationWatchId(null);
    }
  };

  const handleGoOnline = async () => {
    if (!ambulance) {
      toast.error('No ambulance assigned');
      return;
    }

    if (!ambulance.isVerified) {
      toast.error('Your ambulance is not verified yet');
      navigate('/driver/ambulance-details');
      return;
    }

    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentLocation(position);

      await ambulanceAPI.updateStatus(ambulance._id, { status: 'available' });

      socketService.goOnline(
        {
          driverId: user._id,
          ambulanceId: ambulance._id,
          location: position
        },
        {
          onSuccess: (data) => {
            setDriverStatus('available');
            startLocationTracking();
            toast.success('You are now online and available for requests');
          },
          onError: (error) => {
            toast.error('Failed to go online');
          }
        }
      );
    } catch (error) {
      toast.error('Please enable location services');
    }
  };

  const handleGoOffline = async () => {
    try {
      await ambulanceAPI.updateStatus(ambulance._id, { status: 'offline' });
      
      socketService.goOffline(
        { ambulanceId: ambulance._id },
        {
          onSuccess: () => {
            setDriverStatus('offline');
            cleanupLocationTracking();
            setIncomingRequests([]);
            toast.success('You are now offline');
          }
        }
      );
    } catch (error) {
      toast.error('Failed to go offline');
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      setDriverStatus('on_duty');
      setActiveRequest(request);
      
      setIncomingRequests(prev => prev.filter(req => req.requestId !== request.requestId));

      socketService.acceptEmergency(
        {
          requestId: request.requestId,
          ambulanceId: ambulance._id,
          driverId: user._id
        },
        {
          onConfirmed: (data) => {
            toast.success('Request accepted! Navigate to patient location');
            navigate(`/driver/active-ride/${request.requestId}`);
          },
          onError: (error) => {
            toast.error('Failed to accept request');
            setDriverStatus('available');
            setActiveRequest(null);
          }
        }
      );
    } catch (error) {
      console.error('Accept request error:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = (request) => {
    socketService.rejectEmergency({
      requestId: request.requestId,
      driverId: user._id,
      reason: 'Driver declined'
    });
    
    setIncomingRequests(prev => prev.filter(req => req.requestId !== request.requestId));
    toast.info('Request rejected');
  };

  const handleLogout = async () => {
    if (driverStatus !== 'offline') {
      toast.error('Please go offline before logging out');
      return;
    }
    
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'on_duty':
        return 'bg-blue-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'on_duty':
        return 'On Duty';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

if (ambulance && !ambulance.isVerified) {
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
              <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Pending Verification Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center py-12">
          <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Verification Pending
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your ambulance registration is under review. Our admin team typically completes 
            verification within 24-48 hours. You'll be notified via email once approved.
          </p>

          {/* Ambulance Details */}
          <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Ambulance className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                {ambulance.registrationNumber}
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Type:</strong> {ambulance.type}</p>
              <p><strong>Service:</strong> {ambulance.serviceType}</p>
              <p><strong>Submitted:</strong> {new Date(ambulance.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/driver/ambulance-details')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View Details
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold"
            >
              Edit Profile
            </button>
          </div>

          {/* What happens next */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What happens next?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Review</h4>
                <p className="text-sm text-gray-600">Admin reviews your ambulance details</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Verify</h4>
                <p className="text-sm text-gray-600">Documents and details verified</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Activate</h4>
                <p className="text-sm text-gray-600">Start accepting rides</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


// Show registration prompt only if no ambulance at all
if (!ambulance) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-200">
        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Ambulance className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Register Your Ambulance
        </h2>
        <p className="text-gray-600 mb-6">
          You need to register your ambulance before you can start accepting rides.
        </p>
        <button
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          onClick={() => navigate('/driver/register-ambulance')}
        >
          Register Ambulance
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Ambulance className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
                <p className="text-sm text-gray-600">{ambulance?.registrationNumber || 'Loading...'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(driverStatus)} animate-pulse`}></div>
                <span className="text-sm font-semibold text-gray-700">
                  {getStatusText(driverStatus)}
                </span>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.name}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
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
        {/* Verification Warning */}
        {ambulance && !ambulance.isVerified && (
          <div className="card bg-yellow-50 border-2 border-yellow-200 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-1">Verification Pending</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Your ambulance is awaiting verification. You cannot go online until verification is complete.
                </p>
                <button
                  onClick={() => navigate('/driver/ambulance-details')}
                  className="text-sm font-semibold text-yellow-700 hover:text-yellow-800 underline"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Online/Offline Toggle */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {driverStatus === 'offline' ? 'You are offline' : 'You are online'}
              </h3>
              <p className="text-sm text-gray-600">
                {driverStatus === 'offline' 
                  ? 'Go online to start receiving emergency requests' 
                  : driverStatus === 'available'
                  ? 'Ready to accept emergency requests'
                  : 'Currently on an active ride'}
              </p>
            </div>
            
            {ambulance?.isVerified && driverStatus === 'offline' ? (
              <button
                onClick={handleGoOnline}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center space-x-2"
              >
                <Power className="w-5 h-5" />
                <span>Go Online</span>
              </button>
            ) : driverStatus === 'available' ? (
              <button
                onClick={handleGoOffline}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center space-x-2"
              >
                <Power className="w-5 h-5" />
                <span>Go Offline</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Today's Rides</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayRides}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.earnings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Requests */}
        {driverStatus === 'available' && incomingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span>Incoming Emergency Requests ({incomingRequests.length})</span>
            </h2>
            
            <div className="space-y-4">
              {incomingRequests.map((request) => (
                <div 
                  key={request.requestId} 
                  className="card border-2 border-red-200 bg-red-50 animate-pulse-slow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {request.emergencyType.replace('_', ' ').toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.ambulanceType} Required • {request.severity.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-12">
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{request.pickupLocation.address}</span>
                        </div>
                        
                        {request.distance && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Navigation className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {(request.distance / 1000).toFixed(1)} km away
                            </span>
                          </div>
                        )}

                        {request.patientDetails && (
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              Patient: {request.patientDetails.name}, {request.patientDetails.age}y, {request.patientDetails.gender}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleAcceptRequest(request)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center space-x-2 whitespace-nowrap"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center space-x-2 whitespace-nowrap"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Request expires in:</span>
                      <span className="font-semibold text-red-600">2:00</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Requests State */}
        {driverStatus === 'available' && incomingRequests.length === 0 && (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Waiting for Emergency Requests
            </h3>
            <p className="text-gray-600 mb-4">
              You will be notified when there's an emergency nearby
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online and ready to help</span>
            </div>
          </div>
        )}

        {/* Offline State */}
        {driverStatus === 'offline' && ambulance?.isVerified && (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Power className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              You are Currently Offline
            </h3>
            <p className="text-gray-600 mb-6">
              Go online to start receiving emergency requests and help save lives
            </p>
            <button
              onClick={handleGoOnline}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold inline-flex items-center space-x-2"
            >
              <Power className="w-5 h-5" />
              <span>Go Online Now</span>
            </button>
          </div>
        )}

        {/* On Duty State */}
        {driverStatus === 'on_duty' && activeRequest && (
          <div className="card border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Active Emergency</h3>
                <p className="text-sm text-gray-600">Navigate to patient location</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/driver/active-ride/${activeRequest.requestId}`)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <MapPin className="w-5 h-5" />
              <span>View Active Ride</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;
