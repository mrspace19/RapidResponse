import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Ambulance,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: <User className="w-5 h-5" />, label: 'Profile Information', path: '/profile', description: 'Update your personal details' },
        { icon: <Shield className="w-5 h-5" />, label: 'Privacy & Security', path: '/settings/privacy', description: 'Manage your security settings' },
      ]
    },
    {
      title: 'Driver',
      items: user.role === 'driver' ? [
        { icon: <Ambulance className="w-5 h-5" />, label: 'My Ambulance', path: '/driver/ambulance-details', description: 'View and update ambulance details' },
        { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/settings/notifications', description: 'Configure notification preferences' },
      ] : []
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', path: '/support', description: 'Get help or contact us' },
      ]
    }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, index) => (
          section.items.length > 0 && (
            <div key={index} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
                {section.title}
              </h3>
              <div className="card divide-y divide-gray-200">
                {section.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Logout */}
        <div className="card">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Logout</p>
                <p className="text-sm text-gray-500">Sign out of your account</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;