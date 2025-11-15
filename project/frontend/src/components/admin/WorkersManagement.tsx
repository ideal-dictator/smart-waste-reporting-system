import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  Clock,
  MoreHorizontal,
  X
} from 'lucide-react';
import { getWorkers, createWorker, getReports, createTask } from '../../utils/api';
import { INDIAN_ZONES } from '../../utils/indianZones';
import { Worker } from '../../types';

const WorkersManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWorkerDetails, setShowWorkerDetails] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedWorkerForTask, setSelectedWorkerForTask] = useState<Worker | null>(null);
  const [availableReports, setAvailableReports] = useState<any[]>([]);
  const [selectedReportForTask, setSelectedReportForTask] = useState<string | null>(null);
  const [assigningTask, setAssigningTask] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    zone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkers();
    fetchReports();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await getWorkers();
      const workersData = response.data?.docs || response.data || [];
      setWorkers(workersData.map((w: any) => ({
        id: w.id || w._id,
        name: w.name,
        email: w.email,
        phone: w.phone,
        zone: w.location?.address || 'Not assigned',
        activeJobs: 0 // Will be calculated from reports
      })));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching workers:', err);
      setError(err.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await getReports();
      const reportsData = response.data?.docs || response.data || [];
      setReports(reportsData);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkerStats = (workerId: string, workerName: string) => {
    const assignedTasks = reports.filter(r => 
      (r.assignedAgentId?.toString() === workerId || r.assignedAgentName === workerName) &&
      (r.status === 'Assigned' || r.status === 'In Progress' || r.status === 'Resolved')
    );
    const completedTasks = assignedTasks.filter(r => r.status === 'Resolved');
    const pendingTasks = assignedTasks.filter(r => r.status === 'In Progress' || r.status === 'Assigned');
    
    return {
      total: assignedTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      completionRate: assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0
    };
  };

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      await createWorker({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        location: {
          address: formData.zone
        }
      });

      // Refresh workers list
      await fetchWorkers();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        zone: ''
      });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create worker');
    } finally {
      setSubmitting(false);
    }
  }, [formData, setFormData, setShowAddForm, setSubmitting, setError, fetchWorkers]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const AddWorkerForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            setShowAddForm(false);
            setError(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              zone: ''
            });
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Worker</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter worker name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="worker@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Zone *
            </label>
            <select
              required
              value={formData.zone}
              onChange={(e) => handleInputChange('zone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a zone</option>
              {INDIAN_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter initial password (min 6 characters)"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              disabled={submitting}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1920px] mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workers Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your waste collection team
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Worker</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{workers.length}</p>
            <p className="text-sm text-gray-600">Total Workers</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.status === 'Assigned' || r.status === 'In Progress').length}
            </p>
            <p className="text-sm text-gray-600">Active Jobs</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {workers.length > 0 
                ? Math.round(reports.filter(r => r.status === 'Assigned' || r.status === 'In Progress').length / workers.length)
                : 0}
            </p>
            <p className="text-sm text-gray-600">Avg Jobs/Worker</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading workers...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No workers found</p>
        </div>
      ) : (
        /* Workers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => {
            const stats = getWorkerStats(worker.id, worker.name);
          
          return (
            <div key={worker.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <p className="text-sm text-gray-600">{worker.zone}</p>
                    </div>
                  </div>
                  
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{worker.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{worker.zone}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-gray-900">{stats.completed}</span>
                      </div>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-gray-900">{stats.pending}</span>
                      </div>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-gray-600">
                    {stats.completionRate}% completion rate
                  </p>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={() => {
                      setSelectedWorkerForTask(worker);
                      setShowAssignTaskModal(true);
                      // Filter available reports (pending or unassigned)
                      const available = reports.filter((r: any) => 
                        r.status === 'Pending' || (!r.assignedAgentId && !r.assignedAgentName)
                      );
                      setAvailableReports(available);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Assign Task
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedWorker(worker);
                      setShowWorkerDetails(true);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {showAddForm && <AddWorkerForm />}
      
      {/* Worker Details Modal */}
      {showWorkerDetails && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Worker Details</h2>
              <button
                onClick={() => {
                  setShowWorkerDetails(false);
                  setSelectedWorker(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Worker Information */}
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <User className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedWorker.name}</h3>
                  <p className="text-gray-600">{selectedWorker.zone}</p>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-lg text-gray-900">{selectedWorker.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-lg text-gray-900">{selectedWorker.phone}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Zone</h3>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-lg text-gray-900">{selectedWorker.zone}</p>
                  </div>
                </div>
              </div>
              
              {/* Statistics */}
              {(() => {
                const stats = getWorkerStats(selectedWorker.id, selectedWorker.name);
                return (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-2xl font-bold text-gray-900">{stats.completed}</span>
                        </div>
                        <p className="text-sm text-gray-600">Completed Tasks</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
                        </div>
                        <p className="text-sm text-gray-600">Pending Tasks</p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                        <span className="text-sm font-medium text-gray-900">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${stats.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Assigned Reports */}
              {(() => {
                const workerReports = reports.filter((r: any) => 
                  r.assignedAgentId === selectedWorker.id || 
                  r.assignedAgentName === selectedWorker.name
                );
                
                if (workerReports.length === 0) return null;
                
                return (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Reports ({workerReports.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {workerReports.map((report: any) => (
                        <div key={report.id || report._id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {report.location?.address || 'Unknown location'}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {report.wasteType} • Severity: {report.severity}/10
                              </p>
                            </div>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                              report.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWorkerDetails(false);
                  setSelectedWorker(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowWorkerDetails(false);
                  setSelectedWorkerForTask(selectedWorker);
                  setShowAssignTaskModal(true);
                  // Filter available reports (pending or unassigned)
                  const available = reports.filter((r: any) => 
                    r.status === 'Pending' || (!r.assignedAgentId && !r.assignedAgentName)
                  );
                  setAvailableReports(available);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignTaskModal && selectedWorkerForTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Assign Task to {selectedWorkerForTask.name}
              </h2>
              <button
                onClick={() => {
                  setShowAssignTaskModal(false);
                  setSelectedWorkerForTask(null);
                  setSelectedReportForTask(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {availableReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No available reports to assign</p>
                  <p className="text-sm text-gray-500 mt-2">All reports are already assigned or resolved</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Report to Assign
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableReports.map((report: any) => (
                        <button
                          key={report.id || report._id}
                          onClick={() => setSelectedReportForTask(report.id || report._id)}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                            selectedReportForTask === (report.id || report._id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {report.location?.address || 'Unknown location'}
                              </p>
                              <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                                <span>{report.wasteType}</span>
                                <span>•</span>
                                <span>Severity: {report.severity}/10</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  report.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                              {report.description && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAssignTaskModal(false);
                        setSelectedWorkerForTask(null);
                        setSelectedReportForTask(null);
                        setError(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedReportForTask) {
                          setError('Please select a report to assign');
                          return;
                        }
                        try {
                          setAssigningTask(true);
                          setError(null);
                          
                          await createTask({
                            reportId: selectedReportForTask,
                            assignedAgentId: selectedWorkerForTask.id,
                            title: `Waste Collection - ${availableReports.find(r => (r.id || r._id) === selectedReportForTask)?.wasteType || 'Mixed'}`,
                            description: availableReports.find(r => (r.id || r._id) === selectedReportForTask)?.description || '',
                            priority: 'Medium',
                            estimatedDuration: 60,
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
                          });

                          // Refresh data
                          await fetchWorkers();
                          await fetchReports();
                          
                          setShowAssignTaskModal(false);
                          setSelectedWorkerForTask(null);
                          setSelectedReportForTask(null);
                        } catch (err: any) {
                          setError(err.message || 'Failed to assign task');
                        } finally {
                          setAssigningTask(false);
                        }
                      }}
                      disabled={!selectedReportForTask || assigningTask}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assigningTask ? 'Assigning...' : 'Assign Task'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersManagement;