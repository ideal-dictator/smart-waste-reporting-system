import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  BarChart3, 
  Users, 
  FileText,
  Home,
  Settings,
  LogOut,
  Phone,
  HelpCircle,
  Info,
  Search,
  Truck,
  User as UserIcon,
  LogIn,
  ChevronDown,
  UserCircle,
  Award,
  Clock
} from 'lucide-react';
import { UserRole, User } from '../../types';

interface NavigationProps {
  currentView: string;
  userRole: UserRole;
  onViewChange: (view: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onLogin?: () => void;
  user?: User | null;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  userRole, 
  onViewChange, 
  isAuthenticated = false,
  onLogout,
  onLogin,
  user
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getNavItems = () => {
    switch (userRole) {
      case 'citizen':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'report', label: 'Report Waste', icon: MapPin },
          { id: 'my-reports', label: 'My Reports', icon: FileText },
          { id: 'rewards', label: 'Rewards', icon: BarChart3 },
          { id: 'games', label: 'Games', icon: Users },
          { id: 'status', label: 'Check Status', icon: Search },
          { id: 'about', label: 'About', icon: Info },
          { id: 'contact', label: 'Contact', icon: Phone },
          { id: 'faq', label: 'FAQ', icon: HelpCircle }
        ];
      case 'admin':
        return isAuthenticated ? [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'reports', label: 'All Reports', icon: FileText },
          { id: 'workers', label: 'Workers', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ] : [
          { id: 'admin-login', label: 'Admin Login', icon: Home }
        ];
      case 'worker':
        return [
          { id: 'tasks', label: 'My Tasks', icon: FileText },
          { id: 'map', label: 'Route Map', icon: MapPin },
          { id: 'profile', label: 'Profile', icon: Settings }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  
  // Special navigation items for agent portal
  const agentNavItems = [
    { id: 'agent-jobs', label: 'My Jobs', icon: FileText },
    { id: 'agent-complete', label: 'Complete Job', icon: Settings }
  ];

  return (
    <nav className="bg-white shadow-sm border-b animate-slide-down sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-green-600 p-2 rounded-lg hover:bg-green-700 hover:scale-110 hover:rotate-12 transition-all duration-300">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <button 
                onClick={() => onViewChange('home')}
                className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-gray-900 hover:text-green-600 hover:scale-105 transition-all duration-300"
              >
                <span className="hidden sm:inline">SmartWaste</span>
                <span className="sm:hidden">SW</span>
              </button>
            </div>
          </div>
          
          {/* Desktop Navigation & Auth */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Show agent navigation if on agent pages */}
            {(currentView.startsWith('agent-') && isAuthenticated) ? 
              agentNavItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                    currentView === id
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{label}</span>
                </button>
              )) :
              navItems.slice(0, 6).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                  currentView === id
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden xl:inline">{label}</span>
              </button>
              ))
            }
          </div>
          
          {/* Authentication and Mobile Menu Section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Authentication */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Profile Dropdown */}
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-green-600">
                        {userRole === 'citizen' ? `${user.rewardPoints || 0} points` : 
                         userRole === 'worker' ? 'Worker' : 'Admin'}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">
                            {userRole === 'citizen' ? 'Citizen' : 
                             userRole === 'worker' ? 'Waste Collection Worker' : 'Administrator'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          onViewChange('profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      
                      {userRole === 'citizen' && (
                        <>
                          <button
                            onClick={() => {
                              onViewChange('my-reports');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            <span>My Reports</span>
                          </button>
                          <button
                            onClick={() => {
                              onViewChange('rewards');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Award className="h-4 w-4" />
                            <span>Rewards & Achievements</span>
                          </button>
                        </>
                      )}
                      
                      {userRole === 'worker' && (
                        <>
                          <button
                            onClick={() => {
                              onViewChange('tasks');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Clock className="h-4 w-4" />
                            <span>My Tasks</span>
                          </button>
                          <button
                            onClick={() => {
                              onViewChange('map');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MapPin className="h-4 w-4" />
                            <span>Route Planner</span>
                          </button>
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={() => {
                          onLogout?.();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Login Button - Desktop Only */}
                <button
                  onClick={onLogin}
                  className="hidden lg:flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>

                {/* Role Selector - Desktop Only */}
                <select
                  className="hidden lg:block text-sm border rounded-md px-3 py-2 bg-white"
                  onChange={(e) => onViewChange(`role-${e.target.value}`)}
                  value={userRole}
                >
                  <option value="citizen">Citizen View</option>
                  <option value="admin">Admin View</option>
                  <option value="worker">Worker View</option>
                </select>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 w-full bg-white border-b shadow-lg z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Menu Items */}
            {(currentView.startsWith('agent-') && isAuthenticated) ? 
              agentNavItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    onViewChange(id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentView === id
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              )) :
              navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    onViewChange(id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentView === id
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))
            }
            
            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">
                        {userRole === 'citizen' ? `${user.rewardPoints || 0} points` : 
                         userRole === 'worker' ? 'Worker' : 'Admin'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLogin?.();
                      setShowMobileMenu(false);
                    }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors mb-2"
                  >
                    Login
                  </button>
                  <select
                    className="w-full text-sm border rounded-lg px-4 py-3 bg-white"
                    onChange={(e) => {
                      onViewChange(`role-${e.target.value}`);
                      setShowMobileMenu(false);
                    }}
                    value={userRole}
                  >
                    <option value="citizen">Citizen View</option>
                    <option value="admin">Admin View</option>
                    <option value="worker">Worker View</option>
                  </select>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;