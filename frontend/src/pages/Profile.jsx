import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Heart,
  UserPlus,
  Trash2,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [medicalHistory, setMedicalHistory] = useState({
    bloodGroup: user?.medicalHistory?.bloodGroup || '',
    allergies: user?.medicalHistory?.allergies || [],
    chronicConditions: user?.medicalHistory?.chronicConditions || [],
    currentMedications: user?.medicalHistory?.currentMedications || [],
  });

  const [emergencyContacts, setEmergencyContacts] = useState(
    user?.emergencyContacts || []
  );

  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: '',
  });

  // ---------- Handlers ----------
  const handleBasicInfoUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateDetails(basicInfo);
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalHistoryUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateMedicalHistory(medicalHistory);
      updateUser({ medicalHistory: response.data.data });
      toast.success('Medical history updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmergencyContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.addEmergencyContact(newContact);
      updateUser({ emergencyContacts: response.data.data });
      setEmergencyContacts(response.data.data);
      setNewContact({ name: '', phone: '', relation: '' });
      toast.success('Emergency contact added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = async (contactId) => {
    try {
      const response = await authAPI.removeEmergencyContact(contactId);
      updateUser({ emergencyContacts: response.data.data });
      setEmergencyContacts(response.data.data);
      toast.success('Contact removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove contact');
    }
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        [field]: [...medicalHistory[field], value.trim()],
      });
    }
  };

  const removeArrayItem = (field, index) => {
    setMedicalHistory({
      ...medicalHistory,
      [field]: medicalHistory[field].filter((_, i) => i !== index),
    });
  };

  // ---------- JSX ----------
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal and medical information
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          {[
            { key: 'basic', icon: <User className="w-5 h-5 inline mr-2" />, label: 'Basic Info' },
            { key: 'medical', icon: <Heart className="w-5 h-5 inline mr-2" />, label: 'Medical History' },
            { key: 'emergency', icon: <Phone className="w-5 h-5 inline mr-2" />, label: 'Emergency Contacts' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Basic Information
            </h2>
            <form onSubmit={handleBasicInfoUpdate} className="space-y-4">
              {['name', 'email', 'phone'].map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field === 'email' ? 'Email Address' : field === 'phone' ? 'Phone Number' : 'Full Name'}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    value={basicInfo[field]}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, [field]: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              ))}
              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  <Save className="w-5 h-5 inline mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Medical History */}
        {activeTab === 'medical' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Medical History
            </h2>
            <form onSubmit={handleMedicalHistoryUpdate} className="space-y-6">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={medicalHistory.bloodGroup}
                  onChange={(e) =>
                    setMedicalHistory({
                      ...medicalHistory,
                      bloodGroup: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="">Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Dynamic List Fields */}
              {[
                { field: 'allergies', label: 'Allergies', color: 'red' },
                { field: 'chronicConditions', label: 'Chronic Conditions', color: 'yellow' },
                { field: 'currentMedications', label: 'Current Medications', color: 'blue' },
              ].map(({ field, label, color }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Add ${label.toLowerCase()}...`}
                      className="input-field flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory[field].map((item, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center space-x-2 px-3 py-1 bg-${color}-100 text-${color}-800 rounded-full text-sm`}
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(field, index)}
                          className={`hover:text-${color}-900`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  <Save className="w-5 h-5 inline mr-2" />
                  {loading ? 'Saving...' : 'Save Medical History'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Emergency Contacts */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            {/* Add Contact */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Add Emergency Contact
              </h2>
              <form onSubmit={handleAddEmergencyContact} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                      className="input-field"
                      placeholder="Contact name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                      className="input-field"
                      placeholder="10-digit number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={newContact.relation}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        relation: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="e.g., Father, Mother, Spouse"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  <UserPlus className="w-5 h-5 inline mr-2" />
                  {loading ? 'Adding...' : 'Add Contact'}
                </button>
              </form>
            </div>

            {/* List Contacts */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Emergency Contacts ({emergencyContacts.length})
              </h2>
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No emergency contacts added yet
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add contacts who should be notified in case of emergency
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={contact._id || index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {contact.name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phone}</span>
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {contact.relation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveContact(contact._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
