import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ambulance, 
  Heart, 
  Phone, 
  MapPin, 
  Shield, 
  Clock, 
  Star, 
  Menu, 
  X, 
  ChevronRight, 
  Activity, 
  Users, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  HeartPulse,
  ArrowRight,
  Play
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Emergency Service",
      description: "Free government ambulances with BLS/ALS support. Instant response for critical emergencies.",
      color: "red",
      features: ["Free of Cost", "BLS & ALS Support", "Priority Response"]
    },
    {
      icon: <Ambulance className="w-8 h-8" />,
      title: "Private Service",
      description: "Book private ambulances with transparent pricing and premium amenities.",
      color: "blue",
      features: ["Transparent Pricing", "Premium Comfort", "Flexible Booking"]
    }
  ];

  const howItWorks = [
    { 
      step: "1", 
      title: "Request", 
      description: "Tap emergency button or book a private ambulance with just one click", 
      icon: <Phone className="w-6 h-6" /> 
    },
    { 
      step: "2", 
      title: "Match", 
      description: "AI instantly finds and notifies the nearest available ambulance", 
      icon: <MapPin className="w-6 h-6" /> 
    },
    { 
      step: "3", 
      title: "Track", 
      description: "Watch real-time location with live ETA and driver details", 
      icon: <Activity className="w-6 h-6" /> 
    },
    { 
      step: "4", 
      title: "Care", 
      description: "Hospital is pre-notified and prepared for your arrival", 
      icon: <Heart className="w-6 h-6" /> 
    }
  ];

  const features = [
    { 
      icon: <Clock className="w-6 h-6" />, 
      title: "Real-Time Tracking", 
      description: "Track ambulance location live on interactive map with accurate ETA" 
    },
    { 
      icon: <Shield className="w-6 h-6" />, 
      title: "Verified Drivers", 
      description: "All drivers are certified, trained, and background-verified" 
    },
    { 
      icon: <HeartPulse className="w-6 h-6" />, 
      title: "Smart Hospital Matching", 
      description: "AI matches you with the best equipped nearby hospitals" 
    },
    { 
      icon: <Star className="w-6 h-6" />, 
      title: "Rated Service", 
      description: "Quality assured through verified user ratings and reviews" 
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      title: "24/7 Support", 
      description: "Round the clock emergency support and assistance" 
    },
    { 
      icon: <TrendingUp className="w-6 h-6" />, 
      title: "Smart Routing", 
      description: "AI-powered traffic-aware fastest route selection" 
    }
  ];

  const stats = [
    { number: "50K+", label: "Lives Saved" },
    { number: "<5 Min", label: "Avg Response" },
    { number: "24/7", label: "Always Available" },
    { number: "1000+", label: "Ambulances" }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Patient",
      content: "Rapid Response saved my father's life. The ambulance arrived in 3 minutes during his heart attack. Forever grateful!",
      rating: 5
    },
    {
      name: "Dr. Priya Sharma",
      role: "Hospital Admin",
      content: "The hospital pre-notification feature helps us prepare in advance. This platform is a game-changer for emergency care.",
      rating: 5
    },
    {
      name: "Amit Singh",
      role: "Ambulance Driver",
      content: "Easy to use driver app with clear directions. The support team is always helpful. Proud to be part of this service.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-red-600 to-red-500 p-2.5 rounded-xl shadow-lg">
                <Ambulance className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Rapid Response
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                Services
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                How It Works
              </a>
              <a href="#features" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                Features
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                Testimonials
              </a>
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 text-gray-700 hover:text-red-600 transition-colors font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden text-gray-700 hover:text-red-600 transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#services" 
                className="block text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="#how-it-works" 
                className="block text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#features" 
                className="block text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="block text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <button 
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition-all font-semibold"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full border border-red-100">
                <Zap className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-600">India's #1 Emergency Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Life-Saving Care,
                <span className="block bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  Minutes Away
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Connect with emergency and private ambulances instantly. Real-time tracking, 
                verified drivers, and direct hospital coordination for when every second counts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-lg font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  <span>Request Emergency</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-lg font-semibold"
                >
                  <Ambulance className="w-5 h-5" />
                  <span>Book Private</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:pl-8">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl transform rotate-3 opacity-50"></div>
              <div className="relative bg-white p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="space-y-5">
                  {/* Active Emergency Card */}
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 animate-pulse-slow">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Emergency Active</div>
                      <div className="text-sm text-gray-600">Ambulance en route</div>
                    </div>
                  </div>

                  {/* Live Tracking Card */}
                  <div className="bg-gradient-to-br from-red-600 to-red-500 p-6 rounded-xl text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">Live Tracking</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-semibold">ETA: 3 min</span>
                      </div>
                    </div>
                    <div className="h-32 bg-white/20 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      <MapPin className="w-16 h-16 text-white relative z-10 animate-bounce" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="opacity-90">Ambulance ID:</span>
                        <span className="font-semibold">AMB-2024-1547</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="opacity-90">Type:</span>
                        <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">ALS</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="opacity-90">Distance:</span>
                        <span className="font-semibold">1.2 km away</span>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Matched Card */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Hospital Matched</div>
                        <div className="text-xs text-gray-600">AIIMS Trauma Center • 2.5 km</div>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Two Ways to Get Help
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose between free emergency service or premium private booking
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-red-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${
                  service.color === 'red' 
                    ? 'from-red-100 to-red-50' 
                    : 'from-blue-100 to-blue-50'
                } rounded-xl flex items-center justify-center ${
                  service.color === 'red' 
                    ? 'text-red-600' 
                    : 'text-blue-600'
                } mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <div className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get emergency help in 4 simple steps - fast, reliable, and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">{step.step}</span>
                    </div>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-red-300 to-transparent"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for emergency medical care, all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center text-red-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here's what our users have to say about Rapid Response
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center text-red-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-red-500 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands who trust Rapid Response for emergency medical care. 
            Get started today and be prepared for any emergency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-white text-red-600 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-red-600 transition-all font-semibold text-lg"
            >
              Register Ambulance
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-red-600 to-red-500 p-2 rounded-lg">
                  <Ambulance className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Rapid Response</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Saving lives, one call at a time. India's most trusted emergency ambulance platform.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Emergency Ambulance</li>
                <li className="hover:text-white transition-colors cursor-pointer">Private Booking</li>
                <li className="hover:text-white transition-colors cursor-pointer">Hospital Network</li>
                <li className="hover:text-white transition-colors cursor-pointer">Driver Partnership</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Emergency Helpline</h4>
              <p className="text-4xl font-bold text-red-500 mb-2">108</p>
              <p className="text-gray-400 text-sm mb-4">24/7 National Emergency Number</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
</a>
<a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
<span className="sr-only">Instagram</span>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
</a>
</div>
</div>
</div>
<div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
<p className="text-gray-400 text-sm mb-4 md:mb-0">
© 2024 Rapid Response. All rights reserved.
</p>
<div className="flex space-x-6 text-sm text-gray-400">
<a href="#" className="hover:text-white transition-colors">Terms of Service</a>
<a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
<a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
</div>
</div>
</div>
</footer>
</div>
);
}
