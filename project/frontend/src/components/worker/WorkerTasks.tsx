import React, { useState, useEffect } from 'react';
import { 
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Camera,
  Trash2,
  User
} from 'lucide-react';
import { getReports, updateReportStatus } from '../../utils/api';

interface WorkerTasksProps {
  onNavigate?: (view: string) => void;
}

const WorkerTasks: React.FC<WorkerTasksProps> = ({ onNavigate }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [workerTasks, setWorkerTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

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
    fetchWorkerTasks();
  }, []);

  const fetchWorkerTasks = async () => {
    try {
      setLoading(true);
      const response = await getReports();
      const reportsData = response.data?.docs || response.data || [];
      const userId = getCurrentUserId();
      
      // Filter reports assigned to current worker
      const tasks = reportsData.filter((report: any) => 
        (report.assignedAgentId?.toString() === userId?.toString() || 
         report.assignedAgentName) && 
        (report.status === 'Assigned' || report.status === 'In Progress' || report.status === 'Resolved')
      );

      // Transform MongoDB reports to expected format
      const transformedTasks = tasks.map((task: any) => {
        const location = task.location || {};
        const coords = location.coordinates || [];
        return {
          id: task.id || task._id,
          citizenName: task.citizenName || task.citizenId?.name || 'Unknown',
          citizenPhone: task.citizenPhone || task.citizenId?.phone || '',
          location: {
            lat: coords[1] || (typeof location === 'object' && location.lat ? location.lat : 28.6139),
            lng: coords[0] || (typeof location === 'object' && location.lng ? location.lng : 77.2090),
            address: location.address || 'Unknown location'
          },
          imageUrl: task.imageUrl || task.imagePath || '',
          description: task.description || '',
          wasteType: task.wasteType || 'Mixed',
          severity: task.severity || 5,
          confidence: task.confidence || 0.5,
          status: task.status || 'Assigned',
          assignedWorker: task.assignedAgentName,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
        };
      });

      setWorkerTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: 'In Progress' | 'Resolved') => {
    try {
      setBusy(taskId + newStatus);
      if (newStatus === 'In Progress') {
        await updateReportStatus(taskId, { status: 'In Progress' });
      } else {
        await updateReportStatus(taskId, { status: 'Resolved', completionNotes: 'Completed by worker' });
      }
      // Refresh tasks after update
      await fetchWorkerTasks();
      // Simple success feedback
      alert(`Task ${taskId} marked as ${newStatus}`);
    } catch (e: any) {
      alert(e.message || 'Failed to update task');
    } finally {
      setBusy(null);
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
    <div className="max-w-[1920px] mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {workerTasks.length} tasks assigned to you
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate?.('map')}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 hover:scale-105 transition-transform text-sm"
          >
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">Route Planner</span>
            <span className="sm:hidden">Route</span>
          </button>
          <button
            onClick={() => onNavigate?.('profile')}
            className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2 hover:scale-105 transition-transform text-sm"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-blue-600">
              {workerTasks.filter(t => t.status === 'Assigned').length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">New Tasks</p>
        </div>
        
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600" />
            <span className="text-xl sm:text-2xl font-bold text-yellow-600">
              {workerTasks.filter(t => t.status === 'In Progress').length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">In Progress</p>
        </div>
        
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
            <span className="text-xl sm:text-2xl font-bold text-green-600">
              {workerTasks.filter(t => t.status === 'Resolved').length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Completed</p>
        </div>
        
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Trash2 className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
            <span className="text-xl sm:text-2xl font-bold text-purple-600">
              {workerTasks.reduce((acc, task) => acc + task.severity, 0).toFixed(1)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Avg Priority</p>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      ) : workerTasks.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
          <p className="text-gray-600">Check back later for new waste collection tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workerTasks.map((task) => (
          <div 
            key={task.id} 
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
              selectedTask === task.id ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={task.imageUrl}
                  alt="Waste location"
                  className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                  onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.location.address}
                      </h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.severity)}`}>
                          Priority: {task.severity >= 8 ? 'High' : task.severity >= 6 ? 'Medium' : 'Low'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {task.wasteType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-500">
                        Reported: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: #{task.id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {task.status === 'Assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'In Progress')}
                        disabled={busy === task.id + 'In Progress'}
                        className="bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{busy === task.id + 'In Progress' ? 'Starting...' : 'Start Task'}</span>
                      </button>
                    )}
                    
                    {task.status === 'In Progress' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'Resolved')}
                        disabled={busy === task.id + 'Resolved'}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>{busy === task.id + 'Resolved' ? 'Completing...' : 'Mark Complete'}</span>
                      </button>
                    )}
                    
                    <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <Navigation className="h-4 w-4" />
                      <span>Get Directions</span>
                    </button>
                    
                    <button className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Add Photo</span>
                    </button>

                    <button
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      className="bg-white border px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      {selectedTask === task.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedTask === task.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Reporter:</strong> {task.citizenName}</p>
                      <p><strong>Phone:</strong> {task.citizenPhone}</p>
                      <p><strong>Location:</strong> {task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Task Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Waste Type:</strong> {task.wasteType}</p>
                      <p><strong>AI Confidence:</strong> {Math.round(task.confidence * 100)}%</p>
                      <p><strong>Severity Score:</strong> {task.severity}/10</p>
                      <p><strong>Last Updated:</strong> {new Date(task.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Add notes about this task..."
                  />
                  <button className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerTasks;