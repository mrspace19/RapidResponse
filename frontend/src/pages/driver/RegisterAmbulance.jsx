import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Ambulance, 
  Car, 
  FileText, 
  CheckCircle,
  Upload,
  AlertCircle
} from 'lucide-react';
import { ambulanceAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const RegisterAmbulance = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Vehicle Details, 3: Equipment
  
  const [formData, setFormData] = useState({
    registrationNumber: '',
    type: 'BLS',
    serviceType: 'government',
    vehicleDetails: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: ''
    },
    equipment: [],
    fareStructure: {
      baseFare: 0,
      perKmCharge: 0,
      waitingCharges: 0
    }
  });

  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 1 });

  const equipmentPresets = [
    'Stretcher',
    'Oxygen Cylinder',
    'First Aid Kit',
    'Defibrillator',
    'Ventilator',
    'Blood Pressure Monitor',
    'ECG Machine',
    'Suction Machine',
    'IV Stand',
    'Spine Board',
    'Neck Collar',
    'Splints',
    'Bandages',
    'Emergency Medications'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vehicle.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        vehicleDetails: {
          ...formData.vehicleDetails,
          [field]: value
        }
      });
    } else if (name.startsWith('fare.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        fareStructure: {
          ...formData.fareStructure,
          [field]: parseFloat(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddEquipment = (equipmentName) => {
    if (formData.equipment.some(e => e.name === equipmentName)) {
      // Remove if already added
      setFormData({
        ...formData,
        equipment: formData.equipment.filter(e => e.name !== equipmentName)
      });
    } else {
      // Add equipment
      setFormData({
        ...formData,
        equipment: [...formData.equipment, { name: equipmentName, quantity: 1, isWorking: true }]
      });
    }
  };

  const handleAddCustomEquipment = () => {
    if (newEquipment.name.trim()) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, { ...newEquipment, isWorking: true }]
      });
      setNewEquipment({ name: '', quantity: 1 });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const dataToSubmit = {
      ...formData,
      driverId: user._id,
      fareStructure: formData.serviceType === 'private' ? formData.fareStructure : undefined
    };

    const response = await ambulanceAPI.register(dataToSubmit);
    
    toast.success('Ambulance registered successfully! Awaiting verification.', {
      duration: 5000
    });
    
    // Navigate to dashboard which will show pending state
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to register ambulance');
  } finally {
    setLoading(false);
  }
};

  const isEquipmentSelected = (name) => {
    return formData.equipment.some(e => e.name === name);
  };

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
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Ambulance className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Register Your Ambulance</h1>
              <p className="text-gray-600">Provide your ambulance details to start accepting rides</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                } transition-all`}>
                  {s < step ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                <p className="text-sm mt-2 text-gray-600">
                  {s === 1 ? 'Basic Info' : s === 2 ? 'Vehicle Details' : 'Equipment'}
                </p>
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${s < step ? 'bg-blue-600' : 'bg-gray-300'} mx-4`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="card space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="input-field uppercase"
                  placeholder="e.g., DL-01-AB-1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambulance Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="BLS">BLS - Basic Life Support</option>
                  <option value="ALS">ALS - Advanced Life Support</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.type === 'BLS' 
                    ? 'Basic Life Support: For stable patients with basic medical needs'
                    : 'Advanced Life Support: For critical patients requiring advanced medical care'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="government">Government (Free Service)</option>
                  <option value="private">Private (Paid Service)</option>
                </select>
              </div>

              {formData.serviceType === 'private' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Fare Structure</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Fare (₹)
                      </label>
                      <input
                        type="number"
                        name="fare.baseFare"
                        value={formData.fareStructure.baseFare}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Per Km Charge (₹)
                      </label>
                      <input
                        type="number"
                        name="fare.perKmCharge"
                        value={formData.fareStructure.perKmCharge}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waiting Charges (₹/min)
                      </label>
                      <input
                        type="number"
                        name="fare.waitingCharges"
                        value={formData.fareStructure.waitingCharges}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Next: Vehicle Details
              </button>
            </div>
          )}

          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <div className="card space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make/Brand *
                  </label>
                  <input
                    type="text"
                    name="vehicle.make"
                    value={formData.vehicleDetails.make}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Tata, Mahindra, Force"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="vehicle.model"
                    value={formData.vehicleDetails.model}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Winger, Traveller"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="vehicle.year"
                    value={formData.vehicleDetails.year}
                    onChange={handleChange}
                    className="input-field"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="vehicle.color"
                    value={formData.vehicleDetails.color}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., White"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Next: Equipment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Equipment */}
          {step === 3 && (
            <div className="card space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Equipment</h2>
              
              <p className="text-sm text-gray-600">
                Select the equipment available in your ambulance:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipmentPresets.map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => handleAddEquipment(equipment)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isEquipmentSelected(equipment)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isEquipmentSelected(equipment) && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{equipment}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Custom Equipment
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                    className="input-field flex-1"
                    placeholder="Equipment name"
                  />
                  <input
                    type="number"
                    value={newEquipment.quantity}
                    onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) })}
                    className="input-field w-24"
                    min="1"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEquipment}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Equipment List */}
              {formData.equipment.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Selected Equipment ({formData.equipment.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment.map((eq, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-full text-sm border border-green-300"
                      >
                        <span>{eq.name}</span>
                        {eq.quantity > 1 && <span className="text-gray-500">×{eq.quantity}</span>}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            equipment: formData.equipment.filter((_, i) => i !== index)
                          })}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important</p>
                    <p>
                      Your ambulance will be verified by our team before you can start accepting rides. 
                      This usually takes 24-48 hours. You'll be notified via email once verified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Registering...' : 'Register Ambulance'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterAmbulance;