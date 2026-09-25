import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Activity,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  FileText,
  Clock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => setNotifications(res.data.notifications || []))
        .catch(() => {});
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tests?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-tr from-navy-900 to-teal-600 p-2.5 rounded-xl shadow-md text-white">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-navy-900 via-teal-700 to-teal-600">
                  HealthBridge
                </span>
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest block -mt-1">
                  Diagnostics
                </span>
              </div>
            </Link>

            {/* Demo Environment Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Environment</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search tests, blood packages, or health checks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-full text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </form>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative focus:outline-none"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                          {notifications.length} recent
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className="p-3 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start space-x-2">
                                <Clock className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Badge */}
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-teal-400">
                  {user.role}
                </span>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 focus:outline-none transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-navy-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline-block font-medium text-sm text-slate-700">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Activity className="w-4 h-4 text-teal-600" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-teal-600" />
                        <span>My Profile & Consent</span>
                      </Link>
                      <Link
                        to="/reports"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>Diagnostic Reports</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 hover:to-slate-900 px-4 py-2 rounded-full shadow-md transition-all hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
