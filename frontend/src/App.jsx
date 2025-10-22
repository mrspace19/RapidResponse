import React from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import Features from './components/Features.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <h1 className="text-4xl text-red-600 font-bold">Tailwind Test</h1>
      <HeroSection />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}