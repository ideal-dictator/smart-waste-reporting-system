import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Play, Pause } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  avatar: string;
}

const TestimonialSlider: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Local Resident',
      location: 'Connaught Place, Delhi',
      content: 'SmartWaste has transformed our neighborhood! I reported a waste pile and it was cleaned within 24 hours. The AI classification was spot-on.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      role: 'Shop Owner',
      location: 'Lajpat Nagar, Delhi',
      content: 'As a business owner, I appreciate how easy it is to report waste issues. The system is user-friendly and the response time is excellent.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 3,
      name: 'Dr. Anita Verma',
      role: 'Environmental Activist',
      location: 'Model Town, Delhi',
      content: 'This platform has empowered our community to take action. The transparency in tracking and quick resolution makes a real difference.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 4,
      name: 'Amit Singh',
      role: 'College Student',
      location: 'Sector 18, Noida',
      content: 'I love how technology is being used for social good. The app is intuitive and makes reporting waste issues effortless.',
      rating: 4,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [testimonials.length, isPlaying]);

  const goToPrevious = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentTestimonial(index);
  };

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 md:p-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full gap-2">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="bg-green-600 rounded animate-pulse" style={{ animationDelay: `${i * 50}ms` }}></div>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real feedback from citizens who are making their neighborhoods cleaner
          </p>
        </div>

        {/* Testimonial Container */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-xl shadow-lg p-8 mx-auto max-w-3xl hover:shadow-xl transition-shadow duration-300">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Quote className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <blockquote className="text-lg md:text-xl text-gray-700 text-center mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Rating */}
                    <div className="flex justify-center mb-6">
                      <div className="flex space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center justify-center space-x-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
                      />
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-green-600 font-medium">
                          {testimonial.role}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-green-600 p-3 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-green-600 p-3 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentTestimonial
                    ? 'bg-green-600 shadow-lg'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="bg-white shadow-md hover:shadow-lg text-gray-600 hover:text-green-600 p-2 rounded-full hover:scale-110 transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;