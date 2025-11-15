import React, { useState } from 'react';
import { 
  MapPin, 
  Camera, 
  Upload, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';
import { classifyWaste } from '../../utils/aiClassification';
import { submitReport } from '../../utils/api';
import { User } from '../../types';

interface WasteReportFormProps {
  onReportSubmit: (report: any) => void;
  user: User;
}

const WasteReportForm: React.FC<WasteReportFormProps> = ({ onReportSubmit, user }) => {
  const [formData, setFormData] = useState({
    citizenName: user?.name || '',
    citizenPhone: user?.phone || '',
    description: '',
    image: null as File | null
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getCurrentLocation,
    locationHistory,
    selectPreviousLocation,
    clearLocation,
    retryCount
  } = useLocation();
  
  const [manualAddress, setManualAddress] = useState('');
  const [useManualAddress, setUseManualAddress] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please provide a waste image');
      return;
    }
    
    if (!location && !useManualAddress) {
      alert('Please provide location information');
      return;
    }
    
    if (useManualAddress && !manualAddress.trim()) {
      alert('Please enter your address');
      return;
    }

    setSubmitting(true);
    setClassifying(true);

    try {
      // Classify waste using AI
      const classification = await classifyWaste(formData.image);
      setClassifying(false);

      // Prepare report data for backend
      const reportData = {
        citizenName: formData.citizenName,
        citizenPhone: formData.citizenPhone,
        description: formData.description,
        wasteType: classification.wasteType,
        severity: classification.severity,
        confidence: classification.confidence,
        location: useManualAddress ? {
          address: manualAddress,
          coordinates: [0, 0], // Manual address coordinates
          accuracy: 0,
          timestamp: new Date().toISOString()
        } : {
          address: location.address,
          coordinates: [location.lng, location.lat], // GeoJSON format: [lng, lat]
          accuracy: location.accuracy,
          timestamp: location.timestamp ? new Date(location.timestamp).toISOString() : new Date().toISOString()
        }
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('image', formData.image);
      Object.keys(reportData).forEach(key => {
        if (key === 'location') {
          formDataToSend.append(key, JSON.stringify(reportData[key]));
        } else {
          formDataToSend.append(key, reportData[key]);
        }
      });

      // Submit to backend
      try {
        const response = await fetch(`${import.meta.env.PROD ? 'https://smart-waste-reporting-system.onrender.com' : 'http://localhost:5000'}/api/reports`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit report');
        }

        const result = await response.json();
        console.log('Report submitted successfully:', result);

        // Create local report for display
        const report = {
          id: result.data.report._id,
          ...formData,
          location: reportData.location,
          imageUrl: imagePreview,
          wasteType: classification.wasteType,
          severity: classification.severity,
          confidence: classification.confidence,
          status: 'Pending' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        onReportSubmit(report);
        setSubmitted(true);
        
        // Reset form
        setTimeout(() => {
          setFormData({
            citizenName: '',
            citizenPhone: '',
            description: '',
            image: null
          });
          setImagePreview(null);
          setSubmitted(false);
          setSubmitting(false);
          setManualAddress('');
          setUseManualAddress(false);
          clearLocation();
        }, 3000);

      } catch (error) {
        console.error('Backend submission error:', error);
        // Fallback to local submission if backend fails
        alert('Backend connection failed. Saving locally.');
        const report = {
          id: Date.now().toString(),
          ...formData,
          location: useManualAddress ? {
            lat: 0,
            lng: 0,
            address: manualAddress,
            accuracy: 0,
            timestamp: Date.now()
          } : location,
          imageUrl: imagePreview,
          wasteType: classification.wasteType,
          severity: classification.severity,
          confidence: classification.confidence,
          status: 'Pending' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        onReportSubmit(report);
        setSubmitted(true);
        
        setTimeout(() => {
          setFormData({
            citizenName: '',
            citizenPhone: '',
            description: '',
            image: null
          });
          setImagePreview(null);
          setSubmitted(false);
          setSubmitting(false);
          setManualAddress('');
          setUseManualAddress(false);
          clearLocation();
        }, 3000);
      }

    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
      setSubmitting(false);
      setClassifying(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-zoom-in">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce-slow" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-slide-up">Report Submitted!</h2>
        <p className="text-gray-600 mb-4">
          Your waste report has been successfully submitted and is being processed.
        </p>
        <p className="text-sm text-gray-500 animate-fade-in animation-delay-500">
          You'll receive updates on the status via SMS.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-up hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 animate-gradient">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Report Waste Issue</h2>
        <p className="text-sm sm:text-base text-green-100">Help keep your community clean • Earn 10 reward points per report!</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* User Welcome */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm sm:text-base text-green-800">
            Welcome back, <strong>{user.name}</strong>! You have <strong>{user.rewardPoints}</strong> reward points.
          </p>
        </div>
        
        {/* Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.citizenName}
              onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.citizenPhone}
              onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          
          <div className="space-y-4">
            {/* Location Method Toggle */}
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useManualAddress}
                  onChange={() => setUseManualAddress(false)}
                  className="mr-2"
                />
                <span className="text-sm">Use GPS Location</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useManualAddress}
                  onChange={() => setUseManualAddress(true)}
                  className="mr-2"
                />
                <span className="text-sm">Enter Address Manually</span>
              </label>
            </div>
            
            {!useManualAddress ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => getCurrentLocation(true)}
                      disabled={locationLoading}
                      className="flex items-center space-x-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 group text-sm"
                    >
                      {locationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4 group-hover:bounce" />
                      )}
                      <span className="hidden sm:inline">
                        {locationLoading 
                          ? `Getting Location${retryCount > 0 ? ` (${retryCount + 1}/3)` : ''}...` 
                          : 'Get High Accuracy Location'
                        }
                      </span>
                      <span className="sm:hidden">
                        {locationLoading ? 'Loading...' : 'GPS High'}
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => getCurrentLocation(false)}
                      disabled={locationLoading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 group text-sm"
                    >
                      <MapPin className="h-4 w-4 group-hover:bounce" />
                      <span className="hidden sm:inline">Quick Location</span>
                      <span className="sm:hidden">Quick</span>
                    </button>
                  
                  {location && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                    >
                      <span>Clear</span>
                    </button>
                  )}
                </div>
                
                {/* Previous Locations */}
                {locationHistory.length > 0 && !location && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Locations:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {locationHistory.map((loc, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectPreviousLocation(loc)}
                          className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                        >
                          <div className="truncate">{loc.address}</div>
                          <div className="text-xs text-gray-500">
                            {loc.accuracy && `±${Math.round(loc.accuracy)}m accuracy`}
                            {loc.timestamp && ` • ${new Date(loc.timestamp).toLocaleTimeString()}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your complete address (e.g., 123 Main Street, City, State, PIN)"
                  required={useManualAddress}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide a detailed address including landmarks for accurate pickup
                </p>
              </div>
            )}
          </div>
          
          {location && (
            <div className="mt-3 p-4 bg-green-50 rounded-lg animate-slide-down border-l-4 border-green-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    📍 Location Confirmed
                  </p>
                  <p className="text-sm text-green-700 mb-2">
                    {location.address}
                  </p>
                  <div className="text-xs text-green-600 space-y-1">
                    <p>Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                    {location.accuracy && (
                      <p>Accuracy: ±{Math.round(location.accuracy)} meters</p>
                    )}
                    {location.timestamp && (
                      <p>Captured: {new Date(location.timestamp).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              </div>
            </div>
          )}
          
          {locationError && (
            <div className="mt-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Location Error</p>
                  <p className="text-sm text-red-700 mt-1">{locationError}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => getCurrentLocation(false)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseManualAddress(true)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                    >
                      Enter Manually
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Waste Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
            {imagePreview ? (
              <div className="space-y-4 animate-fade-in">
                <img
                  src={imagePreview}
                  alt="Waste preview"
                  className="max-w-full h-48 mx-auto rounded-lg object-cover hover:scale-105 transition-transform duration-300 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: null });
                  }}
                  className="text-sm text-red-600 hover:text-red-700 hover:scale-105 transition-all duration-300"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div>
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-bounce-slow" />
                <p className="text-gray-600 mb-2">Click to upload waste image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              required
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:scale-105 cursor-pointer mt-4 transition-all duration-300 group"
            >
              <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform duration-300" />
              <span>Choose File</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe the waste issue in detail..."
          />
        </div>

        {/* AI Classification Status */}
        {classifying && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse border-l-4 border-l-blue-400">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  AI Classification in Progress
                </p>
                <p className="text-xs text-blue-700">
                  Analyzing waste type and severity...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || (!location && !useManualAddress) || !formData.image}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 transition-all duration-300 group text-sm sm:text-base"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform duration-300" />
          )}
          <span>
            {classifying ? 'Classifying...' : submitting ? 'Submitting...' : 'Submit Report'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default WasteReportForm;