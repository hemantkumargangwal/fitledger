import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  CreditCard, 
  Menu, 
  X, 
  LogOut,
  TrendingUp,
  Dumbbell,
  Settings,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Overview and analytics'
    },
    { 
      name: 'Members', 
      href: '/members', 
      icon: Users,
      description: 'Manage gym members'
    },
    { 
      name: 'Payments', 
      href: '/payments', 
      icon: CreditCard,
      description: 'Track revenue and payments'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 lg:hidden transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="sidebar h-full flex flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FitLedger</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-ghost p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${
                    isActive(item.href) 
                      ? 'sidebar-item-active' 
                      : 'sidebar-item-inactive'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {isActive(item.href) && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.gymName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-item-inactive w-full justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72">
        <div className="sidebar h-full flex flex-col">
          {/* Desktop header */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FitLedger</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item group ${
                    isActive(item.href) 
                      ? 'sidebar-item-active' 
                      : 'sidebar-item-inactive'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </div>
                  </div>
                  {isActive(item.href) && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse-soft"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.gymName}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-soft-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      // Navigate to settings if exists
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      // Navigate to help if exists
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost p-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">FitLedger</span>
            </div>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
