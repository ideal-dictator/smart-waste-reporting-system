import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthPage from './pages/AuthPage';
import HomePage from './components/pages/HomePage';
import StatusPage from './components/pages/StatusPage';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import FAQPage from './components/pages/FAQPage';
import WasteReportForm from './components/citizen/WasteReportForm';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import ReportsMap from './components/admin/ReportsMap';
import WorkersManagement from './components/admin/WorkersManagement';
import Analytics from './components/admin/Analytics';
import AgentLogin from './components/agent/AgentLogin';
import AgentJobs from './components/agent/AgentJobs';
import JobComplete from './components/agent/JobComplete';
import WorkerTasks from './components/worker/WorkerTasks';
import RoutePlanner from './components/worker/RoutePlanner';
import Profile from './components/worker/Profile';
import RewardsOverview from './components/rewards/RewardsOverview';
import Leaderboard from './components/rewards/Leaderboard';
import BadgesAchievements from './components/rewards/BadgesAchievements';
import CommunityImpact from './components/rewards/CommunityImpact';
import RewardsStore from './components/rewards/RewardsStore';
import GamesHub from './components/games/GamesHub';
import WasteMatchGame from './components/games/WasteMatchGame';
import EcoQuizGame from './components/games/EcoQuizGame';
import CleanupChallengeGame from './components/games/CleanupChallengeGame';
import TrashTriviaBattle from './components/games/TrashTriviaBattle';
import RecycleRun from './components/games/RecycleRun';
import SmartCitizenChallenge from './components/games/SmartCitizenChallenge';
import { getReports, getUserReports, getImageUrl } from './utils/api';
import { User, UserRole } from './types';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [reports, setReports] = useState<any[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAgentAuthenticated, setIsAgentAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);

  // Load user from localStorage on mount and fetch reports
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('userRole');
    const savedAuth = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('token');
    
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setUserRole(savedRole as UserRole);
      if (savedRole === 'admin' && savedAuth === 'true') {
        setIsAdminAuthenticated(true);
      } else if (savedRole === 'worker' && savedAuth === 'true') {
        setIsAgentAuthenticated(true);
      }
    }

    // Fetch reports if authenticated
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
    'report': ['worker', 'admin'], // Workers and admins should not access report
    'my-reports': ['worker', 'admin'], // Workers and admins should not access my-reports
    'rewards': ['worker', 'admin'],
    'games': ['worker', 'admin'],
    'status': ['worker', 'admin'],
    'about': [],
    'contact': [],
    'faq': [],
    'home': [],
    // Admin-only views
    'dashboard': ['citizen', 'worker'],
    'reports': ['citizen', 'worker'],
    'workers': ['citizen', 'worker'],
    'analytics': ['citizen', 'worker'],
    // Worker-only views
    'tasks': ['citizen', 'admin'],
    'map': ['citizen', 'admin'],
  }), []);

  const handleViewChange = (view: string) => {
    // Check role restrictions
    const restrictedRoles = roleBasedRestrictions[view];
    if (restrictedRoles && restrictedRoles.includes(userRole)) {
      console.warn(`Access denied: ${userRole} cannot access ${view}`);
      return;
    }

    // Check if user needs to be logged in for certain views
    const protectedViews = ['report', 'my-reports', 'rewards', 'games', 'profile', 'tasks', 'map'];
    if (protectedViews.includes(view) && !user) {
      // Will redirect via Navigation component
      return;
    }

    if (view.startsWith('role-')) {
      const role = view.replace('role-', '') as UserRole;
      setUserRole(role);
      
      // Set appropriate default view for each role
      switch (role) {
        case 'citizen':
          setCurrentView('home');
          break;
        case 'admin':
          setCurrentView('dashboard');
          break;
        case 'worker':
          setCurrentView('tasks');
          break;
      }
    } else {
      setCurrentView(view);
    }
  };

  const handleReportSubmit = async (report: any) => {
    // Refresh user reports after submission
    if (userRole === 'citizen') {
      await fetchUserReports();
    }
    setReports(prev => [report, ...prev]);
    // Refresh reports list
    if (userRole === 'admin' || userRole === 'worker') {
      fetchReports();
    } else {
      fetchUserReports();
    }
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setUserRole('admin');
    setCurrentView('dashboard');
  };

  const handleAgentLogin = () => {
    setIsAgentAuthenticated(true);
    setCurrentView('agent-jobs');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAgentAuthenticated(false);
    setUser(null);
    setUserRole('citizen');
    setCurrentView('home');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
  };

  const handleLogin = (userData: User, role: UserRole) => {
    setUser(userData);
    setUserRole(role);
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');

    // Set authentication state and view based on role
    if (role === 'admin') {
      setIsAdminAuthenticated(true);
      setCurrentView('dashboard');
    } else if (role === 'worker') {
      setIsAgentAuthenticated(true);
      setCurrentView('tasks');
    } else {
      setCurrentView('home');
    }

    if (userData.provider !== 'demo') {
      console.log('User logged in:', userData);
    }
  };
  const renderContent = () => {
    switch (currentView) {
      // Citizen Views
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
        // Only citizens can access report form
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

      // Rewards Views
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

      // Games Views
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

      // Admin Views
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

      // Agent Views
      case 'agent-login':
        return <AgentLogin onLogin={() => handleAgentLogin()} />;
      case 'agent-jobs':
        return isAgentAuthenticated ? <AgentJobs /> : <AgentLogin onLogin={() => handleAgentLogin()} />;
      case 'agent-complete':
        return isAgentAuthenticated ? <JobComplete /> : <AgentLogin onLogin={() => handleAgentLogin()} />;

      // Worker Views
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
        return <HomePage onNavigate={handleViewChange} />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
        <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation 
              currentView={currentView} 
              userRole={userRole} 
              onViewChange={handleViewChange} 
              isAuthenticated={!!user}
              user={user}
              onLogin={() => window.location.href = '/auth'}
              onLogout={handleLogout}
            />
            <main className="py-8">
              {renderContent()}
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;