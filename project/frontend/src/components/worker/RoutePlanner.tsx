import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Truck,
  Calendar,
  Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getReports } from '../../utils/api';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with Leaflet and webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RoutePlannerProps {
  onNavigate?: (view: string) => void;
}

interface RoutePoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  priority: number;
  estimatedTime: number;
  wasteType: string;
  status: string;
}

// Component to fit map bounds to show all route points
const FitBounds: React.FC<{ routePoints: RoutePoint[] }> = ({ routePoints }) => {
  const map = useMap();
  
  useEffect(() => {
    if (routePoints.length > 0) {
      const bounds = L.latLngBounds(
        routePoints.map(point => [point.lat, point.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Default to Delhi if no route points
      map.setView([28.6139, 77.2090], 10);
    }
  }, [routePoints, map]);

  return null;
};

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onNavigate }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<RoutePoint[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
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
    fetchWorkerTasks();
  }, []);

  const fetchWorkerTasks = async () => {
    try {
      setLoading(true);
      const response = await getReports();
      const reportsData = response.data?.docs || response.data || [];
      const userId = getCurrentUserId();
      
      // Filter reports assigned to current worker
      const workerTasks = reportsData.filter((report: any) => 
        (report.assignedAgentId?.toString() === userId?.toString() || 
         report.assignedAgentName) && 
        (report.status === 'Assigned' || report.status === 'In Progress')
      );

      // Transform MongoDB reports to route points
      const routePoints: RoutePoint[] = workerTasks.map((task: any) => {
        const location = task.location || {};
        const coords = location.coordinates || [];
        return {
          id: task.id || task._id,
          address: location.address || 'Unknown location',
          lat: coords[1] || (typeof location === 'object' && location.lat ? location.lat : 28.6139),
          lng: coords[0] || (typeof location === 'object' && location.lng ? location.lng : 77.2090),
          priority: task.severity || 5,
          estimatedTime: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
          wasteType: task.wasteType || 'Mixed',
          status: task.status || 'Assigned'
        };
      });
      
      setOptimizedRoute(routePoints);
      setTotalDistance(routePoints.length * 2.5); // Approximate distance calculation
      setTotalTime(routePoints.reduce((acc, point) => acc + point.estimatedTime, 0));
    } catch (err) {
      console.error('Error fetching worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoute = async () => {
    setIsOptimizing(true);
    
    // Simulate route optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sort by priority (high severity first) and proximity
    const sorted = [...optimizedRoute].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.estimatedTime - b.estimatedTime; // Shorter time first
    });
    
    setOptimizedRoute(sorted);
    setIsOptimizing(false);
  };

  const startNavigation = () => {
    setIsNavigating(true);
    setCurrentTaskIndex(0);
  };

  const nextTask = () => {
    if (currentTaskIndex < optimizedRoute.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const previousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const resetRoute = () => {
    setIsNavigating(false);
    setCurrentTaskIndex(0);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-100';
    if (priority >= 6) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Assigned': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Function to get marker icon based on route status
  const getMarkerIcon = (index: number, currentIndex: number, isNavigating: boolean, isCompleted: boolean) => {
    if (isNavigating && index === currentIndex) {
      // Current active task - red pulsing
      return new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    } else if (isCompleted) {
      // Completed task - green
      return new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    } else {
      // Pending task - blue
      return new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Route Planner</h1>
          <p className="text-gray-600 mt-1">
            Optimize your daily collection route for maximum efficiency
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate?.('tasks')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Truck className="h-4 w-4" />
            <span>Back to Tasks</span>
          </button>
        </div>
      </div>

      {/* Route Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {optimizedRoute.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Total Stops</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Navigation className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {totalDistance.toFixed(1)} km
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Total Distance</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Estimated Time</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Route Date</p>
        </div>
      </div>

      {/* Route Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={optimizeRoute}
              disabled={isOptimizing}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isOptimizing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Route className="h-5 w-5" />
              )}
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize Route'}</span>
            </button>
            
            {!isNavigating ? (
              <button
                onClick={startNavigation}
                disabled={optimizedRoute.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Navigation</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetRoute}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Pause className="h-5 w-5" />
                  <span>Stop</span>
                </button>
                <button
                  onClick={resetRoute}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
          
          {isNavigating && (
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Current Task: {currentTaskIndex + 1} of {optimizedRoute.length}
              </p>
              <p className="text-xs text-gray-500">
                Progress: {Math.round(((currentTaskIndex + 1) / optimizedRoute.length) * 100)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Route Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaflet Map */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h3>
          <div className="rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {loading ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Loading route...</p>
                </div>
              </div>
            ) : optimizedRoute.length > 0 ? (
              <MapContainer
                center={[28.6139, 77.2090]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds routePoints={optimizedRoute} />
                
                {/* Route polyline connecting all points */}
                {optimizedRoute.length > 1 && (
                  <Polyline
                    positions={optimizedRoute.map(point => [point.lat, point.lng] as [number, number])}
                    color="#3B82F6"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 5"
                  />
                )}
                
                {/* Route markers */}
                {optimizedRoute.map((point, index) => {
                  const isCompleted = index < currentTaskIndex;
                  const isCurrent = index === currentTaskIndex && isNavigating;
                  
                  return (
                    <Marker
                      key={point.id}
                      position={[point.lat, point.lng]}
                      icon={getMarkerIcon(index, currentTaskIndex, isNavigating, isCompleted)}
                      eventHandlers={{
                        click: () => setCurrentTaskIndex(index),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrent
                                ? 'bg-red-600 text-white'
                                : isCompleted
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <h3 className="font-semibold text-gray-900">{point.address}</h3>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Waste Type:</span> {point.wasteType}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Priority:</span> {point.priority}/10
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Status:</span> {point.status}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Est. Time:</span> {point.estimatedTime} min
                            </p>
                            {isCurrent && (
                              <p className="text-red-600 font-medium mt-2">📍 Current Task</p>
                            )}
                            {isCompleted && (
                              <p className="text-green-600 font-medium mt-2">✓ Completed</p>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No route points to display</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Route List */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {optimizedRoute.map((point, index) => (
              <div
                key={point.id}
                className={`p-4 rounded-lg border transition-all ${
                  index === currentTaskIndex && isNavigating
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : index < currentTaskIndex
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === currentTaskIndex && isNavigating
                        ? 'bg-blue-600 text-white'
                        : index < currentTaskIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{point.address}</h4>
                      <p className="text-sm text-gray-600">{point.wasteType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(point.status)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(point.priority)}`}>
                      P{point.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {point.estimatedTime}m
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isNavigating && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousTask}
                  disabled={currentTaskIndex === 0}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <Navigation className="h-4 w-4 rotate-180" />
                  <span>Previous</span>
                </button>
                
                <span className="text-sm text-gray-600">
                  {currentTaskIndex + 1} of {optimizedRoute.length}
                </span>
                
                <button
                  onClick={nextTask}
                  disabled={currentTaskIndex === optimizedRoute.length - 1}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <span>Next</span>
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
