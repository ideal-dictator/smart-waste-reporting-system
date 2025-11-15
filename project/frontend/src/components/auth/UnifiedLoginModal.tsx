import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, Shield, Truck, Users } from 'lucide-react';
import SocialLogin from './SocialLogin';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any, role: 'citizen' | 'admin' | 'worker') => void;
}

type LoginType = 'citizen' | 'worker' | 'admin';

const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [loginType, setLoginType] = useState<LoginType | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (loginType === 'admin') {
      if (formData.email === 'kumaran18v@gmail.com' && formData.password === 'admin123') {
        const userData = {
          id: Date.now().toString(),
          name: 'Admin User',
          email: formData.email,
          role: 'admin',
          provider: 'email'
        };
        onLogin(userData, 'admin');
        setLoading(false);
        onClose();
        resetForm();
        return;
      } else if (formData.email === 'admin' || formData.email === 'admin@smartwaste.com') {
        if (formData.password === 'admin123') {
          const userData = {
            id: Date.now().toString(),
            name: 'Admin User',
            email: formData.email,
            role: 'admin',
            provider: 'email'
          };
          onLogin(userData, 'admin');
          setLoading(false);
          onClose();
          resetForm();
          return;
        }
      }
      setError('Invalid admin credentials');
      setLoading(false);
      return;
    }

    if (loginType === 'worker') {
      if ((formData.email === 'worker' || formData.email === 'agent') && formData.password === 'worker123') {
        const userData = {
          id: Date.now().toString(),
          name: 'Worker User',
          email: formData.email,
          role: 'worker',
          provider: 'email'
        };
        onLogin(userData, 'worker');
        setLoading(false);
        onClose();
        resetForm();
        return;
      }
      setError('Invalid worker credentials');
      setLoading(false);
      return;
    }

    const userData = {
      id: Date.now().toString(),
      name: formData.name || 'Demo User',
      email: formData.email,
      phone: formData.phone,
      role: 'citizen',
      rewardPoints: isSignUp ? 50 : 1247,
      streakCount: isSignUp ? 1 : 7,
      provider: 'email'
    };

    onLogin(userData, 'citizen');
    setLoading(false);
    onClose();
    resetForm();
  };

  const handleSocialLogin = (provider: string, userData: any) => {
    const enrichedUserData = {
      ...userData,
      id: Date.now().toString(),
      role: 'citizen',
      rewardPoints: 50,
      streakCount: 1
    };
    onLogin(enrichedUserData, 'citizen');
    onClose();
    resetForm();
  };

  const handleSocialError = (error: string) => {
    setError(error);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Password reset link sent to your email!');
    setLoading(false);
    setShowForgotPassword(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setLoginType(null);
    setIsSignUp(false);
    setError('');
    setShowForgotPassword(false);
  };

  if (!isOpen) return null;

  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-zoom-in">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!loginType) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-zoom-in">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Choose Login Type</h2>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={() => setLoginType('citizen')}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl font-medium transition-all hover:scale-105 flex items-center space-x-4"
            >
              <Users className="h-8 w-8" />
              <div className="text-left">
                <div className="text-xl font-bold">Login as Citizen</div>
                <div className="text-sm text-green-100">Report waste issues and track reports</div>
              </div>
            </button>

            <button
              onClick={() => setLoginType('worker')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl font-medium transition-all hover:scale-105 flex items-center space-x-4"
            >
              <Truck className="h-8 w-8" />
              <div className="text-left">
                <div className="text-xl font-bold">Login as Worker</div>
                <div className="text-sm text-blue-100">Access assigned tasks and routes</div>
              </div>
            </button>

            <button
              onClick={() => setLoginType('admin')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl font-medium transition-all hover:scale-105 flex items-center space-x-4"
            >
              <Shield className="h-8 w-8" />
              <div className="text-left">
                <div className="text-xl font-bold">Login as Admin</div>
                <div className="text-sm text-purple-100">Manage workers and view analytics</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getLoginTitle = () => {
    switch (loginType) {
      case 'citizen': return isSignUp ? 'Create Citizen Account' : 'Citizen Login';
      case 'worker': return 'Worker Login';
      case 'admin': return 'Admin Login';
    }
  };

  const getLoginIcon = () => {
    switch (loginType) {
      case 'citizen': return <Users className="h-6 w-6" />;
      case 'worker': return <Truck className="h-6 w-6" />;
      case 'admin': return <Shield className="h-6 w-6" />;
    }
  };

  const getDemoCredentials = () => {
    switch (loginType) {
      case 'admin':
        return { email: 'kumaran18v@gmail.com', password: 'admin123', label: 'Admin Email' };
      case 'worker':
        return { email: 'worker', password: 'worker123', label: 'Worker ID' };
      default:
        return null;
    }
  };

  const demoCredentials = getDemoCredentials();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8 animate-zoom-in">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            {getLoginIcon()}
            <h2 className="text-2xl font-bold text-gray-900">{getLoginTitle()}</h2>
          </div>
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loginType === 'citizen' && !isSignUp && (
            <SocialLogin onSuccess={handleSocialLogin} onError={handleSocialError} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {isSignUp && loginType === 'citizen' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {demoCredentials?.label || 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={loginType === 'citizen' ? 'email' : 'text'}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={demoCredentials ? `Enter ${demoCredentials.label.toLowerCase()}` : 'Enter your email'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && loginType === 'citizen' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {loginType === 'citizen' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          )}

          {demoCredentials && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Demo Credentials:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>{demoCredentials.label}:</strong> {demoCredentials.email}</p>
                <p><strong>Password:</strong> {demoCredentials.password}</p>
              </div>
            </div>
          )}

          {isSignUp && loginType === 'citizen' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Welcome Bonus!</h3>
              <p className="text-sm text-green-700">
                Get 50 reward points just for signing up and start your eco-journey!
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setLoginType(null)}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Back to login type selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginModal;
