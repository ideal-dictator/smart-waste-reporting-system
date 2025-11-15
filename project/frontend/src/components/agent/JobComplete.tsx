import React, { useState } from 'react';
import { 
  CheckCircle,
  Camera,
  Upload,
  MapPin,
  Clock,
  FileText
} from 'lucide-react';

const JobComplete: React.FC = () => {
  const [completionData, setCompletionData] = useState({
    jobId: '',
    notes: '',
    beforePhoto: null as File | null,
    afterPhoto: null as File | null,
    wasteQuantity: '',
    completionTime: new Date().toISOString().slice(0, 16)
  });
  
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'before') {
          setBeforePreview(result);
          setCompletionData({ ...completionData, beforePhoto: file });
        } else {
          setAfterPreview(result);
          setCompletionData({ ...completionData, afterPhoto: file });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setCompletionData({
        jobId: '',
        notes: '',
        beforePhoto: null,
        afterPhoto: null,
        wasteQuantity: '',
        completionTime: new Date().toISOString().slice(0, 16)
      });
      setBeforePreview(null);
      setAfterPreview(null);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Completed!</h2>
          <p className="text-gray-600 mb-4">
            Your completion report has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            Returning to jobs list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Pickup Job
          </h1>
          <p className="text-gray-600">
            Submit completion details and photos for verification
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job ID *
              </label>
              <input
                type="text"
                required
                value={completionData.jobId}
                onChange={(e) => setCompletionData({ ...completionData, jobId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter job ID (e.g., 1, 2, 3)"
              />
            </div>

            {/* Before/After Photos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Before Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  {beforePreview ? (
                    <div className="space-y-3">
                      <img
                        src={beforePreview}
                        alt="Before cleanup"
                        className="max-w-full h-32 mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBeforePreview(null);
                          setCompletionData({ ...completionData, beforePhoto: null });
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Before cleanup photo</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'before')}
                    className="hidden"
                    id="before-photo"
                    required
                  />
                  <label
                    htmlFor="before-photo"
                    className="inline-flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer mt-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose Photo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  After Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  {afterPreview ? (
                    <div className="space-y-3">
                      <img
                        src={afterPreview}
                        alt="After cleanup"
                        className="max-w-full h-32 mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAfterPreview(null);
                          setCompletionData({ ...completionData, afterPhoto: null });
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">After cleanup photo</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'after')}
                    className="hidden"
                    id="after-photo"
                    required
                  />
                  <label
                    htmlFor="after-photo"
                    className="inline-flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer mt-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose Photo</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Waste Quantity
                </label>
                <select
                  value={completionData.wasteQuantity}
                  onChange={(e) => setCompletionData({ ...completionData, wasteQuantity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select quantity</option>
                  <option value="small">Small (1-2 bags)</option>
                  <option value="medium">Medium (3-5 bags)</option>
                  <option value="large">Large (6-10 bags)</option>
                  <option value="very-large">Very Large (10+ bags)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Time
                </label>
                <input
                  type="datetime-local"
                  value={completionData.completionTime}
                  onChange={(e) => setCompletionData({ ...completionData, completionTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Completion Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes *
              </label>
              <textarea
                required
                value={completionData.notes}
                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe the work completed, any challenges faced, or additional observations..."
              />
            </div>

            {/* Checklist */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Completion Checklist</span>
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span>All waste has been collected and properly disposed</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span>Area has been cleaned and sanitized if necessary</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span>Before and after photos have been taken</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span>Any safety protocols have been followed</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit Completion Report'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobComplete;