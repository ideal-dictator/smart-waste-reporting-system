import React, { useState, useEffect } from 'react';
import { 
  Filter,
  MapPin,
  Calendar,
  Trash2,
  User,
  Clock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getWorkers, assignReportToAgent, updateReportStatus, getReports, getImageUrl } from '../../utils/api';
import { WasteReport } from '../../types';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet map container positioning
const mapStyle = `
  .leaflet-container {
    position: relative !important;
    z-index: 1 !important;
    height: 100% !important;
    width: 100% !important;
  }
  .leaflet-pane {
    z-index: 400 !important;
  }
  .leaflet-top,
  .leaflet-bottom {
    z-index: 1000 !important;
  }
  .leaflet-control {
    z-index: 1000 !important;
  }
`;

// Fix for default icon issue with Leaflet and webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ReportsMapProps {
  reports: any[];
  onAssignWorker: (reportId: string, workerId: string) => void;
}

// Component to fit map bounds to show all markers
const FitBounds: React.FC<{ reports: WasteReport[] }> = ({ reports }) => {
  const map = useMap();
  
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map(report => [report.location.lat, report.location.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Default to Delhi if no reports
      map.setView([28.6139, 77.2090], 10);
    }
  }, [reports, map]);

  return null;
};

// Function to get marker color based on status
const getMarkerIcon = (status: string) => {
  const color = 
    status === 'Pending' ? 'orange' :
    status === 'Assigned' ? 'blue' :
    status === 'In Progress' ? 'yellow' :
    'green';
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const ReportsMap: React.FC<ReportsMapProps> = ({ reports: reportsProp, onAssignWorker }) => {
  const [reports, setReports] = useState<any[]>(reportsProp || []);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReportForAssignment, setSelectedReportForAssignment] = useState<string | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    wasteType: 'all',
    severity: 'all'
  });

  // Fetch reports if not provided or if prop changes
  useEffect(() => {
    if (reportsProp && reportsProp.length > 0) {
      setReports(reportsProp);
    } else {
      fetchReports();
    }
  }, [reportsProp]);

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports.length]);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const response = await getReports();
      const reportsData = response.data?.docs || response.data || [];
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await getWorkers();
      const workersData = response.data?.docs || response.data || [];
      // Get active jobs count for each worker
      const workersWithJobs = workersData.map((worker: any) => {
        const activeJobs = reports.filter((r: any) => 
          (r.assignedAgentId?.toString() === (worker.id || worker._id)?.toString()) &&
          (r.status === 'Assigned' || r.status === 'In Progress')
        ).length;
        return {
          id: worker.id || worker._id,
          name: worker.name,
          zone: worker.location?.address || 'Not assigned',
          activeJobs
        };
      });
      setAvailableWorkers(workersWithJobs);
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  // Transform MongoDB reports to match expected format
  const transformedReports = reports.map((report: any) => {
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
      status: report.status || 'Pending',
      assignedWorker: report.assignedAgentName || report.assignedAgentId?.name,
      createdAt: report.createdAt ? new Date(report.createdAt) : new Date(),
      updatedAt: report.updatedAt ? new Date(report.updatedAt) : new Date()
    };
  });

  const filteredReports = transformedReports.filter((report: any) => {
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    if (filters.wasteType !== 'all' && report.wasteType !== filters.wasteType) return false;
    if (filters.severity !== 'all') {
      const severityThreshold = parseFloat(filters.severity);
      if (report.severity < severityThreshold) return false;
    }
    return true;
  });

  const handleAssignWorker = async (workerId: string) => {
    if (selectedReportForAssignment) {
      try {
        setLoading(true);
        await assignReportToAgent(selectedReportForAssignment, workerId);
        onAssignWorker(selectedReportForAssignment, workerId);
        setShowAssignModal(false);
        setSelectedReportForAssignment(null);
        // Refresh workers list to update job counts
        await fetchWorkers();
      } catch (err: any) {
        console.error('Error assigning worker:', err);
        alert(err.message || 'Failed to assign worker');
      } finally {
        setLoading(false);
      }
    }
  };

  const AssignWorkerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Assign Worker</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Assigning...</p>
          ) : availableWorkers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No workers available</p>
          ) : (
            availableWorkers.map((worker) => (
              <button
                key={worker.id}
                onClick={() => handleAssignWorker(worker.id)}
                disabled={loading}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors disabled:opacity-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{worker.name}</p>
                    <p className="text-sm text-gray-600">{worker.zone}</p>
                  </div>
                  <span className="text-sm text-gray-500">{worker.activeJobs} active jobs</span>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setShowAssignModal(false)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-orange-600 bg-orange-100';
      case 'Assigned': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWasteTypeColor = (type: string) => {
    switch (type) {
      case 'Medical': return 'text-red-600 bg-red-100';
      case 'E-Waste': return 'text-purple-600 bg-purple-100';
      case 'Plastic': return 'text-blue-600 bg-blue-100';
      case 'Organic': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <style>{mapStyle}</style>
      <div className="max-w-[1920px] mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Map View</h1>
          <p className="text-gray-600 mt-1">
            {loadingReports ? 'Loading reports...' : `${filteredReports.length} reports found`}
          </p>
        </div>
      </div>

      {loadingReports ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading reports from MongoDB...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No reports found. Reports will appear here once submitted.</p>
        </div>
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Type
                </label>
                <select
                  value={filters.wasteType}
                  onChange={(e) => setFilters({ ...filters, wasteType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Organic">Organic</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Medical">Medical</option>
                  <option value="E-Waste">E-Waste</option>
                  <option value="Glass">Glass</option>
                  <option value="Metal">Metal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="8.0">High (8.0+)</option>
                  <option value="6.0">Medium (6.0+)</option>
                  <option value="4.0">Low (4.0+)</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ status: 'all', wasteType: 'all', severity: 'all' })}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Map and Reports */}
        <div className="lg:col-span-3 space-y-6">
          {/* Leaflet Map */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interactive Map</h2>
            <div className="rounded-lg overflow-hidden relative" style={{ height: '500px', position: 'relative', zIndex: 1 }}>
              {filteredReports.length > 0 ? (
                <MapContainer
                  center={[28.6139, 77.2090]}
                  zoom={10}
                  style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds reports={filteredReports} />
                  {filteredReports.map((report: any) => (
                    <Marker
                      key={report.id}
                      position={[report.location.lat, report.location.lng]}
                      icon={getMarkerIcon(report.status)}
                      eventHandlers={{
                        click: () => setSelectedReport(report),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 mb-2">{report.location.address}</h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Waste Type:</span> {report.wasteType}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Severity:</span> {report.severity}/10
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Status:</span> {report.status}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Reported by:</span> {report.citizenName}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No reports to display on map</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredReports.map((report: any) => (
                <div 
                  key={report.id} 
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedReport?.id === report.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={report.imageUrl}
                      alt="Waste report"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">
                            {report.location.address}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {report.description}
                          </p>
                        </div>
                        
                        <div className="text-right ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWasteTypeColor(report.wasteType)}`}>
                          {report.wasteType}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Trash2 className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Severity: {report.severity}/10
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {report.citizenName}
                          </span>
                        </div>
                        {report.assignedWorker && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {report.assignedWorker}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        {report.status === 'Pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReportForAssignment(report.id);
                              setShowAssignModal(true);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Assign Worker
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                            setShowDetailsModal(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
      
      {showAssignModal && <AssignWorkerModal />}
      
      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReport(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image */}
              {selectedReport.imageUrl && (
                <div>
                  <img
                    src={getImageUrl(selectedReport.imageUrl || selectedReport.imagePath)}
                    alt="Waste report"
                    className="w-full h-64 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Report ID</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedReport.reportId || selectedReport.id || selectedReport._id}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Waste Type</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getWasteTypeColor(selectedReport.wasteType)}`}>
                    {selectedReport.wasteType || 'Mixed'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Severity</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedReport.severity >= 8 ? 'bg-red-500' :
                          selectedReport.severity >= 6 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(selectedReport.severity / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedReport.severity || 5}/10
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Citizen Name</h3>
                  <p className="text-lg text-gray-900">{selectedReport.citizenName || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Citizen Phone</h3>
                  <p className="text-lg text-gray-900">{selectedReport.citizenPhone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Created At</h3>
                  <p className="text-lg text-gray-900">
                    {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned Worker</h3>
                  <p className="text-lg text-gray-900">{selectedReport.assignedWorker || selectedReport.assignedAgentName || 'Not Assigned'}</p>
                </div>
              </div>
              
              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <p className="text-lg text-gray-900">
                    {selectedReport.location?.address || 'Unknown location'}
                  </p>
                </div>
                {selectedReport.location?.coordinates && (
                  <p className="text-sm text-gray-600 mt-1 ml-7">
                    Coordinates: {selectedReport.location.coordinates[1]?.toFixed(6)}, {selectedReport.location.coordinates[0]?.toFixed(6)}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">
                  {selectedReport.description || 'No description provided'}
                </p>
              </div>
              
              {/* Confidence Score */}
              {selectedReport.confidence && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">AI Classification Confidence</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(selectedReport.confidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(selectedReport.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {selectedReport.status === 'Pending' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReportForAssignment(selectedReport.id);
                    setShowAssignModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Assign Worker
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ReportsMap;