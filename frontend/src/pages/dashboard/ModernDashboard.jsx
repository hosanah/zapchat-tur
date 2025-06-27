import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dashboardService, saleService, activityService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  Building2,
  Users,
  Car,
  UserCheck,
  UserCircle,
  MapPin,
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

const ModernDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    vehicles: 0,
    drivers: 0,
    customers: 0,
    trips: 0,
    bookings: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [salesEvents, setSalesEvents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getStats();
        setStats(response.data.stats);
      } catch (err) {
        console.error(err);
        showError('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, showError]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await activityService.getRecent({ limit: 5 });
        setRecentActivities(response.data.activities || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadActivities();
  }, []);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const start = new Date();
        start.setDate(1);
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        const params = {
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
          limit: 50,
        };
        const res = await saleService.list(params);
        const events = res.data.sales
          .filter((s) => s.delivery_date)
          .map((s) => ({
            id: s.id,
            title: s.trip ? s.trip.title : s.sale_number,
            start: s.delivery_date,
            color: s.trip?.color,
            extendedProps: {
              customerName: `${s.customer?.first_name || ''} ${
                s.customer?.last_name || ''
              }`.trim(),
              saleNumber: s.sale_number,
            },
          }))
          .sort((a, b) => new Date(a.start) - new Date(b.start));
        setSalesEvents(events);
      } catch (err) {
        console.error(err);
      }
    };
    loadSales();
  }, []);

  const quickActions = [
    {
      title: 'Nova Empresa',
      icon: Plus,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/companies/new'),
      masterOnly: true
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => navigate('/reports')
    },
    {
      title: 'Configurações',
      icon: Settings,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/settings')
    },
    {
      title: 'Notificações',
      icon: Bell,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => navigate('/notifications')
    }
  ];

  const metricCards = [
    {
      title: user?.role === 'master' ? 'Total de Empresas' : 'Usuários Ativos',
      value: user?.role === 'master' ? stats.companies : stats.users,
      change: '+2 no último mês',
      icon: user?.role === 'master' ? Building2 : Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Veículos Ativos',
      value: stats.vehicles,
      change: '+3 este mês',
      icon: Car,
      color: 'text-zapchat-medium',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.revenue.toLocaleString()}`,
      change: '+15% do mês passado',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Alertas do Sistema',
      value: 3,
      change: '2 CNH vencendo',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const typeIcons = {
    vehicle: Car,
    booking: Calendar,
    customer: UserCircle,
  };

  const typeColors = {
    vehicle: 'text-green-600',
    booking: 'text-blue-600',
    customer: 'text-zapchat-medium',
  };

  const renderEventContent = (eventInfo) => {
    const { customerName, saleNumber } = eventInfo.event.extendedProps;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-1">
            {eventInfo.timeText && <b>{eventInfo.timeText} </b>}
            {eventInfo.event.title}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm font-medium">{customerName}</p>
          <p className="text-sm">Venda: {saleNumber}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minutos atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} horas atrás`;
    const days = Math.floor(hours / 24);
    return `${days} dias atrás`;
  };

  const filteredActions = quickActions.filter(action =>
    !action.masterOnly || user?.role === 'master'
  );

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-zapchat-primary to-zapchat-medium rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-zapchat-light">
          Aqui está um resumo da sua plataforma e todas as atividades.
        </p>
      </div>

      {/* Próximos Passeios */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Passeios</h3>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={salesEvents}
            eventContent={renderEventContent}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            height="auto"
          />
        </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-6 rounded-lg shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all duration-200`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">{action.title}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.change}</p>
                </div>
                <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
            <button className="text-zapchat-medium hover:text-zapchat-dark text-sm font-medium">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = typeIcons[activity.type] || Activity;
              const color = typeColors[activity.type] || 'text-gray-600';
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className={`${color} p-2 rounded-lg bg-gray-50`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Rápido</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Motoristas</span>
              <span className="text-sm font-semibold text-gray-900">{stats.drivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Clientes</span>
              <span className="text-sm font-semibold text-gray-900">{stats.customers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Passeios</span>
              <span className="text-sm font-semibold text-gray-900">{stats.trips}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reservas</span>
              <span className="text-sm font-semibold text-gray-900">{stats.bookings}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Taxa de Ocupação</span>
              <span className="text-sm font-semibold text-zapchat-medium">87%</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-zapchat-primary h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default ModernDashboard;

