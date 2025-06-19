import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/api';
import {
  Home,
  Building2,
  Users,
  Car,
  UserCheck,
  UserCircle,
  MapPin,
  Calendar,
  CalendarCheck,
  DollarSign,
  Bell,
  Search,
  Menu,
  X,
  Settings,
  Key,
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

const ModernLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? saved === 'true' : false;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Inicializar modo escuro a partir do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Aplicar classe dark ao alterar
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Persistir estado do sidebar
  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen);
  }, [sidebarOpen]);

  // Carregar contagem de notificações não lidas
  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await notificationService.unreadCount();
        const count = res.data?.count ?? res.count ?? 0;
        setUnreadCount(count);
      } catch (err) {
        console.error(err);
      }
    };
    loadCount();
    const handler = () => loadCount();
    window.addEventListener('notifications:update', handler);
    return () => window.removeEventListener('notifications:update', handler);
  }, []);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      color: 'from-blue-500 to-blue-600',
      badge: '1'
    },
    { 
      id: 'companies', 
      label: 'Empresas', 
      icon: Building2, 
      path: '/companies',
      color: 'from-purple-500 to-purple-600',
      masterOnly: true,
      badge: '2'
    },
    { 
      id: 'sales', 
      label: 'Vendas', 
      icon: CalendarCheck, 
      path: '/sales',
      color: 'from-emerald-500 to-emerald-600',
      badge: '9'
    },
    { 
      id: 'users', 
      label: 'Usuários', 
      icon: Users, 
      path: '/users',
      color: 'from-orange-500 to-orange-600',
      badge: '3'
    },
    { 
      id: 'vehicles', 
      label: 'Veículos', 
      icon: Car, 
      path: '/vehicles',
      color: 'from-green-500 to-green-600',
      badge: '4'
    },
    { 
      id: 'drivers', 
      label: 'Motoristas', 
      icon: UserCheck, 
      path: '/drivers',
      color: 'from-teal-500 to-teal-600',
      badge: '5'
    },
    { 
      id: 'customers', 
      label: 'Clientes', 
      icon: UserCircle, 
      path: '/customers',
      color: 'from-pink-500 to-pink-600',
      badge: '6'
    },
    { 
      id: 'trips', 
      label: 'Passeios', 
      icon: MapPin, 
      path: '/trips',
      color: 'from-emerald-500 to-emerald-600',
      badge: '7'
    },    
    { 
      id: 'bookings',
      label: 'Reservas', 
      icon: Calendar, 
      path: '/bookings',
      color: 'from-red-500 to-red-600',
      badge: '10'
    }
  ];

  const configItems = [
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
      color: 'from-gray-500 to-gray-600',
      badge: '12'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.masterOnly || user?.role === 'master'
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getPageTitle = () => {
    const currentItem = [...filteredMenuItems, ...configItems].find(item => isActive(item.path));
    return currentItem?.label || 'Dashboard';
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return names[0].charAt(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out border-r border-gray-200`}>
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-zapchat-primary to-zapchat-medium">
          <h1 className="text-xl font-bold text-white">ZapChat Tur</h1>
        </div>

        {/* User Info Card */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-zapchat-primary to-zapchat-medium rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                  active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  active 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-r ${item.color} text-white opacity-80 group-hover:opacity-100`
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {active && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}

          {/* Separator */}
          <div className="py-4">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Configuration Items */}
          {configItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                  active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  active 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-r ${item.color} text-white opacity-80 group-hover:opacity-100`
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {active && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-red-100">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="hidden lg:block">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h2>
                <p className="text-sm text-gray-600">
                  Bem-vindo de volta, {user?.name}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar empresas, usuários, etc..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-zapchat-primary to-zapchat-medium rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserCircle className="w-4 h-4 mr-3" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/change-password');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Key className="w-4 h-4 mr-3" />
                      Alterar Senha
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configurações
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ModernLayout;

