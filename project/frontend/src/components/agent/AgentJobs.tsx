import React, { useState, useEffect } from 'react';
import { 
  MapPin,
  Navigation,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  MessageSquare
} from 'lucide-react';
import { getReports, updateReportStatus, getImageUrl } from '../../utils/api';

const AgentJobs: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [agentJobs, setAgentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user._id;
    }
    return null;
  };

  useEffect(() => {
    fetchAgentJobs();
  }, []);

  const fetchAgentJobs = async () => {
    try {
      setLoading(true);
      const response = await getReports();
      const reportsData = response.data?.docs || response.data || [];
      const userId = getCurrentUserId();
      
      // Filter jobs assigned to current agent
      const jobs = reportsData.filter((report: any) => 
        (report.assignedAgentId?.toString() === userId?.toString() || 
         report.assignedAgentName) && 
        (report.status === 'Assigned' || report.status === 'In Progress')
      );

      // Transform MongoDB reports to expected format
      const transformedJobs = jobs.map((report: any) => {
        const location = report.location || {};
        const coords = location.coordinates || [];
        return {
          id: report.id || report._id,
          citizenName: report.citizenName || report.citizenId?.name || 'Unknown',
          citizenPhone: report.citizenPhone || report.citizenId?.phone || '',
          location: {
            lat: coords[1] || (typeof location === 'object' && location.lat ? location.lat : 28.6139),
            lng: coords[0] || (typeof location === 'object' && location.lng ? location.lng : 77.2090),
            address: location.address || 'Unknown location'
          },
          imageUrl: getImageUrl(report.imageUrl || report.imagePath),
          description: report.description || '',
          wasteType: report.wasteType || 'Mixed',
          severity: report.severity || 5,
          confidence: report.confidence || 0.5,
          status: report.status || 'Assigned',
          assignedWorker: report.assignedAgentName,
          createdAt: report.createdAt ? new Date(report.createdAt) : new Date(),
          updatedAt: report.updatedAt ? new Date(report.updatedAt) : new Date()
        };
      });

      setAgentJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching agent jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId: string, newStatus: 'In Progress' | 'Resolved') => {
    try {
      if (newStatus === 'In Progress') {
        await updateReportStatus(jobId, { status: 'In Progress' });
      } else {
        await updateReportStatus(jobId, { status: 'Resolved', completionNotes });
      }
      await fetchAgentJobs();
      setCompletionNotes('');
      setSelectedJob(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleCompleteJob = (jobId: string) => {
    if (completionNotes.trim()) {
      handleStatusUpdate(jobId, 'Resolved');
    } else {
      alert('Please add completion notes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-600 bg-red-100';
    if (severity >= 6) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Pickup Jobs</h1>
            <p className="text-gray-600 mt-1">
              {agentJobs.length} jobs assigned to you
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Navigation className="h-4 w-4" />
              <span>Optimize Route</span>
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>View Map</span>
            </button>
          </div>
        </div>

        {/* Job Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {agentJobs.filter(j => j.status === 'Assigned').length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">New Jobs</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {agentJobs.filter(j => j.status === 'In Progress').length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {agentJobs.filter(j => j.status === 'Resolved').length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">
                {agentJobs.filter(j => j.severity >= 8).length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">High Priority</p>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : agentJobs.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs assigned</h3>
            <p className="text-gray-600">Check back later for new pickup jobs.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {agentJobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-4">
                    <img
                      src={job.imageUrl}
                      alt="Waste location"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Job #{job.id}
                      </h3>
                      <p className="text-gray-600 mb-2">{job.location.address}</p>
                      <p className="text-sm text-gray-500">{job.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(job.severity)}`}>
                          {job.severity >= 8 ? 'High Priority' : job.severity >= 6 ? 'Medium' : 'Low Priority'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {job.wasteType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">
                      Reported: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Severity: {job.severity}/10
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    {job.status === 'Assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'In Progress')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Start Job</span>
                      </button>
                    )}
                    
                    {job.status === 'In Progress' && (
                      <button
                        onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete Job</span>
                      </button>
                    )}
                    
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <Navigation className="h-4 w-4" />
                      <span>Get Directions</span>
                    </button>
                    
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Add Photo</span>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Contact: {job.citizenPhone}</p>
                  </div>
                </div>
              </div>

              {/* Completion Form */}
              {selectedJob === job.id && job.status === 'In Progress' && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-4">Complete Job</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion Notes
                      </label>
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Describe the work completed, any issues encountered, or additional notes..."
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCompleteJob(job.id)}
                        disabled={!completionNotes.trim()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark as Complete</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentJobs;