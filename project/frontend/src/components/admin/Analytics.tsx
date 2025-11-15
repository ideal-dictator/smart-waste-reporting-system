import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getAnalytics, getReports } from '../../utils/api';
import { INDIAN_ZONES } from '../../utils/indianZones';

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
    fetchReports();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalytics(30);
      if (response.success && response.data) {
        setAnalyticsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await getReports();
      const reports = response.data?.docs || response.data || [];
      setReportsData(reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  // Filter reports by zone if selected
  const filteredReports = selectedZone === 'all' 
    ? reportsData 
    : reportsData.filter((r: any) => {
        const reportZone = r.location?.address || '';
        return reportZone.toLowerCase().includes(selectedZone.toLowerCase());
      });

  // Calculate metrics from filtered reports data
  const totalReports = filteredReports.length;
  const resolvedReports = filteredReports.filter((r: any) => r.status === 'Resolved').length;
  const pendingReports = filteredReports.filter((r: any) => r.status === 'Pending').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;
  const pendingRate = totalReports > 0 ? Math.round((pendingReports / totalReports) * 100) : 0;

  // Calculate average resolution time from analytics or reports
  const avgResolutionTime = analyticsData?.completionTime?.averageCompletionTime 
    ? Math.round(analyticsData.completionTime.averageCompletionTime / 24) 
    : 0;

  // Waste type distribution from filtered reports
  const wasteTypeCounts: Record<string, number> = {};
  filteredReports.forEach((report: any) => {
    const type = report.wasteType || 'Mixed';
    wasteTypeCounts[type] = (wasteTypeCounts[type] || 0) + 1;
  });
  const wasteTypeData = Object.entries(wasteTypeCounts).map(([type, count]) => ({
    name: type,
    value: count
  }));

  // Zone/Geographic distribution from analytics
  const zoneData = analyticsData?.geographicDistribution?.slice(0, 10).map((item: any) => ({
    zone: `${item._id.lat}, ${item._id.lng}`,
    reports: item.count
  })) || [];

  // Daily trends from analytics
  const monthlyTrends = analyticsData?.dailyTrends?.map((trend: any) => ({
    month: `${trend._id.month}/${trend._id.day}`,
    reports: trend.reports,
    resolved: trend.resolved
  })) || [];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into waste management performance
          </p>
        </div>
        
        {/* Zone Filter */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Filter by Zone:</label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[200px]"
          >
            <option value="all">All Zones</option>
            {INDIAN_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalReports}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">+12.5%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{resolutionRate}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">+5.2%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgResolutionTime}d</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">-0.8d</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingReports}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">-15%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Report Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="reports" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Total Reports"
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Resolved Reports"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Waste Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wasteTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {wasteTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Performance */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports by Zone</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reports" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Resolution Rate</span>
                <span className="text-sm font-semibold text-gray-900">{resolutionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${resolutionRate}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Reports</span>
                <span className="text-sm font-semibold text-gray-900">{pendingRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full"
                  style={{ width: `${pendingRate}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Best Performing Zone</p>
                  <p className="text-lg font-bold text-green-900">
                    {zoneData.length > 0 ? zoneData[0].zone : 'N/A'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">Most Common Waste Type</p>
                  <p className="text-lg font-bold text-blue-900">
                    {wasteTypeData.length > 0 
                      ? wasteTypeData.sort((a, b) => b.value - a.value)[0].name 
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-600 p-2 rounded-full">
                  <BarChart className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Reports</h2>
            <p className="text-gray-600 mt-1">Download detailed analytics reports</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Export PDF
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Export Excel
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Schedule Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;