import React from 'react';
import {
  MapPin,
  Smartphone,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Recycle,
  Shield,
  Clock
} from 'lucide-react';
import ImageSlideshow from '../common/ImageSlideshow';
import TestimonialSlider from '../common/TestimonialSlider';

import AnimatedBackground from '../common/AnimatedBackground';

import { UserRole } from '../../types';

interface HomePageProps {
  onNavigate?: (view: string) => void;
  userRole?: UserRole;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, userRole = 'citizen' }) => {
  const features = [
    {
      icon: Smartphone,
      title: 'Easy Reporting',
      description: 'Report waste issues with just a photo and location'
    },
    {
      icon: MapPin,
      title: 'GPS Tracking',
      description: 'Automatic location detection for accurate reporting'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Citizens working together for a cleaner environment'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track progress and see the impact of your reports'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Reports Submitted' },
    { number: '95%', label: 'Resolution Rate' },
    { number: '48hrs', label: 'Avg Response Time' },
    { number: '12', label: 'Active Zones' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white animate-fade-in">
        <AnimatedBackground variant="particles" />
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6 animate-bounce-slow">
              <div className="bg-white bg-opacity-20 p-4 rounded-full hover:bg-opacity-30 transition-all duration-300 hover:scale-110">
                <Recycle className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              Smart Waste Reporting System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto animate-slide-up animation-delay-200">
              Empowering citizens to create cleaner communities through technology-driven waste management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400 px-4">
              <button
                onClick={() => {
                  if (userRole === 'citizen' || userRole === '') {
                    onNavigate?.('report');
                  } else {
                    alert('Report Waste feature is only available for citizens.');
                  }
                }}
                className="bg-white text-green-600 w-full sm:w-auto px-6 sm:px-8 py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <MapPin className="h-5 w-5" />
                <span>Report Waste Now</span>
              </button>
              <button
                onClick={() => onNavigate?.('about')}
                className="border-2 border-white text-white w-full sm:w-auto px-6 sm:px-8 py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-green-600 hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Slideshow Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
              See Our Impact in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up animation-delay-200">
              Real stories and results from communities using SmartWaste
            </p>
          </div>
          
          <div className="animate-fade-in-up animation-delay-400">
            <ImageSlideshow />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, efficient, and effective waste reporting in three easy steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-green-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up animation-delay-200 group">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">Report</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Take a photo of the waste issue and submit with your location</p>
            </div>
            
            <div className="text-center animate-fade-in-up animation-delay-400 group">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Process</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">AI classifies the waste type and assigns it to the nearest collection team</p>
            </div>
            
            <div className="text-center animate-fade-in-up animation-delay-600 group">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Resolve</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Collection team picks up the waste and updates the status</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Making a Real Impact
            </h2>
            <p className="text-xl text-green-100">
              See how our community is creating positive change
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 counter-animation">
                  {stat.number}
                </div>
                <div className="text-green-100 group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <TestimonialSlider />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose SmartWaste?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg hover:bg-green-200 hover:scale-110 transition-all duration-300">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
                    <p className="text-gray-600">Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg hover:bg-blue-200 hover:scale-110 transition-all duration-300">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Response</h3>
                    <p className="text-gray-600">Average response time of 48 hours for all reports</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-2 rounded-lg hover:bg-purple-200 hover:scale-110 transition-all duration-300">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
                    <p className="text-gray-600">95% resolution rate with transparent tracking</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="bg-white p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all duration-300 hover:shadow-lg animate-pulse-slow">
                  <MapPin className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of citizens making their communities cleaner
                </p>
                <button
                  onClick={() => {
                    if (userRole === 'citizen' || userRole === '') {
                      onNavigate?.('report');
                    } else {
                      alert('Report Waste feature is only available for citizens.');
                    }
                  }}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto group"
                >
                  <span>Report Waste Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;