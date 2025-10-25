import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Heart,
  Car,
  Flame,
  Activity,
  AlertCircle,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useEmergencyStore from '../../store/emergencyStore';
import socketService from '../../services/socket';
import geolocationService from '../../services/geolocation';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EmergencyRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createEmergency } = useEmergencyStore();

  const [step, setStep] = useState(1); // 1: Type, 2: Details, 3: Confirming, 4: Searching
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const [formData, setFormData] = useState({
    emergencyType: '',
    ambulanceType: 'BLS',
    severity: 'high',
    patientDetails: {
      name: user?.name || '',
      age: '',
      gender: '',
      symptoms: '',
      consciousnessLevel: 'conscious',
    },
    notes: '',
  });

  const emergencyTypes = [
    { id: 'heart_attack', name: 'Heart Attack', icon: Heart, color: 'red', ambulance: 'ALS' },
    { id: 'road_accident', name: 'Road Accident', icon: Car, color: 'orange', ambulance: 'ALS' },
    { id: 'stroke', name: 'Stroke', icon: Activity, color: 'purple', ambulance: 'ALS' },
    { id: 'burns', name: 'Burns', icon: Flame, color: 'red', ambulance: 'BLS' },
    { id: 'trauma', name: 'Trauma', icon: AlertCircle, color: 'yellow', ambulance: 'ALS' },
    { id: 'breathing_difficulty', name: 'Breathing Problem', icon: Activity, color: 'blue', ambulance: 'BLS' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const pos = await geolocationService.getCurrentPosition();
      setLocation({
        latitude: pos.latitude,
        longitude: pos.longitude,
      });
      toast.success('Location detected');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const selectEmergencyType = (type) => {
    const selected = emergencyTypes.find(t => t.id === type.id);
    setFormData({
      ...formData,
      emergencyType: type.id,
      ambulanceType: selected.ambulance,
    });
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('patient.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        patientDetails: {
          ...formData.patientDetails,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      toast.error('Please enable location services');
      return;
    }

    setLoading(true);
    setStep(3);

    // Create emergency request via API
    const result = await createEmergency({
      ...formData,
      pickupLocation: {
        longitude: location.longitude,
        latitude: location.latitude,
        address: 'Current Location', // You can use reverse geocoding API here
      },
    });

    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      setStep(2);
      return;
    }

    setRequestId(result.data._id);
    setStep(4);

    // Emit socket event to search for ambulances
    socketService.createEmergency(
      {
        patientId: user._id,
        emergencyType: formData.emergencyType,
        severity: formData.severity,
        pickupLocation: {
          longitude: location.longitude,
          latitude: location.latitude,
          address: 'Current Location',
        },
        ambulanceType: formData.ambulanceType,
        patientDetails: formData.patientDetails,
        notes: formData.notes,
      },
      {
        onSearching: (data) => {
          toast.success(`Notifying ${data.ambulancesNotified} nearby ambulances`);
        },
        onAccepted: (data) => {
          toast.success('Ambulance on the way!');
          navigate(`/track/${requestId || result.data._id}`);
        },
        onNoAmbulance: () => {
          toast.error('No ambulances available nearby');
          setLoading(false);
        },
        onTimeout: () => {
          toast.error('Request timeout - No ambulance accepted');
          setLoading(false);
        },
        onError: (error) => {
          toast.error(error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Emergency Request</h1>
          <p className="text-red-100 mt-1">We'll find the nearest ambulance for you</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1: Select Emergency Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What's the emergency?
              </h2>
              <p className="text-gray-600">Select the type of medical emergency</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {emergencyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => selectEmergencyType(type)}
                    className="card hover:shadow-xl transition-all duration-300 hover:border-red-500 border-2 border-transparent group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-${type.color}-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 text-${type.color}-600`} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {type.ambulance} Ambulance
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other Emergency */}
            <button
              onClick={() => {
                setFormData({ ...formData, emergencyType: 'other' });
                setStep(2);
              }}
              className="w-full card hover:shadow-xl transition-all border-2 border-dashed border-gray-300 hover:border-red-500"
            >
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700 font-semibold">Other Emergency</p>
                <p className="text-sm text-gray-500">Describe your emergency</p>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Patient Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Patient Information
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      name="patient.name"
                      value={formData.patientDetails.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="patient.age"
                      value={formData.patientDetails.age}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Age"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="patient.gender"
                    value={formData.patientDetails.gender}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms / Condition
                  </label>
                  <textarea
                    name="patient.symptoms"
                    value={formData.patientDetails.symptoms}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="3"
                    placeholder="Describe the symptoms..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consciousness Level
                  </label>
                  <select
                    name="patient.consciousnessLevel"
                    value={formData.patientDetails.consciousnessLevel}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="conscious">Conscious</option>
                    <option value="semi_conscious">Semi-conscious</option>
                    <option value="unconscious">Unconscious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="2"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              {/* Location Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Pickup Location
                    </p>
                    {location ? (
                      <p className="text-sm text-blue-700">
                        Current Location ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                      </p>
                    ) : (
                      <p className="text-sm text-blue-700">Detecting location...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!location || loading}
                  className="btn-primary flex-1"
                >
                  Request Emergency Ambulance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirming */}
        {step === 3 && (
          <div className="card text-center py-12">
            <LoadingSpinner size="lg" />
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">
              Creating Emergency Request
            </h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        )}

        {/* Step 4: Searching for Ambulance */}
        {step === 4 && (
          <div className="card text-center py-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full mx-auto flex items-center justify-center pulse-ring">
                <Phone className="w-12 h-12 text-red-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Searching for Nearby Ambulances
            </h3>
            <p className="text-gray-600 mb-6">
              We're notifying ambulances in your area. Please wait...
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>

            <button
              onClick={() => {
                socketService.cancelEmergency({ requestId });
                navigate('/dashboard');
              }}
              className="mt-8 text-red-600 hover:text-red-700 font-semibold"
            >
              Cancel Request
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmergencyRequest;