import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  UserCheck,
  FileSearch,
  Award,
  Sliders,
  MessageSquare,
  BarChart3,
  History,
  HelpCircle,
  LogIn,
  Lock,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const isApplicant = role === 'applicant';

  const applicantLinks: NavItem[] = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/app/schemes', label: 'Browse Schemes', icon: BookOpen },
    { to: '/app/applications', label: 'My Applications', icon: FileText },
    { to: '/app/help', label: 'Help & FAQs', icon: HelpCircle }
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/applications', label: 'All Applications', icon: FileText },
    { to: '/admin/verification', label: 'Verification Queue', icon: UserCheck, badge: 'AI-OCR' },
    { to: '/admin/scrutiny', label: 'Scrutiny Workflow', icon: FileSearch },
    { to: '/admin/selection', label: 'Merit List Engine', icon: Award },
    { to: '/admin/schemes/configure', label: 'Create New Scheme', icon: Sliders },
    { to: '/admin/communications', label: 'Communications', icon: MessageSquare },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/audit', label: 'System Audit Log', icon: History },
    { to: '/admin/help', label: 'Help & FAQs', icon: HelpCircle }
  ];

  const instituteLinks: NavItem[] = [
    { to: '/admin', label: 'Institute Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/applications', label: 'Student Applications', icon: FileText },
    { to: '/admin/verification', label: 'Institute Level Verification', icon: UserCheck, badge: 'AI-OCR' },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/help', label: 'Help & FAQs', icon: HelpCircle }
  ];

  const guestLinks: NavItem[] = [
    { to: '/login', label: 'Sign In', icon: LogIn },
    { to: '/app/schemes', label: 'Browse Schemes', icon: BookOpen },
    { to: '/login', label: 'Dashboard', icon: LayoutDashboard, badge: 'Login' },
    { to: '/help', label: 'Help & FAQs', icon: HelpCircle }
  ];

  const links = !user ? guestLinks : (isApplicant ? applicantLinks : (role === 'institute' ? instituteLinks : adminLinks));

  const handleNavClick = (e: React.MouseEvent, to: string) => {
    if (!user && (to === '/app' || to === '/admin' || to.includes('applications') || to.includes('verification') || to.includes('profile') || to.includes('scrutiny') || to.includes('selection'))) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: to } } });
    }
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#c9b79c] min-h-[calc(100vh-4rem)] p-4 flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2.5 mb-4 bg-[#f1e0c5] rounded-lg border border-[#dfcdb1]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {user ? (isApplicant ? 'ST Student Workspace' : (role === 'institute' ? 'Institute Workspace' : 'MoTA Administration Hub')) : 'Guest Workspace'}
            </p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {user ? (isApplicant ? 'Scholarship Portal' : (role === 'institute' ? 'Institute Nodal Portal' : 'Unified Officers Portal')) : 'Scholarship Portal'}
            </p>
            {!user && (
              <div className="mt-2.5 pt-2 border-t border-[#dfcdb1]">
                <p className="text-[10px] text-slate-600 mb-1.5 leading-tight">
                  Sign in to access your personal application status & dashboard.
                </p>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 bg-[#71816d] hover:bg-[#5a6857] text-white text-xs font-bold rounded-md shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to + link.label}
                  to={link.to}
                  end={link.exact}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive && user
                        ? 'bg-[#71816d] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-[#e8d6ba] hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs uppercase">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
          <p className="font-bold flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
            Direct Benefit Transfer (DBT)
          </p>
          <p className="text-[10px] text-amber-700 mt-1 leading-snug">
            Integrated with Aadhaar PFMS Payment Gateway for direct student disbursement.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar - Fixed & Always on Top */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#c9b79c] shadow-2xl z-50 px-2 py-2 flex items-center justify-around">
        {(!user ? [
          { to: '/login', label: 'Sign In', icon: LogIn },
          { to: '/app/schemes', label: 'Browse Schemes', icon: BookOpen },
          { to: '/login', label: 'Dashboard', icon: LayoutDashboard, badge: 'Login' },
          { to: '/help', label: 'Help & FAQs', icon: HelpCircle }
        ] : links.slice(0, 5)).map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              end={link.exact}
              onClick={(e) => {
                if (!user && (link.to === '/app' || link.to === '/admin' || link.label === 'Dashboard')) {
                  e.preventDefault();
                  navigate('/login', { state: { from: { pathname: '/app' } } });
                }
              }}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  isActive && user
                    ? 'text-[#71816d] bg-[#f1e0c5]/70 scale-105 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {link.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-orange-500 text-white text-[8px] font-black rounded-xs">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-center whitespace-nowrap leading-tight">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
