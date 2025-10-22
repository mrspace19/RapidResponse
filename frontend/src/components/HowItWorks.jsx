import React, { useState } from 'react';
import { Menu, X, Activity, Clock, Shield, Users, ChevronRight, Phone, MapPin } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { number: "1", title: "Request", description: "Enter your location and tap to request an ambulance" },
    { number: "2", title: "Match", description: "We connect you with the nearest available ambulance" },
    { number: "3", title: "Track", description: "Track your ambulance in real-time on the map" },
    { number: "4", title: "Care", description: "Receive professional medical care during transport" }
  ];

  return (
    <div id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-xl text-gray-600">Get emergency care in 4 simple steps</p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ChevronRight className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HowItWorks;