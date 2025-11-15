import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LogIn, UserPlus, User as UserIcon, Briefcase, Shield, ArrowLeft } from 'lucide-react';
import { User } from '../types';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://smart-waste-reporting-system.onrender.com'
  : 'http://localhost:5000';

type AuthMode = 'login' | 'signup';
type Role = 'citizen' | 'worker' | 'admin';

type Stage = 1 | 2 | 3;

interface AuthPageProps {
  onLogin: (userData: User, role: Role) => void;
}

const containerVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const StageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md mx-auto">
    {children}
  </motion.div>
);

const ModeSelect: React.FC<{
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onNext: () => void;
}> = ({ mode, setMode, onNext }) => (
  <StageWrapper>
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-green-600 p-3 rounded-full">
          <MapPin className="h-8 w-8 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
      <p className="text-gray-600">Choose how you want to continue</p>
    </div>

    <div className="grid grid-cols-1 gap-4">
      <button
        onClick={() => { setMode('login'); onNext(); }}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border text-lg font-semibold transition-all ${
          mode === 'login' ? 'bg-green-600 text-white border-transparent' : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
        }`}
      >
        <LogIn className="h-5 w-5" />
        <span>Login</span>
      </button>

      <button
        onClick={() => { setMode('signup'); onNext(); }}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border text-lg font-semibold transition-all ${
          mode === 'signup' ? 'bg-green-600 text-white border-transparent' : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
        }`}
      >
        <UserPlus className="h-5 w-5" />
        <span>Sign Up</span>
      </button>
    </div>
  </StageWrapper>
);

const RoleSelect: React.FC<{
  mode: AuthMode;
  role: Role;
  setRole: (r: Role) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ mode, role, setRole, onNext, onBack }) => (
  <StageWrapper>
    <button onClick={onBack} className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
      <ArrowLeft className="h-4 w-4 mr-1" /> Back
    </button>

    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a</h2>
      <p className="text-gray-600">Select your role to continue</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        onClick={() => setRole('citizen')}
        className={`p-4 rounded-xl border transition-all text-center ${
          role === 'citizen' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <UserIcon className="h-6 w-6 mx-auto mb-2" />
        <div className="font-medium">Citizen</div>
      </button>

      <button
        onClick={() => setRole('worker')}
        className={`p-4 rounded-xl border transition-all text-center ${
          role === 'worker' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <Briefcase className="h-6 w-6 mx-auto mb-2" />
        <div className="font-medium">Worker</div>
      </button>

      <button
        onClick={() => setRole('admin')}
        className={`p-4 rounded-xl border transition-all text-center ${
          role === 'admin' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <Shield className="h-6 w-6 mx-auto mb-2" />
        <div className="font-medium">Admin</div>
      </button>
    </div>

    <div className="mt-6">
      <button
        onClick={onNext}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          mode === 'signup' && role === 'admin' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        disabled={mode === 'signup' && role === 'admin'}
      >
        Continue
      </button>
      {mode === 'signup' && role === 'admin' && (
        <p className="mt-2 text-xs text-gray-500 text-center">Admins cannot sign up. Please choose Login or another role.</p>
      )}
    </div>
  </StageWrapper>
);

const AuthForm: React.FC<{
  mode: AuthMode;
  role: Role;
  onBack: () => void;
  onSuccess: (user: User, role: Role) => void;
  value: { name: string; email: string; phone: string; password: string; confirmPassword: string };
  onChange: (patch: Partial<{ name: string; email: string; phone: string; password: string; confirmPassword: string }>) => void;
}> = ({ mode, role, onBack, onSuccess, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSignup = mode === 'signup' && role !== 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (canSignup) {
      if (!value.name || !value.email || !value.phone || !value.password) {
        setError('Please fill all fields');
        return;
      }
      if (value.password !== value.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (!value.email || !value.password) {
        setError('Email and password are required');
        return;
      }
    }

    setLoading(true);
    try {
      if (canSignup) {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: value.name, email: value.email, password: value.password, phone: value.phone, role })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Signup failed');
        }
        const data = await res.json();
        localStorage.setItem('token', data.data.token);
        const user: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: data.data.user.role,
          provider: 'email',
          rewardPoints: data.data.user.rewardPoints || 0
        };
        onSuccess(user, user.role as Role);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value.email, password: value.password })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Login failed');
        }
        const data = await res.json();
        localStorage.setItem('token', data.data.token);
        const user: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: data.data.user.role,
          provider: 'email',
          rewardPoints: data.data.user.rewardPoints || 0
        };
        onSuccess(user, user.role as Role);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageWrapper>
      <button onClick={onBack} className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Login' : 'Create your account'}
        </h2>
        <p className="text-gray-600 capitalize">{role}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {canSignup && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={value.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="you@email.com"
            required
          />
        </div>

        {canSignup && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={value.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              autoComplete="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+91-XXXXXXXXXX"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={value.password}
            onChange={(e) => onChange({ password: e.target.value })}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>

        {canSignup && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={value.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Re-enter your password"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
    </StageWrapper>
  );
};

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [stage, setStage] = useState<Stage>(1);
  const [mode, setMode] = useState<AuthMode>((params.get('mode') as AuthMode) || 'login');
  const [role, setRole] = useState<Role>((params.get('role') as Role) || 'citizen');

  // Maintain form state per mode and role to avoid losing input focus/data
  const [formState, setFormState] = useState<{
    login: Record<Role, { name: string; email: string; phone: string; password: string; confirmPassword: string }>;
    signup: Record<Exclude<Role, 'admin'>, { name: string; email: string; phone: string; password: string; confirmPassword: string }> & Partial<Record<'admin', any>>;
  }>({
    login: {
      citizen: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
      worker: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
      admin: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    },
    signup: {
      citizen: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
      worker: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    },
  });

  const currentForm = useMemo(() => {
    return mode === 'signup'
      ? (formState.signup as any)[role] || { name: '', email: '', phone: '', password: '', confirmPassword: '' }
      : formState.login[role];
  }, [mode, role, formState]);

  const updateCurrentForm = useCallback((patch: Partial<{ name: string; email: string; phone: string; password: string; confirmPassword: string }>) => {
    setFormState(prev => {
      if (mode === 'signup') {
        return {
          ...prev,
          signup: {
            ...prev.signup,
            [role]: { ...(prev.signup as any)[role], ...patch }
          }
        } as any;
      }
      return {
        ...prev,
        login: {
          ...prev.login,
          [role]: { ...prev.login[role], ...patch }
        }
      };
    });
  }, [mode, role]);

  // Keep URL in sync for back/forward navigation
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set('stage', String(stage));
    newParams.set('mode', mode);
    newParams.set('role', role);
    setParams(newParams, { replace: true });
  }, [stage, mode, role, setParams]);

  useEffect(() => {
    const urlStage = Number(params.get('stage')) as Stage;
    const urlMode = (params.get('mode') as AuthMode) || 'login';
    const urlRole = (params.get('role') as Role) || 'citizen';
    if (urlStage && urlStage !== stage) setStage(urlStage);
    if (urlMode !== mode) setMode(urlMode);
    if (urlRole !== role) setRole(urlRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuccess = (user: User, r: Role) => {
    onLogin(user, r);
    navigate('/');
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <StageWrapper key="stage-1">
              <ModeSelect mode={mode} setMode={setMode} onNext={() => setStage(2)} />
            </StageWrapper>
          )}
          {stage === 2 && (
            <StageWrapper key="stage-2">
              <RoleSelect mode={mode} role={role} setRole={setRole} onNext={() => setStage(3)} onBack={() => setStage(1)} />
            </StageWrapper>
          )}
          {stage === 3 && (
            <StageWrapper key="stage-3">
              <AuthForm mode={mode} role={role} onBack={() => setStage(2)} onSuccess={handleSuccess} value={currentForm} onChange={updateCurrentForm} />
            </StageWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
