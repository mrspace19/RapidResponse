import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Navigation,
  User,
  Heart,
  Hospital,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { emergencyAPI, ambulanceAPI, hospitalAPI } from '../../services/api';
import socketService from '../../services/socket';
import geolocationService from '../../services/geolocation';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ActiveRide = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rideStatus, setRideStatus] = useState('en_route_to_pickup'); // en_route_to_pickup, arrived_at_pickup, patient_picked, en_route_to_hospital, arrived_at_hospital

  useEffect(() => {
    fetchRequestDetails();
    startLocationTracking();

    return () => {
      geolocationService.clearWatch();
    };
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await emergencyAPI.getRequest(requestId);
      setRequest(response.data.data);
      setRideStatus(response.data.data.status);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load request details');
      navigate('/dashboard');
    }
  };

  const startLocationTracking = () => {
    geolocationService.watchPosition(
      (position) => {
        setCurrentLocation(position);
        
        // Update location via socket
        socketService.updateLocation({
          ambulanceId: request?.assignedAmbulanceId,
          location: position,
          requestId
        });
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await emergencyAPI.updateStatus(requestId, { status: newStatus });
      setRideStatus(newStatus);
      
      // Emit status update via socket
      socketService.updateEmergencyStatus({ requestId, status: newStatus });
      
      const statusMessages = {
        'arrived_at_pickup': 'Marked as arrived at pickup location',
        'patient_picked': 'Patient picked up successfully',
        'en_route_to_hospital': 'Heading to hospital',
        'arrived_at_hospital': 'Arrived at hospital',
        'completed': 'Ride completed successfully'
      };
      
      toast.success(statusMessages[newStatus] || 'Status updated');
      
      if (newStatus === 'completed') {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading || !request) {
    return <LoadingSpinner fullScreen />;
  }

  const pickupLocation = {
    lat: request.pickupLocation.coordinates[1],
    lng: request.pickupLocation.coordinates[0]
  };

  const hospitalLocation = request.dropLocation?.coordinates ? {
    lat: request.dropLocation.coordinates[1],
    lng: request.dropLocation.coordinates[0]
  } : null;

  const driverLocation = currentLocation ? {
    lat: currentLocation.latitude,
    lng: currentLocation.longitude
  } : pickupLocation;

  const getNextAction = () => {
    switch (rideStatus) {
      case 'accepted':
      case 'en_route_to_pickup':
        return {
          text: 'Arrived at Pickup Location',
          status: 'arrived_at_pickup',
          color: 'blue'
        };
      case 'arrived_at_pickup':
        return {
          text: 'Patient Picked Up',
          status: 'patient_picked',
          color: 'green'
        };
      case 'patient_picked':
        return {
          text: 'En Route to Hospital',
          status: 'en_route_to_hospital',
          color: 'purple'
        };
      case 'en_route_to_hospital':
        return {
          text: 'Arrived at Hospital',
          status: 'arrived_at_hospital',
          color: 'indigo'
        };
      case 'arrived_at_hospital':
        return {
          text: 'Complete Ride',
          status: 'completed',
          color: 'green'
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Active Emergency</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[driverLocation.lat, driverLocation.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          {/* Driver Location */}
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>

          {/* Pickup Location */}
          {(rideStatus === 'accepted' || rideStatus === 'en_route_to_pickup' || rideStatus === 'arrived_at_pickup') && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
              <Popup>
                <strong>Pickup Location</strong>
                <br />
                {request.pickupLocation.address}
              </Popup>
            </Marker>
          )}

          {/* Hospital Location */}
          {hospitalLocation && (rideStatus === 'patient_picked' || rideStatus === 'en_route_to_hospital' || rideStatus === 'arrived_at_hospital') && (
            <Marker position={[hospitalLocation.lat, hospitalLocation.lng]}>
              <Popup>
                <strong>Hospital</strong>
                <br />
                {request.dropLocation?.address}
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {currentLocation && (
            <Polyline
              positions={[
                [driverLocation.lat, driverLocation.lng],
                rideStatus === 'patient_picked' || rideStatus === 'en_route_to_hospital' || rideStatus === 'arrived_at_hospital'
? [hospitalLocation.lat, hospitalLocation.lng]
: [pickupLocation.lat, pickupLocation.lng]
]}
color="blue"
weight={4}
opacity={0.7}
/>
)}
</MapContainer>
{/* Floating Info Card */}
    <div className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto z-20">
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-xl font-bold text-gray-900">
            {rideStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="card mb-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {request.patientDetails?.name || 'Patient'}
              </h3>
              <p className="text-sm text-gray-600">
                {request.emergencyType.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>
          </div>
          
            <a href={`tel:${request.patientId?.phone}`}
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <Phone className="w-5 h-5 text-white" />
          </a>
        </div>

        {/* Patient Details */}
        <div className="space-y-2 text-sm">
          {request.patientDetails?.age && (
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-semibold text-gray-900">
                {request.patientDetails.age} years
              </span>
            </div>
          )}
          {request.patientDetails?.gender && (
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-semibold text-gray-900">
                {request.patientDetails.gender}
              </span>
            </div>
          )}
          {request.patientDetails?.symptoms && (
            <div className="pt-2 border-t border-red-200">
              <p className="text-gray-600 mb-1">Symptoms:</p>
              <p className="text-gray-900">{request.patientDetails.symptoms}</p>
            </div>
          )}
          {request.patientDetails?.consciousnessLevel && (
            <div className="flex justify-between">
              <span className="text-gray-600">Consciousness:</span>
              <span className="font-semibold text-gray-900">
                {request.patientDetails.consciousnessLevel}
              </span>
            </div>
          )}
        </div>

        {/* Medical History */}
        {request.patientId?.medicalHistory && (
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">Medical History</p>
            <div className="space-y-1 text-sm">
              {request.patientId.medicalHistory.bloodGroup && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-semibold text-red-600">
                    {request.patientId.medicalHistory.bloodGroup}
                  </span>
                </div>
              )}
              {request.patientId.medicalHistory.allergies?.length > 0 && (
                <div>
                  <span className="text-gray-600">Allergies: </span>
                  <span className="text-gray-900">
                    {request.patientId.medicalHistory.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pickup/Hospital Location */}
      <div className="card mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {rideStatus === 'patient_picked' || rideStatus === 'en_route_to_hospital' || rideStatus === 'arrived_at_hospital' ? (
              <Hospital className="w-5 h-5 text-blue-600" />
            ) : (
              <MapPin className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">
              {rideStatus === 'patient_picked' || rideStatus === 'en_route_to_hospital' || rideStatus === 'arrived_at_hospital'
                ? 'Destination Hospital'
                : 'Pickup Location'}
            </p>
            <p className="font-semibold text-gray-900">
              {rideStatus === 'patient_picked' || rideStatus === 'en_route_to_hospital' || rideStatus === 'arrived_at_hospital'
                ? request.dropLocation?.address || 'Hospital'
                : request.pickupLocation.address}
            </p>
          </div>
          <button
            onClick={() => {
              const location = rideStatus === 'patient_picked' || rideStatus === 'en_route_to_hospital' || rideStatus === 'arrived_at_hospital'
                ? hospitalLocation
                : pickupLocation;
              openNavigation(location.lat, location.lng);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center space-x-1"
          >
            <Navigation className="w-4 h-4" />
            <span>Navigate</span>
          </button>
        </div>
      </div>

      {/* Suggested Hospitals (if patient not picked yet) */}
      {request.suggestedHospitals?.length > 0 && 
       (rideStatus === 'accepted' || rideStatus === 'en_route_to_pickup' || rideStatus === 'arrived_at_pickup') && (
        <div className="card mb-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Hospital className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Suggested Hospitals</h3>
          </div>
          <div className="space-y-2">
            {request.suggestedHospitals.slice(0, 3).map((hospital, index) => (
              <div key={index} className="text-sm">
                <p className="font-semibold text-gray-900">
                  {hospital.hospitalId?.name || 'Hospital'}
                </p>
                <p className="text-gray-600">
                  {(hospital.distance / 1000).toFixed(1)} km • ETA: {hospital.eta} min
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {request.patientId?.emergencyContacts?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
          <div className="space-y-2">
            {request.patientId.emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relation}</p>
                </div>
                
                <a href={`tel:${contact.phone}`}
                  className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {request.notes && (
        <div className="card mb-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Additional Notes</p>
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {nextAction && (
        <button
          onClick={() => handleStatusUpdate(nextAction.status)}
          className={`w-full px-6 py-4 bg-gradient-to-r from-${nextAction.color}-600 to-${nextAction.color}-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center justify-center space-x-2`}
          style={{
            background: `linear-gradient(to right, var(--tw-gradient-stops))`,
            '--tw-gradient-from': nextAction.color === 'blue' ? '#2563eb' : 
                                 nextAction.color === 'green' ? '#16a34a' :
                                 nextAction.color === 'purple' ? '#9333ea' :
                                 nextAction.color === 'indigo' ? '#4f46e5' : '#16a34a',
            '--tw-gradient-to': nextAction.color === 'blue' ? '#1d4ed8' : 
                               nextAction.color === 'green' ? '#15803d' :
                               nextAction.color === 'purple' ? '#7e22ce' :
                               nextAction.color === 'indigo' ? '#4338ca' : '#15803d',
          }}
        >
          <CheckCircle className="w-6 h-6" />
          <span>{nextAction.text}</span>
        </button>
      )}

      {/* Warning */}
      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            Please ensure patient safety at all times. Follow all traffic rules and drive carefully.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
    );
};

export default ActiveRide;