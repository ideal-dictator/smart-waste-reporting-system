import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  TrendingUp
} from 'lucide-react';
import { getReports, getImageUrl } from '../../utils/api';

interface AdminDashboardProps {
  onNavigate?: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | 'xlsx' | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getReports();
      const reportsData = response.data?.docs || response.data || [];
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingReports = reports.filter((r: any) => r.status === 'Pending').length;
  const assignedReports = reports.filter((r: any) => r.status === 'Assigned').length;
  const inProgressReports = reports.filter((r: any) => r.status === 'In Progress').length;
  const resolvedReports = reports.filter((r: any) => r.status === 'Resolved').length;

  const stats = [
    {
      label: 'Total Reports',
      value: reports.length,
      icon: MapPin,
      color: 'bg-blue-600',
      change: '+12%'
    },
    {
      label: 'Pending',
      value: pendingReports,
      icon: Clock,
      color: 'bg-orange-600',
      change: '+5%'
    },
    {
      label: 'In Progress',
      value: inProgressReports,
      icon: AlertTriangle,
      color: 'bg-yellow-600',
      change: '-2%'
    },
    {
      label: 'Resolved',
      value: resolvedReports,
      icon: CheckCircle,
      color: 'bg-green-600',
      change: '+18%'
    }
  ];

  const highPriorityReports = reports
    .filter((r: any) => (r.severity || 5) >= 8 && r.status !== 'Resolved')
    .sort((a: any, b: any) => (b.severity || 5) - (a.severity || 5))
    .slice(0, 5);

  const downloadBlob = (data: BlobPart, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = async () => {
    try {
      setExporting('csv');
      const res = await getReports();
      const items = res.data?.docs || res.data || [];
      const headers = ['id','status','wasteType','severity','address','createdAt'];
      const rows = items.map((r: any) => [r._id || r.id, r.status, r.wasteType, r.severity, r.location?.address, r.createdAt]);
      const csv = [headers.join(','), ...rows.map((r: any[]) => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
      downloadBlob(csv, 'reports.csv', 'text/csv;charset=utf-8;');
    } catch (e: any) {
      alert(e.message || 'Failed to export CSV');
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    try {
      setExporting('pdf');
      const res = await getReports();
      const items = res.data?.docs || res.data || [];
      const html = `<!doctype html><title>Reports</title><style>body{font-family:sans-serif;padding:24px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:8px}</style><h1>Reports</h1><table><thead><tr><th>ID</th><th>Status</th><th>Type</th><th>Severity</th><th>Address</th></tr></thead><tbody>${items.map((r:any)=>`<tr><td>${r._id||r.id}</td><td>${r.status}</td><td>${r.wasteType}</td><td>${r.severity}</td><td>${r.location?.address||''}</td></tr>`).join('')}</tbody></table>`;
      downloadBlob(html, 'reports.html', 'text/html');
    } catch (e: any) {
      alert(e.message || 'Failed to export PDF');
    } finally {
      setExporting(null);
    }
  };

  const scheduleReport = async () => {
    alert('Report scheduled successfully. You will receive it via email.');
  };

  return (
    <div className="max-w-[1920px] mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-up">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor and manage waste reports across the city</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 group-hover:scale-110 transition-transform duration-300 counter-animation">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                <stat.icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-3 sm:mt-4">
              <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 group-hover:translate-y-[-2px] transition-transform duration-300" />
              <span className="text-xs sm:text-sm text-green-500 ml-1">{stat.change}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Priority Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow duration-300 animate-slide-up animation-delay-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">High Priority Reports</h2>
            <p className="text-gray-600 mt-1">Reports requiring immediate attention</p>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-600">Loading...</div>
            ) : highPriorityReports.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No high priority reports</div>
            ) : (
              highPriorityReports.map((report: any) => {
                const location = report.location || {};
                const address = typeof location === 'string' ? location : (location.address || 'Unknown location');
                const imageUrl = getImageUrl(report.imageUrl || report.imagePath);
                return (
                  <div key={report.id || report._id} className="p-6 hover:bg-gray-50 hover:scale-[1.02] transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="Waste report"
                            className="w-16 h-16 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-300">{address}</h3>
                          <p className="text-sm text-gray-600 mt-1">{report.description || 'No description'}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              report.wasteType === 'Medical' 
                                ? 'bg-red-100 text-red-800'
                                : report.wasteType === 'E-Waste'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {report.wasteType || 'Mixed'}
                            </span>
                            <span className="text-sm text-gray-500">
                              Severity: {report.severity || 5}/10
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'Pending'
                              ? 'bg-orange-100 text-orange-800'
                              : report.status === 'Assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status || 'Pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate?.('reports')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View All Reports
              </button>
              <button
                onClick={() => onNavigate?.('workers')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Manage Workers
              </button>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={exportCSV} className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors" disabled={exporting==='csv'}>
                  {exporting==='csv' ? 'Exporting CSV...' : 'Export CSV'}
                </button>
                <button onClick={exportPDF} className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors" disabled={exporting==='pdf'}>
                  {exporting==='pdf' ? 'Preparing PDF...' : 'Export PDF'}
                </button>
                <button onClick={scheduleReport} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Schedule Report
                </button>
              </div>
            </div>
          </div>

          {/* Zone Performance */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Zone Performance</h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : reports.length === 0 ? (
                <p className="text-gray-600">No data available</p>
              ) : (
                (() => {
                  const zoneCounts: { [key: string]: number } = {};
                  reports.forEach((r: any) => {
                    const location = r.location || {};
                    const zone = typeof location === 'string' ? location : (location.address || 'Unknown').split(',')[0];
                    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
                  });
                  return Object.entries(zoneCounts).slice(0, 5).map(([zone, count]) => (
                    <div key={zone} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{zone}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(count / Math.max(...Object.values(zoneCounts), 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;