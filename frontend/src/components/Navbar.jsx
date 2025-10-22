
import React, { useState } from 'react';
import { Menu, X, Activity, Clock, Shield, Users, ChevronRight, Phone, MapPin } from 'lucide-react';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">MediRide</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-red-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-red-600 transition">How It Works</a>
            <a href="#about" className="text-gray-700 hover:text-red-600 transition">About</a>
            <a href="#contact" className="text-gray-700 hover:text-red-600 transition">Contact</a>
            <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition">
              Sign In
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <a href="#features" className="block py-2 text-gray-700 hover:text-red-600">Features</a>
            <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-red-600">How It Works</a>
            <a href="#about" className="block py-2 text-gray-700 hover:text-red-600">About</a>
            <a href="#contact" className="block py-2 text-gray-700 hover:text-red-600">Contact</a>
            <button className="w-full mt-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg">
              Sign In
            </button>
            <button className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;