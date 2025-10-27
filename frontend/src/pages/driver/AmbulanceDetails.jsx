import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Ambulance, 
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  AlertCircle,
  Package,
  DollarSign,
  FileText
} from 'lucide-react';
import { ambulanceAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AmbulanceDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmbulanceDetails();
  }, []);

  const fetchAmbulanceDetails = async () => {
    try {
      const response = await ambulanceAPI.getMyAmbulance();
      setAmbulance(response.data.data);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        // No ambulance found
        navigate('/driver/register-ambulance');
      } else {
        toast.error('Failed to load ambulance details');
        setLoading(false);
      }
    }
  };

  const getVerificationStatusBadge = () => {
    if (!ambulance?.isVerified && !ambulance?.verificationStatus) {
      return (
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">Pending Verification</span>
        </div>
      );
    }

    switch (ambulance?.verificationStatus) {
      case 'pending':
        return (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Pending Verification</span>
          </div>
        );
      case 'under_review':
        return (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Under Review</span>
          </div>
        );
      case 'approved':
        return (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Verified</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-full">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!ambulance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Ambulance className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Ambulance Registered
          </h2>
          <p className="text-gray-600 mb-6">
            Register your ambulance to start accepting rides
          </p>
          <button
            onClick={() => navigate('/driver/register-ambulance')}
            className="btn-primary w-full"
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
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Ambulance className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Ambulance</h1>
                <p className="text-gray-600">{ambulance.registrationNumber}</p>
              </div>
            </div>
            {getVerificationStatusBadge()}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Verification Status Alert */}
        {ambulance.verificationStatus === 'pending' && (
          <div className="card bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-1">Verification Pending</h3>
                <p className="text-sm text-yellow-800">
                  Your ambulance is awaiting verification by our admin team. This usually takes 24-48 hours. 
                  You will be notified once your ambulance is verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {ambulance.verificationStatus === 'rejected' && (
          <div className="card bg-red-50 border-2 border-red-200">
            <div className="flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">Verification Rejected</h3>
                <p className="text-sm text-red-800 mb-2">
                  {ambulance.rejectionReason || 'Your ambulance registration was rejected. Please contact support for more details.'}
                </p>
                <button
                  onClick={() => navigate('/support')}
                  className="text-sm font-semibold text-red-700 hover:text-red-800 underline"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}

        {ambulance.isVerified && (
          <div className="card bg-green-50 border-2 border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-1">Ambulance Verified</h3>
                <p className="text-sm text-green-800">
                  Your ambulance has been verified and is ready to accept emergency requests!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            {/* <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Edit className="w-4 h-4" />
              <span className="text-sm font-semibold">Edit</span>
            </button> */}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Registration Number</p>
              <p className="text-lg font-semibold text-gray-900">{ambulance.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ambulance Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {ambulance.type} - {ambulance.type === 'BLS' ? 'Basic Life Support' : 'Advanced Life Support'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Service Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{ambulance.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                ambulance.status === 'on_duty' ? 'bg-blue-100 text-blue-800' :
                ambulance.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {ambulance.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Make</p>
              <p className="text-lg font-semibold text-gray-900">{ambulance.vehicleDetails.make}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Model</p>
              <p className="text-lg font-semibold text-gray-900">{ambulance.vehicleDetails.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Year</p>
              <p className="text-lg font-semibold text-gray-900">{ambulance.vehicleDetails.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Color</p>
              <p className="text-lg font-semibold text-gray-900">{ambulance.vehicleDetails.color}</p>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <Package className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Medical Equipment</h2>
          </div>
          
          {ambulance.equipment && ambulance.equipment.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ambulance.equipment.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No equipment listed</p>
          )}
        </div>

        {/* Fare Structure (for private) */}
        {ambulance.serviceType === 'private' && ambulance.fareStructure && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Fare Structure</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Base Fare</p>
                <p className="text-2xl font-bold text-gray-900">₹{ambulance.fareStructure.baseFare}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Per Km Charge</p>
                <p className="text-2xl font-bold text-gray-900">₹{ambulance.fareStructure.perKmCharge}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Waiting Charges</p>
                <p className="text-2xl font-bold text-gray-900">₹{ambulance.fareStructure.waitingCharges}/min</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rides</p>
              <p className="text-3xl font-bold text-gray-900">{ambulance.totalRides || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-gray-900">{ambulance.rating?.average?.toFixed(1) || '0.0'}</p>
                <span className="text-yellow-500">★</span>
              </div>
              <p className="text-xs text-gray-500">{ambulance.rating?.count || 0} ratings</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{ambulance.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Verified</p>
              <p className="text-lg font-semibold text-gray-900">{ambulance.isVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Documents (if any) */}
        {ambulance.documents && ambulance.documents.length > 0 && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Documents</h2>
            </div>
            
            <div className="space-y-3">
              {ambulance.documents.map((doc, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{doc.type.replace('_', ' ')}</p>
                    {doc.expiryDate && (
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {doc.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AmbulanceDetails;