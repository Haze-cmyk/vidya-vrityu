import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, ShieldCheck, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const generateCaptcha = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'applicant' | 'institute' | 'officer' | 'admin'>('applicant');
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
        name: (data.fullName as string) || '', 
        email: (data.email as string) || '', 
        role: (data.role as any) || role || 'applicant',
        phone: (data.mobile as string) || '',
        altPhone: (data.altMobile as string) || '',
        state: (data.state as string) || '',
        district: (data.district as string) || '',
        pincode: (data.pincode as string) || '',
        officeAddress: (data.address as string) || '',
        permanentAddress: (data.address as string) || '',
        landline: (data.landline as string) || '',
        dob: (data.dob as string) || '',
        gender: (data.gender as string) || 'Female',
        tribe: (data.tribe as string) || '',
        aadhaar: (data.aadhaar as string) || '',
        fatherName: (data.fatherName as string) || '',
        password: (data.password as string) || ''
      });
      toast.success(`Registered Successfully! Your Login ID is ${newUser.loginId || newUser.id}`, { duration: 10000 });
      
      if (role === 'applicant') {
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
    <div className="min-h-screen bg-[#f1e0c5] flex justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-5 sm:p-10 md:p-12 border border-[#c9b79c]">
        
        {/* Header Area */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#5b6a57] to-[#71816d] rounded-2xl shadow-md flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-[#c9b79c]">
            <span className="font-serif font-extrabold text-xl sm:text-2xl text-amber-200 tracking-wider">ST</span>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#e8d6ba] text-[#5b6a57] border border-[#dfcdb1] mb-2 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
            Ministry of Tribal Affairs • DBT Portal
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2c352a] tracking-tight">Create an account</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5a6857] font-medium">Join the Vidya-Vrtti Scholarship Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-sm">
          
          {/* User Type */}
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              User Type <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                required
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              >
                <option value="applicant">Student (Applicant)</option>
                <option value="institute">Institute Nodal Officer</option>
                <option value="officer">State Nodal Officer</option>
                <option value="admin">MoTA Administrator</option>
              </select>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col md:flex-row md:items-center pt-1">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Full Legal Name <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <input
                type="text"
                name="fullName"
                required
                placeholder="Enter full name (as per official documents)"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              />
            </div>
          </div>

          {/* Student Specific Fields: Date of Birth and Gender */}
          {role === 'applicant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                  Date of Birth <span className="text-amber-700">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                  Gender <span className="text-amber-700">*</span>
                </label>
                <select
                  name="gender"
                  defaultValue="Female"
                  required
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Student Specific Fields: Tribe Community & Aadhaar */}
          {role === 'applicant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                  ST Tribe Community Name <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  name="tribe"
                  required
                  placeholder="e.g. Santhal, Gond, Bodo, Bhil, Munda"
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                  Aadhaar / Photo ID Reference <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  name="aadhaar"
                  required
                  placeholder="XXXX-XXXX-1234"
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* State Name */}
          <div className="flex flex-col md:flex-row md:items-center pt-1">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              State of Domicile <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <select
                name="state"
                required
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              >
                <option value="">-- Select State --</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* District & PIN Code for Applicants */}
          {role === 'applicant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                  District <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  placeholder="Enter district name"
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                  PIN Code <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  onInput={handleDigitInput}
                  placeholder="6 digit PIN code"
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* Mobile Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
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
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Alternate Mobile <span className="text-slate-400 ml-1 text-[11px] font-normal lowercase">(optional)</span>
              </label>
              <input
                type="tel"
                name="altMobile"
                onInput={handleDigitInput}
                placeholder="10 digit alternate mobile"
                maxLength={10}
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              />
            </div>
          </div>

          {/* Email ID */}
          <div className="flex flex-col md:flex-row md:items-center pt-1">
            <label className="md:w-1/3 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              Email Address <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Password <span className="text-amber-700">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Create password"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
                Confirm Password <span className="text-amber-700">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col md:flex-row md:items-start pt-3 border-t border-[#dfcdb1]">
            <label className="md:w-1/3 mt-2 mb-1.5 md:mb-0 font-bold text-xs uppercase tracking-wider text-[#2c352a]">
              {role === 'applicant' ? 'Permanent Residential Address' : 'Office Address'} <span className="text-amber-700">*</span>
            </label>
            <div className="md:w-2/3">
              <textarea
                name="address"
                required
                placeholder={role === 'applicant' ? 'Enter complete permanent home address' : 'Enter complete office address'}
                rows={3}
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 resize-y font-medium text-sm"
              />
            </div>
          </div>

          {/* Office Landline (Officers / Admins only) */}
          {role !== 'applicant' && (
            <div className="flex flex-col md:flex-row md:items-center pt-1">
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
                  className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* Captcha Section */}
          <div className="flex flex-col md:flex-row md:items-center pt-4 border-t border-[#dfcdb1]">
            <div className="md:w-1/2 flex items-center space-x-3 mb-3 md:mb-0">
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
                className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] focus:bg-white outline-hidden transition-all text-slate-900 font-bold tracking-widest uppercase text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#dfcdb1] mt-5">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-[#f1e0c5] border border-[#c9b79c] transition-colors text-center w-full sm:w-auto text-xs"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-center w-full sm:w-auto cursor-pointer disabled:opacity-50 text-xs"
            >
              <span>{loading ? 'Submitting Registration...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
