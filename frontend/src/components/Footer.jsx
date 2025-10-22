import React, { useState } from 'react';
import { Menu, X, Activity, Clock, Shield, Users, ChevronRight, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Activity className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold">MediRide</span>
            </div>
            <p className="text-gray-400">Emergency medical transport at your fingertips.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Safety</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Emergency</h4>
            <p className="text-gray-400 mb-2">24/7 Hotline</p>
            <p className="text-2xl font-bold text-red-600">108</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 MediRide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;