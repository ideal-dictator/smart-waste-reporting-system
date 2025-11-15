import React from 'react';
import { 
  Users, 
  Target, 
  Award, 
  Heart,
  Lightbulb,
  Globe,
  Recycle,
  Shield
} from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (view: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const teamMembers = [
    {
      name: 'K. Kumaran',
      role: 'Student',
      description: 'B.E. Computer Science Engineering',
      image: 'https://coe.panimalar.ac.in/coepec/Student_Photo/211423104322_784879.jpg'
    },
    {
      name: 'G. Kishore Kumar',
      role: 'Student',
      description: 'B.E. Computer Science Engineering',
      image: 'https://coe.panimalar.ac.in/coepec/Student_Photo/211423104312_957283.jpg'
    }
  ];

  const impacts = [
    {
      icon: Recycle,
      title: 'Environmental Impact',
      description: 'Reducing waste accumulation and promoting proper disposal practices across communities'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Empowering citizens to actively participate in maintaining clean neighborhoods'
    },
    {
      icon: Shield,
      title: 'Public Health',
      description: 'Preventing disease outbreaks by ensuring timely waste collection and disposal'
    },
    {
      icon: Globe,
      title: 'Smart Cities',
      description: 'Contributing to sustainable urban development through technology-driven solutions'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20 animate-gradient">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">
              About SmartWaste
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto animate-slide-up animation-delay-200">
              Revolutionizing waste management through AI-powered citizen reporting and smart city solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-3 rounded-lg hover:bg-green-200 hover:scale-110 hover:rotate-6 transition-all duration-300">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 animate-slide-up">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 animate-fade-in-up animation-delay-200">
                To create cleaner, healthier communities by leveraging artificial intelligence and citizen participation 
                to revolutionize waste management systems in urban and rural areas.
              </p>
              <p className="text-gray-600 animate-fade-in-up animation-delay-400">
                We believe that technology can bridge the gap between citizens and municipal authorities, 
                creating a more responsive and efficient waste management ecosystem that benefits everyone.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 animate-fade-in-up animation-delay-300 hover:scale-105 transition-transform duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center group">
                  <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                    <Heart className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors duration-300">Community First</h3>
                  <p className="text-sm text-gray-600 mt-1">Putting citizens at the center of our solution</p>
                </div>
                
                <div className="text-center group">
                  <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                    <Lightbulb className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-yellow-500 transition-colors duration-300">Innovation</h3>
                  <p className="text-sm text-gray-600 mt-1">Using cutting-edge AI for environmental good</p>
                </div>
                
                <div className="text-center group">
                  <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                    <Globe className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-500 transition-colors duration-300">Sustainability</h3>
                  <p className="text-sm text-gray-600 mt-1">Building solutions for a greener future</p>
                </div>
                
                <div className="text-center group">
                  <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-500 transition-colors duration-300">Excellence</h3>
                  <p className="text-sm text-gray-600 mt-1">Delivering high-quality, reliable solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A diverse group of experts passionate about environmental technology and social impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-green-50 rounded-xl shadow-sm border border-green-200 overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up group max-w-sm mx-auto" style={{ animationDelay: `${index * 150}ms` }}>
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-gray-500 text-sm">No Image Available</p>
                    </div>
                  </div>
                )}
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-medium mb-4 group-hover:text-green-700 transition-colors duration-300 text-lg">
                    {member.role}
                  </p>
                  <p className="text-gray-600">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Creating positive change across multiple dimensions of community life
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impacts.map((impact, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="bg-white p-3 rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <impact.icon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {impact.title}
                  </h3>
                  <p className="text-gray-600">
                    {impact.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Technology Stack
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built with modern, scalable technologies for reliability and performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up animation-delay-200 group">
              <div className="bg-white bg-opacity-20 p-6 rounded-xl mb-4 group-hover:bg-opacity-30 group-hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">Frontend</h3>
                <div className="space-y-2 text-blue-100">
                  <p>React.js + TypeScript</p>
                  <p>Tailwind CSS</p>
                  <p>Responsive Design</p>
                  <p>Progressive Web App</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 p-6 rounded-xl mb-4 group-hover:bg-opacity-30 group-hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">Backend</h3>
                <div className="space-y-2 text-blue-100">
                  <p>Node.js + Express</p>
                  <p>MongoDB Database</p>
                  <p>RESTful APIs</p>
                  <p>Cloud Storage</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 p-6 rounded-xl mb-4 group-hover:bg-opacity-30 group-hover:scale-105 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">AI/ML</h3>
                <div className="space-y-2 text-blue-100">
                  <p>TensorFlow/PyTorch</p>
                  <p>CNN Image Classification</p>
                  <p>Python Flask API</p>
                  <p>Real-time Processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-slide-up">
            Join Our Mission
          </h2>
          <p className="text-xl text-green-100 mb-8 animate-slide-up animation-delay-200">
            Be part of the solution. Help us create cleaner, healthier communities for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
            <button
              onClick={() => onNavigate?.('report')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Report Waste Now
            </button>
            <button
              onClick={() => onNavigate?.('contact')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;