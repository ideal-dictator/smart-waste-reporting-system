import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search,
  HelpCircle,
  MapPin,
  Camera,
  Clock,
  Shield
} from 'lucide-react';

interface FAQPageProps {
  onNavigate?: (view: string) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: HelpCircle,
      color: 'bg-blue-100 text-blue-600',
      faqs: [
        {
          question: 'How do I report a waste issue?',
          answer: 'Simply go to our Report page, take a photo of the waste, allow location access, fill in your details and description, then submit. Our AI will automatically classify the waste type and severity.'
        },
        {
          question: 'Do I need to create an account?',
          answer: 'No account is required for basic reporting. However, creating an account allows you to track your reports, view history, and receive updates more easily.'
        },
        {
          question: 'What types of waste can I report?',
          answer: 'You can report all types of waste including organic waste, plastic, medical waste, e-waste, glass, metal, and mixed waste. Our AI system can identify and classify most waste types automatically.'
        },
        {
          question: 'Is the service free to use?',
          answer: 'Yes, SmartWaste is completely free for all citizens. This is a public service initiative funded by municipal authorities and government programs.'
        }
      ]
    },
    {
      title: 'Reporting Process',
      icon: Camera,
      color: 'bg-green-100 text-green-600',
      faqs: [
        {
          question: 'Why do I need to provide my location?',
          answer: 'Location is essential for our cleanup teams to find and address the waste issue. We use GPS coordinates to ensure accurate location mapping and efficient route planning for pickup teams.'
        },
        {
          question: 'What if my location is not detected accurately?',
          answer: 'If GPS is not working, you can manually enter the address or landmark details. Make sure to provide clear directions in the description field to help our teams locate the issue.'
        },
        {
          question: 'Can I report waste in rural or remote areas?',
          answer: 'Yes, our system covers both urban and rural areas. However, response times may vary depending on the availability of cleanup teams in remote locations.'
        },
        {
          question: 'What information should I include in the description?',
          answer: 'Provide details about the waste type, approximate quantity, any safety concerns, and specific location markers (near shops, landmarks, etc.) to help our teams locate and address the issue effectively.'
        }
      ]
    },
    {
      title: 'Tracking & Status',
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
      faqs: [
        {
          question: 'How can I track my report status?',
          answer: 'Use our Status page with either your report ID or the phone number you provided. You can see real-time updates as your report moves from Pending → Assigned → In Progress → Resolved.'
        },
        {
          question: 'How long does it take to resolve a report?',
          answer: 'Most reports are resolved within 48 hours. High-priority issues (medical waste, hazardous materials) are typically addressed within 4-6 hours. Rural areas may take slightly longer.'
        },
        {
          question: 'Will I be notified when my report is resolved?',
          answer: 'Yes, if you provided a phone number, you\'ll receive SMS updates at key stages: when your report is assigned to a team, when cleanup begins, and when it\'s completed.'
        },
        {
          question: 'What if my report is not resolved in time?',
          answer: 'If your report exceeds the expected resolution time, you can contact our support team or escalate through the contact form. We take delayed responses seriously and will investigate immediately.'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
      faqs: [
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use enterprise-grade security measures. Your personal information is encrypted and only used for waste management purposes. We never share your data with third parties without consent.'
        },
        {
          question: 'What data do you collect?',
          answer: 'We collect only essential information: your name, phone number, location coordinates, waste photos, and description. This data is used solely for processing and resolving your waste reports.'
        },
        {
          question: 'Can I delete my data?',
          answer: 'Yes, you can request data deletion by contacting our support team. However, resolved reports may be retained in anonymized form for analytics and system improvement purposes.'
        },
        {
          question: 'Do you use my photos for other purposes?',
          answer: 'Photos are used only for waste classification and resolution. They may be used in anonymized form to improve our AI models, but never for commercial purposes or with identifying information.'
        }
      ]
    },
    {
      title: 'Technical Issues',
      icon: MapPin,
      color: 'bg-red-100 text-red-600',
      faqs: [
        {
          question: 'The app is not working properly. What should I do?',
          answer: 'Try refreshing the page or clearing your browser cache. If issues persist, contact our technical support team with details about your device, browser, and the specific problem you\'re experiencing.'
        },
        {
          question: 'My photo upload is failing. How can I fix this?',
          answer: 'Ensure your image is under 10MB and in JPG, PNG, or WebP format. Check your internet connection and try again. If problems continue, try using a different browser or device.'
        },
        {
          question: 'Location services are not working. What can I do?',
          answer: 'Make sure you\'ve allowed location access in your browser settings. If GPS is unavailable, you can manually enter the address or use nearby landmarks in the description.'
        },
        {
          question: 'Can I use this on my mobile phone?',
          answer: 'Yes, SmartWaste is fully responsive and works on all devices including smartphones, tablets, and desktop computers. The mobile experience is optimized for easy reporting on the go.'
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const [showContact, setShowContact] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Find answers to common questions about using SmartWaste reporting system
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-slide-up animation-delay-300">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-pulse-slow" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-md transition-shadow duration-300"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: `${categoryIndex * 150}ms` }}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color} hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                    {category.faqs.length} questions
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={faqIndex}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 hover:scale-[1.02] transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 pr-4 group-hover:text-green-600 transition-colors duration-300">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 group-hover:text-green-500 transition-colors duration-300" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 group-hover:text-green-500 transition-colors duration-300" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4 animate-slide-down">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              No FAQs match your search for "{searchTerm}". Try different keywords or browse all categories.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center animate-gradient hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 animate-slide-up">Still have questions?</h2>
          <p className="text-green-100 mb-6 animate-slide-up animation-delay-200">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
            <button
              onClick={() => setShowContact(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Contact Support
            </button>
            <button
              onClick={() => setShowIssue(true)}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Report an Issue
            </button>
          </div>
        </div>

        {/* Contact Modal */}
        {showContact && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setShowContact(false)}>
            <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h3>
              <form className="space-y-3" onSubmit={(e)=>{e.preventDefault(); alert('Support request sent!'); setShowContact(false);}}>
                <input className="w-full border rounded-lg px-4 py-2" placeholder="Your email" required />
                <textarea className="w-full border rounded-lg px-4 py-2" rows={4} placeholder="Describe your issue" required />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={()=>setShowContact(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white">Send</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Issue Modal */}
        {showIssue && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setShowIssue(false)}>
            <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Report an Issue</h3>
              <form className="space-y-3" onSubmit={(e)=>{e.preventDefault(); alert('Issue reported!'); setShowIssue(false);}}>
                <input className="w-full border rounded-lg px-4 py-2" placeholder="Subject" required />
                <textarea className="w-full border rounded-lg px-4 py-2" rows={4} placeholder="Provide details" required />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={()=>setShowIssue(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white">Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;