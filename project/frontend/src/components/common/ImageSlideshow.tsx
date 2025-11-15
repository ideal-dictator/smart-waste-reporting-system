import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  category: string;
}

const ImageSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Community Cleanup Success',
      description: 'Citizens working together to report and resolve waste issues in their neighborhoods',
      category: 'Community Impact'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Smart Technology at Work',
      description: 'AI-powered waste classification helping authorities prioritize cleanup efforts',
      category: 'Technology'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Professional Waste Collection',
      description: 'Trained workers efficiently collecting and disposing waste using optimized routes',
      category: 'Operations'
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Environmental Protection',
      description: 'Protecting our environment through systematic waste management and recycling',
      category: 'Environment'
    },
    {
      id: 5,
      image: 'https://images.pexels.com/photos/2382894/pexels-photo-2382894.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Clean Cities Initiative',
      description: 'Building cleaner, healthier cities through citizen participation and smart technology',
      category: 'Smart Cities'
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className={`transform transition-all duration-1000 delay-300 ${
                index === currentSlide
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}>
                <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {slide.category}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {slide.title}
                </h3>
                <p className="text-gray-200 text-sm md:text-base max-w-2xl">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
              index === currentSlide
                ? 'bg-white shadow-lg'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-green-500 transition-all duration-300 ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
};

export default ImageSlideshow;