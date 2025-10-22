import React, { useState } from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const handleBookNow = () => {
    alert('Booking functionality will be implemented in the main app!');
  };

  return (
    <div className="pt-16 bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Emergency Care, <span className="text-red-600">On Demand</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Book an ambulance in seconds. Professional medical care arrives at your doorstep faster than ever.
            </p>
            
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-900"
                  />
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Destination (Hospital)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-900"
                  />
                </div>
                <button
                  onClick={handleBookNow}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <span>Book Ambulance Now</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Available 24/7 • Average response time: 8 minutes
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&h=400&fit=crop"
                  alt="Ambulance"
                  className="rounded-2xl w-full h-80 object-cover"
                />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">5K+</div>
                    <div className="text-sm text-gray-600">Rides</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">500+</div>
                    <div className="text-sm text-gray-600">Ambulances</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">8min</div>
                    <div className="text-sm text-gray-600">Avg Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroSection;