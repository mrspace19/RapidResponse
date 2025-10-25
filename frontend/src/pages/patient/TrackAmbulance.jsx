import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  Phone,
  Navigation,
  Hospital,
  AlertCircle,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useEmergencyStore from '../../store/emergencyStore';
import socketService from '../../services/socket';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TrackAmbulance = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { getRequest, currentRequest } = useEmergencyStore();

  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
    setupSocketListeners();

    return () => {
      socketService.leaveTracking({ requestId });
      socketService.off('ambulance:location_update');
      socketService.off('tracking:eta_changed');
      socketService.off('emergency:status_update');
    };
  }, [requestId]);

  const fetchRequest = async () => {
    const result = await getRequest(requestId);
    if (result.success) {
      setLoading(false);
      socketService.joinTracking({
        requestId,
        userId: result.data.patientId,
      });
    } else {
      toast.error('Failed to load request');
      navigate('/dashboard');
    }
  };

  const setupSocketListeners = () => {
    socketService.onLocationUpdate((data) => {
      setAmbulanceLocation(data.location);
    });

    socketService.onETAUpdate((data) => {
      setEta(data.eta);
    });

    socketService.onStatusUpdate((data) => {
      if (data.status === 'completed') {
        toast.success('Journey completed!');
        navigate('/my-requests');
      }
    });

    socketService.onDriverArrived(() => {
      toast.success('Ambulance has arrived at your location!');
    });

    socketService.onPatientOnboard(() => {
      toast.success('En route to hospital');
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      accepted: 'Ambulance Accepted',
      en_route_to_pickup: 'On the Way',
      arrived_at_pickup: 'Arrived at Location',
      patient_picked: 'Patient Onboard',
      en_route_to_hospital: 'Going to Hospital',
      arrived_at_hospital: 'Arrived at Hospital',
      completed: 'Completed',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!currentRequest) {
    return null;
  }

  const patientLocation = {
    lat: currentRequest.pickupLocation.coordinates[1],
    lng: currentRequest.pickupLocation.coordinates[0],
  };

  const currentAmbulanceLocation =
    ambulanceLocation || {
      lat:
        currentRequest.assignedAmbulanceId?.currentLocation?.coordinates[1] ||
        patientLocation.lat,
      lng:
        currentRequest.assignedAmbulanceId?.currentLocation?.coordinates[0] ||
        patientLocation.lng,
    };

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
          <h1 className="text-lg font-bold text-gray-900">Track Ambulance</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[patientLocation.lat, patientLocation.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Patient Location */}
          <Marker position={[patientLocation.lat, patientLocation.lng]}>
            <Popup>
              <strong>Pickup Location</strong>
              <br />
              {currentRequest.pickupLocation.address}
            </Popup>
          </Marker>

          {/* Ambulance Location */}
          {currentAmbulanceLocation && (
            <Marker
              position={[
                currentAmbulanceLocation.lat,
                currentAmbulanceLocation.lng,
              ]}
            >
              <Popup>
                <strong>Ambulance</strong>
                <br />
                {currentRequest.assignedAmbulanceId?.registrationNumber}
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {currentAmbulanceLocation && (
            <Polyline
              positions={[
                [currentAmbulanceLocation.lat, currentAmbulanceLocation.lng],
                [patientLocation.lat, patientLocation.lng],
              ]}
              color="red"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>

        {/* Floating Info Card */}
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-3xl p-6 max-h-[50vh] overflow-y-auto z-20">
          {/* Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-xl font-bold text-gray-900">
                {getStatusText(currentRequest.status)}
              </p>
            </div>
            {eta && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">ETA</p>
                <p className="text-2xl font-bold text-red-600">{eta} min</p>
              </div>
            )}
          </div>

          {/* Ambulance Info */}
          {currentRequest.assignedAmbulanceId && (
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ambulance</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentRequest.assignedAmbulanceId.registrationNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentRequest.assignedAmbulanceId.type} -{' '}
                    {currentRequest.assignedAmbulanceId.serviceType}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-red-600" />
                </div>
              </div>

              {/* Driver Contact */}
              {currentRequest.assignedAmbulanceId.driverId && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {currentRequest.assignedAmbulanceId.driverId.name}
                        </p>
                        <p className="text-sm text-gray-600">Driver</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${currentRequest.assignedAmbulanceId.driverId.phone}`}
                      className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-green-600" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hospital Info */}
          {currentRequest.dropLocation?.hospitalId && (
            <div className="card mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Hospital className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    Destination Hospital
                  </p>
                  <p className="font-semibold text-gray-900">
                    {currentRequest.dropLocation.hospitalId.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentRequest.dropLocation.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Info */}
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  Emergency Type
                </p>
                <p className="text-sm text-red-700">
                  {currentRequest.emergencyType
                    .replace('_', ' ')
                    .toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackAmbulance;
