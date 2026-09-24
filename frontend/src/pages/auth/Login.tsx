import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your email or username');
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier.trim());
      toast.success(`Welcome back, ${user.name || 'User'}!`);
      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else if (user.role === 'applicant') {
        navigate('/app');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1e0c5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem */}
        <div className="w-16 h-16 bg-gradient-to-tr from-[#5b6a57] to-[#71816d] rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 border border-[#c9b79c]">
          <span className="font-serif font-extrabold text-2xl text-amber-200 tracking-wider">ST</span>
        </div>

        {/* Portal Pill */}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#e8d6ba] text-[#5b6a57] border border-[#dfcdb1] mb-2 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
          Ministry of Tribal Affairs • DBT Portal
        </span>

        <h2 className="text-3xl font-extrabold text-[#2c352a] tracking-tight">Welcome back</h2>
        <p className="mt-1 text-sm text-[#5a6857] font-medium">Sign in to the Vidya-Vrtti Fellowship & Scholarship Portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[460px] px-4 sm:px-0">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-xl rounded-3xl border border-[#c9b79c]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c352a] mb-1.5">
                Email address or Login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#71816d]" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. student@demo.in or VV-2026-10001"
                  className="block w-full pl-10 pr-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white transition-all outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c352a] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#71816d]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="block w-full pl-10 pr-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white transition-all outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 mt-4 rounded-xl text-sm font-extrabold text-white bg-[#71816d] hover:bg-[#5b6a57] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#71816d] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#dfcdb1] text-center">
            <p className="text-xs text-[#5a6857]">
              Don't have an account?{' '}
              <Link to="/register" className="font-extrabold text-[#71816d] hover:text-[#5b6a57] hover:underline transition-colors ml-1">
                New Registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
