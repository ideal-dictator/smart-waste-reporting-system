import React, { useState, useEffect } from 'react';
import { updateProfile, getCurrentUser } from '../../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  BarChart3, 
  Settings, 
  Edit3, 
  Save, 
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Shield,
  Truck,
  FileText,
  Target
} from 'lucide-react';

interface ProfileProps {
  user: any;
  onNavigate?: (view: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Amit Kumar',
    email: user?.email || 'amit.kumar@wastecollection.com',
    phone: user?.phone || '+91-9876543210',
    address: '123 Green Street, Eco City, EC 12345',
    employeeId: 'WC001',
    department: 'Waste Collection',
    joinDate: '2023-01-15',
    supervisor: 'Rajesh Sharma',
    vehicleNumber: 'WB-01-AB-1234'
  });

  const [editData, setEditData] = useState(profileData);

  // Mock data for worker stats
  const workerStats = {
    totalReports: 156,
    completedTasks: 142,
    pendingTasks: 14,
    averageRating: 4.7,
    totalDistance: 2847.5,
    totalHours: 1240,
    efficiency: 91.2,
    streakDays: 12,
    monthlyTarget: 25,
    monthlyCompleted: 23
  };

  const recentActivities = [
    { id: 1, action: 'Completed waste collection', location: 'Park Street', time: '2 hours ago', status: 'completed' },
    { id: 2, action: 'Started new task', location: 'Market Area', time: '4 hours ago', status: 'in-progress' },
    { id: 3, action: 'Reported issue', location: 'Residential Block A', time: '1 day ago', status: 'pending' },
    { id: 4, action: 'Completed waste collection', location: 'School Zone', time: '2 days ago', status: 'completed' },
    { id: 5, action: 'Route optimization', location: 'Multiple locations', time: '3 days ago', status: 'completed' }
  ];

  const achievements = [
    { id: 1, title: 'Efficiency Master', description: 'Maintained 90%+ efficiency for 3 months', icon: TrendingUp, earned: true },
    { id: 2, title: 'Perfect Attendance', description: 'No missed days for 6 months', icon: Calendar, earned: true },
    { id: 3, title: 'Customer Favorite', description: 'Highest customer rating', icon: Star, earned: true },
    { id: 4, title: 'Distance Champion', description: 'Covered 5000+ km in a month', icon: MapPin, earned: false },
    { id: 5, title: 'Safety First', description: 'Zero accidents for 1 year', icon: Shield, earned: false }
  ];

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || 'Unknown',
        email: user.email || '',
        phone: user.phone || '',
        address: user.location?.address || ''
      };
      setProfileData({ ...profileData, ...userData });
      setEditData({ ...profileData, ...userData });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // Update profile in MongoDB
      await updateProfile({
        name: editData.name,
        phone: editData.phone,
        location: {
          address: editData.address
        }
      });

      // Update local state
      setProfileData(editData);
      setIsEditing(false);

      // Refresh user data
      const response = await getCurrentUser();
      if (response.data?.user) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activities', label: 'Activities', icon: Clock },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Worker Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile and track your performance</p>
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

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <span className="text-2xl font-bold text-green-600">AK</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">{profileData.name}</h2>
            <p className="text-gray-600">{profileData.department}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Employee ID: {profileData.employeeId}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Rating: {workerStats.averageRating}/5
              </span>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FileText className="h-6 w-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{workerStats.totalReports}</span>
                  </div>
                  <p className="text-sm text-green-700 font-medium">Total Reports</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{workerStats.completedTasks}</span>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Completed Tasks</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MapPin className="h-6 w-6 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">{workerStats.totalDistance.toFixed(1)} km</span>
                  </div>
                  <p className="text-sm text-purple-700 font-medium">Total Distance</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">{workerStats.efficiency}%</span>
                  </div>
                  <p className="text-sm text-orange-700 font-medium">Efficiency</p>
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="h-64 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Performance chart would be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Monthly Progress */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
                    <span className="text-sm text-gray-600">{workerStats.monthlyCompleted}/{workerStats.monthlyTarget}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(workerStats.monthlyCompleted / workerStats.monthlyTarget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{Math.round((workerStats.monthlyCompleted / workerStats.monthlyTarget) * 100)}% Complete</span>
                    <span>{workerStats.monthlyTarget - workerStats.monthlyCompleted} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                      <input
                        type="text"
                        value={editData.vehicleNumber}
                        onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Full Name</p>
                        <p className="text-gray-900">{profileData.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-gray-900">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-gray-900">{profileData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-gray-900">{profileData.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Employee ID</p>
                        <p className="text-gray-900">{profileData.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Join Date</p>
                        <p className="text-gray-900">{profileData.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Supervisor</p>
                        <p className="text-gray-900">{profileData.supervisor}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Vehicle Number</p>
                        <p className="text-gray-900">{profileData.vehicleNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        achievement.earned 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <achievement.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          achievement.earned ? 'text-green-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-green-700' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <div className="text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
