import React from 'react';
import { 
  Users, 
  Recycle, 
  TreePine,
  Heart,
  Globe,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react';

const CommunityImpact: React.FC = () => {
  const impactStats = [
    {
      icon: Recycle,
      title: 'Waste Collected',
      value: '2,847',
      unit: 'kg',
      description: 'Total waste collected through community reports',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Users,
      title: 'Active Contributors',
      value: '1,247',
      unit: 'citizens',
      description: 'Community members actively reporting waste issues',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: TreePine,
      title: 'CO₂ Saved',
      value: '156',
      unit: 'tons',
      description: 'Carbon emissions prevented through proper waste management',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: MapPin,
      title: 'Areas Cleaned',
      value: '89',
      unit: 'locations',
      description: 'Different locations cleaned through community efforts',
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const monthlyData = [
    { month: 'Aug', reports: 145, resolved: 138, participants: 89 },
    { month: 'Sep', reports: 167, resolved: 159, participants: 102 },
    { month: 'Oct', reports: 189, resolved: 182, participants: 124 },
    { month: 'Nov', reports: 203, resolved: 195, participants: 156 },
    { month: 'Dec', reports: 234, resolved: 228, participants: 189 },
    { month: 'Jan', reports: 156, resolved: 148, participants: 134 }
  ];

  const topContributors = [
    { name: 'Priya Sharma', reports: 45, points: 2450 },
    { name: 'Rajesh Kumar', reports: 38, points: 2180 },
    { name: 'Anita Verma', reports: 42, points: 1950 },
    { name: 'Amit Singh', reports: 31, points: 1720 },
    { name: 'Sunita Devi', reports: 29, points: 1650 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Impact</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our community is working together to create a cleaner, healthier environment for everyone
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-600">{stat.unit}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Monthly Community Activity</h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-full">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 min-w-32 text-center">
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-lg font-bold text-gray-900">{data.month}</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Reports</p>
                      <p className="text-xl font-bold text-blue-600">{data.reports}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Resolved</p>
                      <p className="text-lg font-semibold text-green-600">{data.resolved}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contributors</p>
                      <p className="text-lg font-semibold text-purple-600">{data.participants}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Contributors */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Contributors This Month</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contributor.name}</p>
                        <p className="text-sm text-gray-600">{contributor.reports} reports</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{contributor.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Environmental Benefits</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cleaner Environment</h3>
                    <p className="text-sm text-gray-600">Reduced pollution in 89 locations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Public Health</h3>
                    <p className="text-sm text-gray-600">Prevented disease outbreaks</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Unity</h3>
                    <p className="text-sm text-gray-600">1,247 active participants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
          <p className="text-green-100 mb-6">
            Every report makes a difference. Be part of the solution and help create a cleaner future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Report Waste Now
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Invite Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityImpact;