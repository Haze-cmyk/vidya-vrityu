import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const generateCaptcha = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRefreshCaptcha = () => {
    setCaptchaText(generateCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (captchaInput !== captchaText) {
      toast.error('Invalid Captcha code! Please try again.');
      handleRefreshCaptcha();
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      toast.error('Passwords do not match! Please check your password.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register({ 
        name: data.fullName as string, 
        email: data.email as string, 
        role: data.role as any,
        phone: data.mobile as string,
        altPhone: (data.altMobile as string) || '',
        state: data.state as string,
        designation: (data.designation as string) || '',
        officeAddress: (data.address as string) || '',
        landline: (data.landline as string) || '',
        password: (data.password as string) || ''
      });
      toast.success(`Registered Successfully! Your Login ID is ${newUser.loginId || newUser.id}`, { duration: 10000 });
      
      if (data.role === 'student' || data.role === 'applicant') {
        navigate('/app');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
  };

  return (
    <div className="min-h-screen bg-[#f1e0c5] flex justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-6 sm:p-10 md:p-12 border border-[#c9b79c]">
        
        {/* Header Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#5b6a57] to-[#71816d] rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 border border-[#c9b79c]">
            <span className="font-serif font-extrabold text-2xl text-amber-200 tracking-wider">ST</span>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#e8d6ba] text-[#5b6a57] border border-[#dfcdb1] mb-2 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
            Ministry of Tribal Affairs • DBT Portal
          </span>

          <h2 className="text-3xl font-extrabold text-[#2c352a] tracking-tight">Create an account</h2>
          <p className="mt-1 text-sm text-[#5a6857] font-medium">Join the Vidya-Vrtti Vidya-Vrtti Scholarship Platform</p>

          {/* Already have an account banner */}
          <div className="mt-3 inline-flex items-center text-xs text-[#5a6857] bg-[#fbf8f3] px-4 py-1.5 rounded-full border border-[#dfcdb1]">
            <span>Already have an account?</span>
            <Link to="/login" className="font-extrabold text-[#71816d] hover:text-[#5b6a57] hover:underline ml-1.5 flex items-center">
              <span>Sign in</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          
          {/* User Type */}
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              User Type <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <select
                name="role"
                required
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              >
                <option value="">-- Select Role --</option>
                <option value="applicant">Student (Applicant)</option>
                <option value="institute">Institute Nodal Officer</option>
                <option value="officer">State Nodal Officer</option>
                <option value="admin">MoTA Administrator</option>
              </select>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Full Name <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <input
                type="text"
                name="fullName"
                required
                placeholder="Enter full name"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* State Name */}
          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              State Name <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <select
                name="state"
                required
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              >
                <option value="">-- Select State --</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Designation */}
          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Designation <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <select
                name="designation"
                required
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              >
                <option value="">-- Select Designation --</option>
                <option value="student">Student</option>
                <option value="clerk_principal">Clerk/Principal</option>
                <option value="nodal_officer">Nodal Officer</option>
                <option value="mota_admin">MoTA Administration</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
            {/* Mobile Number */}
            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Mobile Number <span className="text-amber-700">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                required
                onInput={handleDigitInput}
                placeholder="10 digit mobile"
                maxLength={10}
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>

            {/* Alternate Mobile */}
            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Alternate Mobile <span className="text-slate-400 ml-1 text-[11px] font-normal lowercase">(optional)</span>
              </label>
              <input
                type="tel"
                name="altMobile"
                onInput={handleDigitInput}
                placeholder="10 digit mobile"
                maxLength={10}
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Email ID */}
          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Email Address <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Password */}
            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Password <span className="text-amber-700">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Create password"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>

            {/* Retype Password */}
            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Confirm Password <span className="text-amber-700">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Office Address */}
          <div className="flex flex-col md:flex-row md:items-start pt-4 border-t border-[#dfcdb1]">
            <label className="md:w-1/3 mt-2 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Office Address <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <textarea
                name="address"
                required
                placeholder="Enter complete office/residential address"
                rows={3}
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 resize-y font-medium"
              />
            </div>
          </div>

          {/* Office Landline */}
          <div className="flex flex-col md:flex-row md:items-center pt-2">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Office Landline <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <input
                type="text"
                name="landline"
                required
                onInput={handleDigitInput}
                placeholder="STD Code + Number"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Captcha Section */}
          <div className="flex flex-col md:flex-row md:items-center pt-5 border-t border-[#dfcdb1]">
            <div className="md:w-1/2 flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-[#f1e0c5] border border-[#c9b79c] rounded-xl px-6 py-2.5 shadow-inner min-w-[140px] text-center">
                <span className="font-serif text-3xl font-extrabold tracking-[0.3em] text-[#2c352a] italic select-none">
                  {captchaText}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="p-2.5 rounded-full text-[#71816d] hover:text-[#2c352a] hover:bg-[#e8d6ba] transition-colors border border-[#c9b79c]"
                title="Refresh Captcha"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="md:w-1/2">
              <input
                type="text"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter captcha code"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-bold tracking-widest uppercase"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#dfcdb1] mt-6">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-bold text-slate-700 hover:bg-[#f1e0c5] border border-[#c9b79c] transition-colors text-center w-full sm:w-auto"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-[#71816d] hover:bg-[#5b6a57] text-white font-extrabold text-center w-full sm:w-auto shadow-md transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#71816d] disabled:opacity-70 flex justify-center items-center cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Bottom Prominent Sign-in Link */}
          <div className="text-center pt-5 border-t border-[#dfcdb1] mt-4">
            <p className="text-xs text-[#5a6857]">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-[#71816d] hover:text-[#5b6a57] hover:underline ml-1">
                Sign in to your account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
