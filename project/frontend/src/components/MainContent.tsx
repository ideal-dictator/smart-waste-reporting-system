import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import WasteReportForm from './citizen/WasteReportForm';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import ReportsMap from './admin/ReportsMap';
import WorkersManagement from './admin/WorkersManagement';
import Analytics from './admin/Analytics';
import AgentLogin from './agent/AgentLogin';
import AgentJobs from './agent/AgentJobs';
import JobComplete from './agent/JobComplete';
import WorkerTasks from './worker/WorkerTasks';
import RoutePlanner from './worker/RoutePlanner';
import Profile from './worker/Profile';
import RewardsOverview from './rewards/RewardsOverview';
import Leaderboard from './rewards/Leaderboard';
import BadgesAchievements from './rewards/BadgesAchievements';
import CommunityImpact from './rewards/CommunityImpact';
import RewardsStore from './rewards/RewardsStore';
import GamesHub from './games/GamesHub';
import WasteMatchGame from './games/WasteMatchGame';
import EcoQuizGame from './games/EcoQuizGame';
import CleanupChallengeGame from './games/CleanupChallengeGame';
import TrashTriviaBattle from './games/TrashTriviaBattle';
import RecycleRun from './games/RecycleRun';
import SmartCitizenChallenge from './games/SmartCitizenChallenge';
import { getReports, getUserReports, getImageUrl } from '../utils/api';
import { User, UserRole } from '../types';

interface MainContentProps {
  user: User | null;
  userRole: UserRole;
  onLogout: () => void;
}

function MainContent({ user, userRole, onLogout }: MainContentProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('home');
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAgentAuthenticated, setIsAgentAuthenticated] = useState(false);

  // Load reports from MongoDB on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('userRole');
    
    if (token && (savedRole === 'admin' || savedRole === 'worker')) {
      fetchReports();
    } else if (token && savedRole === 'citizen') {
      fetchUserReports();
    }
  }, []);

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

  const fetchUserReports = async () => {
    try {
      setLoadingReports(true);
      const response = await getUserReports();
      const reportsData = response.data?.docs || response.data || [];
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching user reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Memoize role restrictions to avoid recreation on every render
  const roleBasedRestrictions = useMemo(() => ({
    'report': ['worker', 'admin'],
    'my-reports': ['worker', 'admin'],
    'rewards': ['worker', 'admin'],
    'games': ['worker', 'admin'],
    'status': ['worker', 'admin'],
    'about': [],
    'contact': [],
    'faq': [],
    'home': [],
    'dashboard': ['citizen', 'worker'],
    'reports': ['citizen', 'worker'],
    'workers': ['citizen', 'worker'],
    'analytics': ['citizen', 'worker'],
    'tasks': ['citizen', 'admin'],
    'map': ['citizen', 'admin'],
  }), []);

  const handleViewChange = (view: string) => {
    const restrictedRoles = roleBasedRestrictions[view];
    if (restrictedRoles && restrictedRoles.includes(userRole)) {
      console.warn(`Access denied: ${userRole} cannot access ${view}`);
      return;
    }

    const protectedViews = ['report', 'my-reports', 'rewards', 'games', 'profile', 'tasks', 'map'];
    if (protectedViews.includes(view) && !user) {
      navigate('/login');
      return;
    }

    if (view.startsWith('role-')) {
      const role = view.replace('role-', '') as UserRole;
      setCurrentView(role === 'citizen' ? 'home' : role === 'admin' ? 'dashboard' : 'tasks');
    } else {
      setCurrentView(view);
    }
  };

  const handleReportSubmit = async (report: any) => {
    // Refresh reports list from MongoDB
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'admin' || savedRole === 'worker') {
      await fetchReports();
    } else {
      await fetchUserReports();
    }
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleAgentLogin = () => {
    setIsAgentAuthenticated(true);
    setCurrentView('agent-jobs');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleViewChange} userRole={userRole} />;
      case 'status':
        return <StatusPage />;
      case 'about':
        return <AboutPage onNavigate={handleViewChange} />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage onNavigate={handleViewChange} />;
      case 'report':
        if (userRole !== 'citizen') {
          return (
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">Report Waste feature is only available for citizens.</p>
            </div>
          );
        }
        return user ? (
          <WasteReportForm onReportSubmit={handleReportSubmit} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to submit reports</p>
          </div>
        );
      case 'my-reports':
        return user ? (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reports</h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                Welcome back, <strong>{user.name}</strong>! You have <strong>{user.rewardPoints}</strong> reward points.
              </p>
            </div>
            {loadingReports ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No reports found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report: any) => {
                  const location = report.location || {};
                  const address = typeof location === 'string' ? location : (location.address || 'Unknown location');
                  const imageUrl = getImageUrl(report.imageUrl || report.imagePath);
                  // Generate readable report ID
                  const reportId = report.reportId || (report._id ? `WR-${report._id.toString().substring(0, 8).toUpperCase()}` : report.id || 'N/A');
                  
                  return (
                    <div key={report.id || report._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{address}</h3>
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              ID: {reportId}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1 mb-3">{report.description || 'No description'}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              report.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                              report.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status || 'Pending'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {report.wasteType || 'Mixed'} • Severity: {report.severity || 5}/10
                            </span>
                            <span className="text-xs text-gray-500">
                              {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="Report"
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to view your reports</p>
          </div>
        );

      case 'rewards':
        return user ? <RewardsOverview user={user} /> : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to view rewards</p>
          </div>
        );
      case 'leaderboard':
        return user ? <Leaderboard user={user} /> : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to view leaderboard</p>
          </div>
        );
      case 'badges':
        return user ? <BadgesAchievements user={user} /> : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to view badges</p>
          </div>
        );
      case 'community-impact':
        return <CommunityImpact />;
      case 'rewards-store':
        return user ? <RewardsStore user={user} /> : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to access rewards store</p>
          </div>
        );

      case 'games':
        return user ? (
          <GamesHub onGameSelect={(game) => setCurrentView(game)} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );
      case 'waste-match':
      case 'waste-sort-master':
        return user ? (
          <WasteMatchGame onBack={() => setCurrentView('games')} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );
      case 'eco-quiz':
      case 'daily-eco-quiz':
        return user ? (
          <EcoQuizGame onBack={() => setCurrentView('games')} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );
      case 'cleanup-challenge':
        return user ? (
          <CleanupChallengeGame onBack={() => setCurrentView('games')} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );
      case 'trash-trivia-battle':
        return user ? (
          <TrashTriviaBattle onBack={() => setCurrentView('games')} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );
      case 'recycle-run':
        return user ? (
          <RecycleRun onBack={() => setCurrentView('games')} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );
      case 'smart-citizen-challenge':
        return user ? (
          <SmartCitizenChallenge onBack={() => setCurrentView('games')} user={user} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to play games</p>
          </div>
        );

      case 'admin-login':
        return <AdminLogin onLogin={() => handleAdminLogin()} />;
      case 'dashboard':
        return isAdminAuthenticated ? <AdminDashboard onNavigate={handleViewChange} /> : <AdminLogin onLogin={() => handleAdminLogin()} />;
      case 'reports':
        return isAdminAuthenticated ? (
          <ReportsMap 
            reports={reports} 
            onAssignWorker={async (reportId, workerId) => {
              // The API call is handled in ReportsMap component
              // Just refresh the reports list here
              await fetchReports();
            }} 
          />
        ) : <AdminLogin onLogin={() => handleAdminLogin()} />;
      case 'workers':
        return isAdminAuthenticated ? <WorkersManagement /> : <AdminLogin onLogin={() => handleAdminLogin()} />;
      case 'analytics':
        return isAdminAuthenticated ? <Analytics /> : <AdminLogin onLogin={() => handleAdminLogin()} />;

      case 'agent-login':
        return <AgentLogin onLogin={() => handleAgentLogin()} />;
      case 'agent-jobs':
        return isAgentAuthenticated ? <AgentJobs /> : <AgentLogin onLogin={() => handleAgentLogin()} />;
      case 'agent-complete':
        return isAgentAuthenticated ? <JobComplete /> : <AgentLogin onLogin={() => handleAgentLogin()} />;

      case 'tasks':
        return <WorkerTasks onNavigate={handleViewChange} />;
      case 'map':
        return <RoutePlanner onNavigate={handleViewChange} />;
      case 'profile':
        return user ? <Profile user={user} onNavigate={handleViewChange} /> : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to view profile</p>
          </div>
        );

      default:
        return <HomePage onNavigate={handleViewChange} userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        userRole={userRole} 
        onViewChange={handleViewChange} 
        isAuthenticated={!!user}
        user={user}
        onLogin={() => navigate('/login')}
        onLogout={onLogout}
      />
      <main className="py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default MainContent;

