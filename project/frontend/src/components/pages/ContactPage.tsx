import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to contact form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Have questions or need support? We're here to help you make your community cleaner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 hover:shadow-lg transition-shadow duration-300 animate-slide-up animation-delay-300">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group hover:scale-105 transition-transform duration-300">
                  <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91-1800-WASTE-1</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">support@smartwaste.gov.in</p>
                    <p className="text-sm text-gray-500">24/7 Support</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      Smart City Initiative<br />
                      Municipal Corporation Building<br />
                      New Delhi, India 110001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-300">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Office Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 hover:bg-red-100 hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-500">
              <h3 className="font-semibold text-red-900 mb-2">Emergency Waste Issues</h3>
              <p className="text-sm text-red-700 mb-3">
                For urgent waste-related health hazards or environmental emergencies:
              </p>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-900">Emergency: 1800-URGENT</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow duration-300 animate-slide-up animation-delay-400">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="report">Report Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="media">Media Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Please provide detailed information about your inquiry..."
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Before you submit:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check our FAQ section for common questions</li>
                    <li>• For urgent issues, use our emergency contact</li>
                    <li>• Include your report ID if asking about a specific report</li>
                    <li>• We typically respond within 24 hours</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 transition-all duration-300 group"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  )}
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">How do I report a waste issue?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use our report form to upload a photo and location. Our AI will classify the waste type automatically.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">How long does it take to resolve reports?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Most reports are resolved within 48 hours. High-priority issues like medical waste are handled immediately.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Can I track my report status?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Yes! Use our status page with your report ID or phone number to track progress in real-time.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Is my personal information secure?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Absolutely. We use enterprise-grade security and only collect necessary information for waste management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;