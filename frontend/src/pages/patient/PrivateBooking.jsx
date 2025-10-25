import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ambulance, MapPin, Calendar, Clock, IndianRupee } from 'lucide-react';

const PrivateBooking = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Private Ambulance Booking</h1>
          <p className="text-blue-100 mt-1">Book a private ambulance with transparent pricing</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Ambulance className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Private Booking Feature
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This feature allows you to book private ambulances for scheduled transfers and non-emergency situations.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8 text-left">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Select Locations</p>
                <p className="text-sm text-gray-600">Choose pickup and drop-off points</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Schedule Time</p>
                <p className="text-sm text-gray-600">Book for now or schedule later</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <IndianRupee className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Transparent Pricing</p>
                <p className="text-sm text-gray-600">See fare estimate before booking</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Real-time Tracking</p>
                <p className="text-sm text-gray-600">Track your ambulance in real-time</p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Coming Soon</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivateBooking;