import React, { useState, useEffect } from 'react';
import { Ambulance, Heart, Phone, MapPin, Shield, Clock, Star, Menu, X, ChevronRight, Activity, Users, Zap, CheckCircle, TrendingUp, HeartPulse } from 'lucide-react';

export default function RapidResponseLanding() {
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
      features: ["Free of Cost", "BLS & ALS", "Priority Response"]
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
    { step: "1", title: "Request", description: "Tap emergency or book private ambulance", icon: <Phone className="w-6 h-6" /> },
    { step: "2", title: "Match", description: "Nearest ambulance gets notified instantly", icon: <MapPin className="w-6 h-6" /> },
    { step: "3", title: "Track", description: "Real-time tracking with live ETA updates", icon: <Activity className="w-6 h-6" /> },
    { step: "4", title: "Care", description: "Hospital pre-notified and ready for you", icon: <Heart className="w-6 h-6" /> }
  ];

  const features = [
    { icon: <Clock className="w-6 h-6" />, title: "Real-Time Tracking", description: "Track ambulance location live on map" },
    { icon: <Shield className="w-6 h-6" />, title: "Verified Drivers", description: "All drivers are certified and trained" },
    { icon: <HeartPulse className="w-6 h-6" />, title: "Hospital Matching", description: "Auto-match with best nearby hospitals" },
    { icon: <Star className="w-6 h-6" />, title: "Rated Service", description: "Quality assured with user ratings" },
    { icon: <Users className="w-6 h-6" />, title: "24/7 Support", description: "Round the clock emergency support" },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Smart Routing", description: "AI-powered fastest route selection" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Ambulance className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Rapid Response
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Services</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-red-600 transition-colors font-medium">How It Works</a>
              <a href="#features" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Features</a>
              <a href="#contact" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Contact</a>
              <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:shadow-lg">
                Get Started
              </button>
            </div>

            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-6 space-y-4">
              <a href="#services" className="block text-gray-700 hover:text-red-600 font-medium">Services</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-red-600 font-medium">How It Works</a>
              <a href="#features" className="block text-gray-700 hover:text-red-600 font-medium">Features</a>
              <a href="#contact" className="block text-gray-700 hover:text-red-600 font-medium">Contact</a>
              <button className="w-full px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-600">Emergency Medical Service</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Life-Saving Care,
                <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"> Minutes Away</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                India's most trusted ambulance service platform. Connect with emergency and private ambulances instantly. Real-time tracking, verified drivers, and direct hospital coordination.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all hover:shadow-xl flex items-center justify-center space-x-2 text-lg font-semibold">
                  <Phone className="w-5 h-5" />
                  <span>Emergency Request</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center space-x-2 text-lg font-semibold">
                  <Ambulance className="w-5 h-5" />
                  <span>Book Private</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Lives Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">&lt;5 Min</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Emergency Active</div>
                      <div className="text-sm text-gray-600">Ambulance en route</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-600 to-red-500 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">Live Tracking</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">ETA: 3 min</span>
                      </div>
                    </div>
                    <div className="h-32 bg-white/20 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      <MapPin className="w-16 h-16 text-white relative z-10" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-90">Ambulance ID:</span>
                        <span className="font-semibold">AMB-2024-1547</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-90">Type:</span>
                        <span className="font-semibold">ALS (Advanced)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-90">Distance:</span>
                        <span className="font-semibold">1.2 km away</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Hospital Matched</div>
                        <div className="text-xs text-gray-600">AIIMS Trauma Center</div>
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
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Choose the service that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <div className={`w-16 h-16 bg-${service.color}-100 rounded-xl flex items-center justify-center text-${service.color}-600 mb-6`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <div className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
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
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get help in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need for emergency care</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Save Lives?</h2>
          <p className="text-xl text-red-100 mb-8">Join thousands who trust Rapid Response for emergency care</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg">
              Download App
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-red-600 transition-all font-semibold text-lg">
              Register Ambulance
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Ambulance className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Rapid Response</span>
              </div>
              <p className="text-gray-400">Saving lives, one call at a time.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emergency Ambulance</li>
                <li>Private Booking</li>
                <li>Hospital Network</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Emergency</h4>
              <p className="text-2xl font-bold text-red-500">108</p>
              <p className="text-gray-400 text-sm">24/7 Helpline</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rapid Response. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}