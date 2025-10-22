import React, { useState } from 'react';
import { Menu, X, Activity, Clock, Shield, Users, ChevronRight, Phone, MapPin } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Fast Response",
      description: "Average arrival time of 8 minutes. Every second counts in an emergency."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Certified Medical Staff",
      description: "All ambulances equipped with trained paramedics and emergency equipment."
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Real-Time Tracking",
      description: "Track your ambulance in real-time and share location with loved ones."
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "24/7 Availability",
      description: "Round-the-clock service ensuring help is always just a tap away."
    }
  ];

  return (
    <div id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Why Choose MediRide?</h2>
          <p className="mt-4 text-xl text-gray-600">Professional emergency care when you need it most</p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group hover:transform hover:-translate-y-2 transition">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Features;