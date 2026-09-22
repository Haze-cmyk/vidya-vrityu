import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Menu,
  X,
  BookOpen,
  FileText,
  HelpCircle,
  LogIn
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, logout, notifications, unreadCount, markNotificationAsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleRoleSwitch = (newRole: Role) => {
    switchRole(newRole);
    setShowRoleDropdown(false);
    if (newRole === 'applicant') {
      navigate('/app');
    } else {
      navigate('/admin');
    }
  };

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case 'applicant':
        return 'ST Applicant';
      case 'officer':
        return 'Verification Officer';
      case 'committee':
        return 'Selection Committee';
      case 'admin':
        return 'MoTA Administrator';
      default:
        return r;
    }
  };

  const getRoleBadgeColor = (r: Role) => {
    switch (r) {
      case 'applicant':
        return 'bg-amber-500/20 text-amber-200 border-amber-400/40';
      case 'officer':
        return 'bg-teal-500/20 text-teal-200 border-teal-400/40';
      case 'committee':
        return 'bg-purple-500/20 text-purple-200 border-purple-400/40';
      case 'admin':
        return 'bg-rose-500/20 text-rose-200 border-rose-400/40';
    }
  };

  return (
    <header className="bg-[#71816d] text-white sticky top-0 z-50 shadow-md border-b border-navy-700">
      {/* Top Govt Bar */}
      <div className="bg-[#5a6857] px-3 sm:px-4 py-1.5 sm:py-1 text-[11px] sm:text-xs font-medium text-slate-300 flex flex-col sm:flex-row items-center justify-between border-b border-navy-800 gap-1 sm:gap-0 text-center sm:text-left">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap justify-center sm:justify-start">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5 shrink-0"></span>
            Government of India | MoTA
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-amber-300 font-semibold">Direct Benefit Transfer (DBT)</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] sm:text-xs">
          <Link to="/help" className="hover:text-amber-300 transition-colors">
            Help & Guidelines
          </Link>
          <span>|</span>
          <span className="text-slate-300">SIH 2026</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center font-black text-lg sm:text-xl text-navy-950 shadow-inner group-hover:scale-105 transition-transform shrink-0">
              VV
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-serif font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Vidya-Vrtti
                </span>
                <span className="bg-orange-500 text-navy-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
                  AI-Unified
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-300 font-medium tracking-wide">
                Scholarship & Fellowship Tribal Education System
              </p>
            </div>
          </Link>
        </div>

        {/* Center removed */}
        <div className="hidden lg:flex flex-1"></div>

        {/* Right: Notifications, Profile & Mobile Menu Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notifications Dropdown */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#c9b79c] py-2 text-slate-800 z-50">
                <div className="px-4 py-2 border-b border-[#dfcdb1] flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Notifications ({notifications.length})</span>
                  <span className="text-xs text-orange-600 font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`p-3 hover:bg-[#f1e0c5] cursor-pointer transition-colors ${
                          !n.read ? 'bg-amber-50/60' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2.5">
                          {n.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-xs font-bold text-slate-900">{n.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {user ? (
            <div
              ref={profileMenuRef}
              className="relative py-1"
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <button
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 rounded-lg hover:bg-[#5a6857] transition-colors cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-navy-950 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full pt-1 w-60 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-[#c9b79c] py-2 text-slate-800">
                    <div className="px-4 py-2.5 border-b border-[#dfcdb1] flex items-center space-x-2.5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#c9b79c] shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#f1e0c5] text-slate-800 font-bold flex items-center justify-center text-sm shrink-0 border border-[#c9b79c]">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to={role === 'applicant' ? '/app' : '/admin'}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-[#f1e0c5] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/app/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-[#f1e0c5] transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-amber-600" />
                        <span>My Profile</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-xs">
                        View
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        navigate('/login');
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors shadow-xs shrink-0"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#5a6857] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#4e5a4b] border-t border-navy-700 shadow-xl px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* If user logged in, show user info card */}
          {user && (
            <div className="p-3 bg-[#5a6857] rounded-xl border border-navy-600 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 font-bold flex items-center justify-center text-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-amber-300 truncate font-mono">ID: {user.loginId || user.id}</p>
                </div>
              </div>
              <Link
                to={role === 'applicant' ? '/app' : '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 text-[11px] font-bold rounded-lg transition-colors shrink-0"
              >
                Portal
              </Link>
            </div>
          )}

          {/* Quick Portal Navigation Links if user is logged in */}
          {user && (
            <div className="space-y-1 pt-1 border-b border-[#62715e] pb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-1 mb-1">
                Portal Workspace
              </p>
              <Link
                to={role === 'applicant' ? '/app' : '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                <span>Dashboard</span>
              </Link>
              {role === 'applicant' ? (
                <>
                  <Link
                    to="/app/schemes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>Browse Schemes</span>
                  </Link>
                  <Link
                    to="/app/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span>My Applications</span>
                  </Link>
                  <Link
                    to="/app/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-300" />
                    <span>My Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span>Applications List</span>
                  </Link>
                  <Link
                    to="/admin/verification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-300" />
                    <span>Verification Queue</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Main Public / Secondary Nav Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-1 mb-1">
              General Navigation
            </p>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/introduction"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
            >
              About the Scheme (Introduction)
            </Link>
            <Link
              to="/guidelines"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
            >
              Guidelines & Amendments
            </Link>
            <a
              href="https://dashboard.tribal.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
            >
              Tribal Performance Dashboard ↗
            </a>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#5a6857] hover:text-white transition-colors"
            >
              Help & FAQs
            </Link>
          </div>

          {/* Actions: Register / Login / Logout */}
          <div className="pt-2 border-t border-[#62715e] flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs transition-colors"
                >
                  New Registration
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-[#5a6857] hover:bg-[#6c7c69] text-white font-bold text-xs transition-colors border border-navy-600"
                >
                  Login to Portal
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition-colors border border-rose-800/60 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Secondary Navigation Bar */}
      <div className="bg-[#4e5a4b] border-t border-navy-700 hidden lg:block overflow-visible relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-200 py-2">
            <li><Link to="/" className="hover:text-amber-300 transition-colors">Home</Link></li>
            <li className="relative group">
              <button className="hover:text-amber-300 flex items-center transition-colors pb-2 -mb-2">
                About the Scheme <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>
              <div className="absolute left-0 top-full mt-0 w-80 bg-white text-slate-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <ul className="py-1 border border-[#c9b79c] rounded">
                  <li><Link to="/introduction" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">Introduction</Link></li>
                  <li><Link to="/guidelines" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">Guidelines & Amendments</Link></li>
                  <li><Link to="#" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">Circulars / Orders / Notifications</Link></li>
                  <li><a href="/docs/Post_Matric.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">Post-Matric Scholarship Scheme For ST Students</a></li>
                  <li><a href="/docs/Pre_Matric.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">Pre-Matric Scholarship Scheme For ST Student</a></li>
                  <li><a href="/docs/Fellowship_and_Top_Class.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">Top Class Education For ST Students</a></li>
                  <li><a href="/docs/Fellowship_and_Top_Class.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors border-b border-[#dfcdb1]">National Fellowship for ST Students</a></li>
                  <li><a href="/docs/National_Overseas.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f1e0c5] hover:text-amber-600 transition-colors">National Overseas Scholarship Scheme</a></li>
                </ul>
              </div>
            </li>
            <li><a href="https://dashboard.tribal.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">Tribal Performance Dashboard</a></li>
            <li><Link to="/contact" className="hover:text-amber-300 transition-colors">Contact Us</Link></li>

            {!user ? (
              <>
                <li>
                  <Link to="/register" className="hover:text-amber-300 transition-colors">
                    New Registration
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-amber-300 transition-colors">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to={role === 'applicant' ? '/app' : '/admin'}
                  className="text-amber-300 hover:text-amber-200 font-bold transition-colors"
                >
                  Portal Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};
