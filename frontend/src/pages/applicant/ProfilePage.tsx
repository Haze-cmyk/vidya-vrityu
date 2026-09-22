import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Check,
  X,
  Copy,
  Landmark,
  Camera,
  Upload,
  Trash2,
  Loader2,
  Sparkles,
  Calendar,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Directly Editable Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Odisha');
  const [tribe, setTribe] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setState(user.state || 'Odisha');
      setTribe(user.tribe || '');
      setDob(user.dob || '');
      setGender(user.gender || 'Female');
      setPermanentAddress(user.permanentAddress || user.officeAddress || '');
      setDistrict(user.district || '');
      setPincode(user.pincode || '');
    }
  }, [user]);

  const isModified =
    (name.trim() !== (user?.name || '').trim()) ||
    (email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()) ||
    (phone.trim() !== (user?.phone || '').trim()) ||
    (state.trim() !== (user?.state || 'Odisha').trim()) ||
    (tribe.trim() !== (user?.tribe || '').trim()) ||
    (dob !== (user?.dob || '')) ||
    (gender !== (user?.gender || 'Female')) ||
    (permanentAddress.trim() !== (user?.permanentAddress || user?.officeAddress || '').trim()) ||
    (district.trim() !== (user?.district || '').trim()) ||
    (pincode.trim() !== (user?.pincode || '').trim());

  const handleCopyId = () => {
    if (user?.loginId) {
      navigator.clipboard.writeText(user.loginId);
      toast.success('Login ID copied to clipboard!');
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = async () => {
        try {
          setUploadingPhoto(true);
          const canvas = document.createElement('canvas');
          const maxDim = 512;
          let { width, height } = img;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          await updateProfile({ avatar: compressedDataUrl });
          toast.success('Profile photo updated successfully!');
        } catch (err: any) {
          toast.error(err.message || 'Failed to update profile photo');
        } finally {
          setUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = uploadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      await updateProfile({ avatar: '' });
      toast.info('Profile photo removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name cannot be empty');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (phone && phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        state: state.trim(),
        tribe: tribe.trim(),
        dob,
        gender: gender as any,
        permanentAddress: permanentAddress.trim(),
        district: district.trim(),
        pincode: pincode.trim()
      });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setState(user.state || 'Odisha');
      setTribe(user.tribe || '');
      setDob(user.dob || '');
      setGender(user.gender || 'Female');
      setPermanentAddress(user.permanentAddress || user.officeAddress || '');
      setDistrict(user.district || '');
      setPincode(user.pincode || '');
    }
    toast.info('Changes reverted to saved profile');
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 font-sans">
      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-[#c9b79c] shadow-lg shadow-slate-200/40 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Background Accent Gradient */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#f1e0c5]/80 to-transparent pointer-events-none" />

        {/* Top Right Status Badge */}
        <div className="self-end z-10 mb-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile Editable</span>
          </span>
        </div>

        {/* Centered Large Vertical Avatar with Upload Controls */}
        <div className="flex flex-col items-center mb-4 z-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 text-white font-serif font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl ring-4 ring-white border-2 border-[#c9b79c] overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(name || user?.name)
              )}
            </div>

            {/* Camera / Upload Action Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              aria-label="Upload Profile Photo"
              title="Upload new profile photo"
              className="absolute bottom-0 right-0 p-2 sm:p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg border-2 border-white transition-all transform hover:scale-110 cursor-pointer disabled:opacity-75"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-400" />
              ) : (
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              )}
            </button>
          </div>

          {/* Quick Photo Upload & Remove Buttons */}
          <div className="mt-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3 h-3 text-slate-500" />
              <span>{user?.avatar ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            {user?.avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shadow-xs"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* User Name & Role Header */}
        <div className="space-y-1.5 z-10 w-full mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {name || user?.name || 'User Profile'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {user?.role === 'applicant'
              ? 'ST Student Applicant | Ministry of Tribal Affairs'
              : user?.role === 'institute'
              ? 'Institute Nodal Officer | Educational Institution'
              : user?.role === 'officer'
              ? 'State Verification Officer | Tribal Welfare'
              : user?.role === 'committee'
              ? 'Selection Board Committee Member | MoTA'
              : 'Ministry Administrator | MoTA'}
          </p>

          {/* Login ID Chip */}
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center space-x-1.5 bg-[#fdfbf7] border border-[#c9b79c] px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-800 hover:bg-[#f1e0c5] transition-colors cursor-pointer shadow-xs"
              title="Click to copy Login ID"
            >
              <span>ID: {user?.loginId || user?.id || 'VV-2026-DEMO'}</span>
              <Copy className="w-3 h-3 text-slate-400" />
            </button>
            <span className="bg-slate-100 text-slate-800 border border-[#dfcdb1] px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user?.role === 'applicant' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              {user?.role === 'applicant'
                ? 'Verified ST Student'
                : user?.role === 'institute'
                ? 'Authorized Nodal Institution'
                : user?.role === 'officer'
                ? 'State Verification Officer'
                : user?.role === 'committee'
                ? 'Selection Committee Member'
                : 'MoTA Ministry Administrator'}
            </span>
          </div>
        </div>

        {/* Compact 1-Line Government Credentials Bar */}
        {user?.role === 'applicant' && (
          <div className="w-full mb-6 bg-[#fdfbf7] border border-[#dfcdb1] rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 shadow-xs">
            {/* 1. Aadhaar Card */}
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 min-w-0 px-2 py-1">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-slate-900 truncate">Aadhaar Card</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-xs">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {user?.aadhaar || 'XXXX-XXXX-4921'}
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-7 bg-[#dfcdb1] shrink-0" />

            {/* 2. Caste Certificate */}
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 min-w-0 px-2 py-1">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-slate-900 truncate">Caste Cert</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-xs">
                    Validated
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  ST: {tribe || user?.tribe || 'Gond'}
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-7 bg-[#dfcdb1] shrink-0" />

            {/* 3. DBT Status */}
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 min-w-0 px-2 py-1">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-slate-900 truncate">DBT Status</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-xs">
                    Linked
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  PFMS Ready
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 100% DIRECTLY EDITABLE PROFILE FORM */}
        <form onSubmit={handleSave} className="w-full space-y-4 text-left border-t border-[#dfcdb1] pt-6 z-10">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-[#dfcdb1]">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
              Directly Editable Profile Information
            </span>
            {isModified ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full animate-pulse">
                ● Unsaved Changes
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✓ Up to date
              </span>
            )}
          </div>

          {/* 1. Full Name */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center">
                <UserIcon className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                Full Name *
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-semibold border border-emerald-200">
                Directly Editable
              </span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] transition-all outline-hidden shadow-xs hover:border-slate-400"
            />
          </div>

          {/* 2. Email Address */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                Email Address *
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-semibold border border-emerald-200">
                Directly Editable
              </span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-2.5 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] transition-all outline-hidden shadow-xs hover:border-slate-400"
            />
          </div>

          {/* 3. Mobile / Phone Number */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                Mobile / Phone Number *
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-semibold border border-emerald-200">
                Directly Editable
              </span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-slate-600 font-bold pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneInput}
                placeholder="10 digit mobile number"
                maxLength={10}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] transition-all outline-hidden shadow-xs hover:border-slate-400"
              />
            </div>
          </div>

          {/* 4. State of Domicile */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                State of Domicile *
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-semibold border border-emerald-200">
                Directly Editable
              </span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] transition-all outline-hidden shadow-xs cursor-pointer hover:border-slate-400"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Extra Student Applicant Details (ST Community, DOB, Gender, Address) */}
          {user?.role === 'applicant' && (
            <div className="pt-2 space-y-4 border-t border-[#dfcdb1]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ST Community / Tribe */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                    ST Tribe / Community
                  </label>
                  <input
                    type="text"
                    value={tribe}
                    onChange={(e) => setTribe(e.target.value)}
                    placeholder="e.g. Gond, Santhal, Bhil"
                    className="w-full px-4 py-2 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] outline-hidden shadow-xs"
                  />
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] outline-hidden shadow-xs"
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] outline-hidden shadow-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* District */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Mayurbhanj, Bastar"
                    className="w-full px-4 py-2 bg-white border border-[#c9b79c] rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#71816d] outline-hidden shadow-xs"
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center">
                  <Home className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                  Permanent Residential Address
                </label>
                <textarea
                  rows={2}
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Enter your permanent residential address"
                  className="w-full px-4 py-2 bg-white border border-[#c9b79c] rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#71816d] outline-hidden shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Action Save & Reset Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:flex-1 py-3 px-6 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 ${
                isModified
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                  : 'bg-[#71816d] hover:bg-[#5a6857] text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Profile Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isModified ? 'Save Profile Changes' : 'Save Changes'}</span>
                </>
              )}
            </button>

            {isModified && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-300"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
