import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dashboardService } from '../../services/api';
import {
  Building2,
  Users,
  Car,
  UserCheck,
  UserCircle,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const Dashboard = () => {
  const { user, isMaster } = useAuth();
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    vehicles: 0,
    drivers: 0,
    customers: 0,
    trips: 0,
    bookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

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
  }, [isMaster, showError]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                typeof value === 'number' && title.includes('Receita') 
                  ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : value.toLocaleString('pt-BR')
              )}
            </p>
            {trend && (
              <p className={`ml-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo das atividades do sistema
        </p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isMaster() && (
          <StatCard
            title="Empresas"
            value={stats.companies}
            icon={Building2}
            color="bg-[#99CD85]"
            trend={8.2}
          />
        )}
        <StatCard
          title="Usuários"
          value={stats.users}
          icon={Users}
          color="bg-[#7FA653]"
          trend={12.5}
        />
        <StatCard
          title="Veículos"
          value={stats.vehicles}
          icon={Car}
          color="bg-[#63783D]"
          trend={-2.1}
        />
        <StatCard
          title="Motoristas"
          value={stats.drivers}
          icon={UserCheck}
          color="bg-[#1C2B20]"
          trend={5.8}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Clientes"
          value={stats.customers}
          icon={UserCircle}
          color="bg-[#99CD85]"
          trend={15.3}
        />
        <StatCard
          title="Passeios"
          value={stats.trips}
          icon={MapPin}
          color="bg-[#7FA653]"
          trend={7.9}
        />
        <StatCard
          title="Reservas"
          value={stats.bookings}
          icon={Calendar}
          color="bg-[#63783D]"
          trend={22.1}
        />
      </div>

      {/* Receita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Receita Total"
          value={stats.revenue}
          icon={TrendingUp}
          color="bg-green-600"
          trend={18.7}
        />
        
        {/* Alertas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  3 CNHs vencendo em 30 dias
                </p>
                <p className="text-xs text-yellow-600">
                  Verifique os motoristas
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  2 veículos em manutenção
                </p>
                <p className="text-xs text-red-600">
                  Capacidade reduzida
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Sistema funcionando normalmente
                </p>
                <p className="text-xs text-green-600">
                  Todos os serviços online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Novo Passeio"
            description="Criar um novo roteiro"
            icon={MapPin}
            color="bg-[#99CD85]"
            onClick={() => window.location.href = '/trips/new'}
          />
          <QuickAction
            title="Nova Reserva"
            description="Registrar nova reserva"
            icon={Calendar}
            color="bg-[#7FA653]"
            onClick={() => window.location.href = '/bookings/new'}
          />
          <QuickAction
            title="Novo Cliente"
            description="Cadastrar cliente"
            icon={UserCircle}
            color="bg-[#63783D]"
            onClick={() => window.location.href = '/customers/new'}
          />
        </div>
      </div>

      {/* Atividades recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#99CD85] rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Nova reserva criada para "Passeio Serra da Mantiqueira"
                    </p>
                    <p className="text-xs text-gray-500">Há 2 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#7FA653] rounded-full flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Cliente "Maria Silva" foi cadastrado
                    </p>
                    <p className="text-xs text-gray-500">Há 15 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#63783D] rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Veículo "ABC-1234" retornou da manutenção
                    </p>
                    <p className="text-xs text-gray-500">Há 1 hora</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

