import React from 'react';
import { saleService } from '../../services/api';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  Users, 
  User, 
  DollarSign, 
  MapPin, 
  Car, 
  UserCheck, 
  Clock, 
  CheckCircle,
  AlertCircle,
  
} from 'lucide-react';
import './SaleDetailsDrawer.css';
import SalePaymentsTable from './SalePaymentsTable';
import SaleAccessoriesTable from './SaleAccessoriesTable';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value || 0
  );

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const calculateDaysLeft = (dateString) => {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    orcamento: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Orçamento' },
    pendente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendente' },
    confirmada: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmada' },
    paga: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paga' },
    cancelada: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelada' },
    reembolsada: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Reembolsada' }
  };
  
  const config = statusConfig[status] || statusConfig.pendente;
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.color}`}>
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    pendente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendente' },
    parcial: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Parcial' },
    pago: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Pago' },
    atrasado: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Atrasado' },
    cancelado: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelado' }
  };
  
  const config = statusConfig[status] || statusConfig.pendente;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.color}`}>
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    baixa: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Baixa' },
    media: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Média' },
    alta: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Alta' },
    urgente: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Urgente' }
  };
  
  const config = priorityConfig[priority] || priorityConfig.media;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.color}`}>
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ icon, label, value, valueClassName = "font-bold text-gray-800" }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
};

// Value Item Component
const ValueItem = ({ label, value, percentage, valueClassName = "font-medium" }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {percentage && <span className="text-xs text-gray-500">({percentage}%)</span>}
        <span className={valueClassName}>{value}</span>
      </div>
    </div>
  );
};

// Timeline Component
const Timeline = ({ children }) => {
  return (
    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
      {children}
    </div>
  );
};

// Timeline Item Component
const TimelineItem = ({ date, label, icon, status, daysLeft }) => {
  const statusColors = {
    completed: 'bg-green-500 border-green-500',
    pending: 'bg-yellow-500 border-yellow-500',
    upcoming: 'bg-blue-500 border-blue-500',
    overdue: 'bg-red-500 border-red-500'
  };
  
  return (
    <div className="relative">
      <div className={`absolute -left-[29px] w-5 h-5 rounded-full border-2 ${statusColors[status]}`}>
        {icon && <div className="absolute inset-0 flex items-center justify-center text-white">{React.cloneElement(icon, { className: 'w-3 h-3' })}</div>}
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{formatDate(date)}</p>
        {daysLeft !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            daysLeft < 0 ? 'bg-red-100 text-red-800' : 
            daysLeft < 3 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {daysLeft < 0 ? `${Math.abs(daysLeft)} dias atrasado` : 
             daysLeft === 0 ? 'Hoje' : 
             `Faltam ${daysLeft} dias`}
          </span>
        )}
      </div>
    </div>
  );
};

// Avatar Component
const Avatar = ({ name, className = "" }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${className}`}>
      {initials}
    </div>
  );
};

// Divider Component
const Divider = () => <div className="border-t border-gray-200 my-3"></div>;

// Expandable Text Component
const ExpandableText = ({ text, maxLength = 100 }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  if (text.length <= maxLength) return <p className="text-sm">{text}</p>;
  
  return (
    <div>
      <p className="text-sm">
        {expanded ? text : `${text.substring(0, maxLength)}...`}
      </p>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
      >
        {expanded ? 'Ver menos' : 'Ver mais'}
      </button>
    </div>
  );
};

// Simple Pie Chart Component (CSS-based)
const SimplePieChart = ({ paid, total }) => {
  const percentage = total > 0 ? (paid / total) * 100 : 0;
  
  return (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
      <div 
        className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent border-r-transparent"
        style={{ 
          transform: `rotate(${percentage * 3.6}deg)`,
          transition: 'transform 1s ease-out'
        }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xs text-gray-500">Pago</span>
        <span className="text-sm font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};


const SaleDetailsDrawer = ({ open, onOpenChange, sale, customers = [], refreshCustomers }) => {
  const [saleData, setSaleData] = React.useState(sale);

  React.useEffect(() => {
    setSaleData(sale);
  }, [sale]);

  const refreshSale = async () => {
    if (!sale) return;
    try {
      const res = await saleService.getById(sale.id);
      setSaleData(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const otherCustomers = customers.filter((c) => !c.is_responsible);

  const handleRemove = async (customerId) => {
    if (!sale) return;
    if (!window.confirm('Remover este cliente da venda?')) return;
    try {
      await saleService.removeCustomer(saleData.id, customerId);
      if (typeof refreshCustomers === 'function') {
        refreshCustomers();
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
    }
  };

  if (!sale) return null;
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-3x1 p-0 bg-white">
        {/* Header com gradiente e informações principais */}
        <DrawerHeader className="border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <DrawerTitle className="text-2xl font-bold text-gray-800">
                Detalhes da Venda
              </DrawerTitle>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={saleData?.status} />
            </div>
          </div>
        </DrawerHeader>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Card de Clientes */}
          <Card className="overflow-hidden border-amber-100">
            <CardHeader className="bg-amber-50 border-b border-amber-100 py-3">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <FileText className="w-5 h-5 text-amber-600" /> Informações dos Clientes ({customers.length + 1})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 gap-y-3">
              <InfoItem
                icon={<User className="w-4 h-4 text-blue-500" />}
                label="Cliente Responsável"                
              />
              <div className="space-y-3">
                  <div key={saleData.customer.id} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-lg transition-colors">
                      <div>
                        <p className="font-medium">{saleData.customer.firstName} {saleData.customer.lastName}</p>
                        {saleData.customer.email && <p className="text-xs text-gray-500">{saleData.customer.email}</p>}
                        {saleData.customer.phone && <p className="text-xs text-gray-500">{saleData.customer.phone}</p>}
                      </div>
                    </div>
                </div>
              {otherCustomers.length > 0 && (
                <InfoItem
                  icon={<Users className="w-4 h-4 text-amber-500" />}
                  label="Outros Clientes"
                />
              )}
              <div className="space-y-3">
                  {customers.map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium">{sc.customer.first_name} {sc.customer.last_name}</p>
                        {sc.customer.email && (
                          <p className="text-xs text-gray-500">{sc.customer.email}</p>
                        )}
                        {sc.customer.phone && (
                          <p className="text-xs text-gray-500">{sc.customer.phone}</p>
                        )}
                      </div>
                      <button
                        className="ml-auto text-red-600 text-xs hover:underline"
                        onClick={() => handleRemove(sc.customer_id || sc.customer.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>

          {/* Card de Informações da Venda */}
          <Card className="overflow-hidden border-blue-100">
            <CardHeader className="bg-blue-50 border-b border-blue-100 py-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileText className="w-5 h-5 text-blue-600" /> Informações da Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <InfoItem
                icon={<User className="w-4 h-4 text-blue-500" />}
                label="Data da Venda"
                value={formatDate(saleData.sale_date)}
              />
              <InfoItem
                icon={<User className="w-4 h-4 text-blue-500" />}
                label="Data de Execução"
                value={formatDate(saleData.delivery_date)}
              />
              {saleData.seller && (
                <InfoItem 
                  icon={<UserCheck className="w-4 h-4 text-indigo-500" />}
                  label="Vendedor"
                  value={`${saleData.seller.first_name || ''} ${saleData.seller.last_name || ''}`}
                />
              )}
              {saleData.trip && (
                <InfoItem 
                  icon={<MapPin className="w-4 h-4 text-amber-500" />}
                  label="Passeio"
                  value={saleData.trip.title}
                />
              )}
              {saleData.vehicle && (
                <InfoItem 
                  icon={<Car className="w-4 h-4 text-emerald-500" />}
                  label="Veículo"
                  value={`${saleData.vehicle.plate} - ${saleData.vehicle.model}`}
                />
              )}
              {saleData.driver && (
                <InfoItem 
                  icon={<User className="w-4 h-4 text-violet-500" />}
                  label="Motorista"
                  value={`${saleData.driver.first_name} ${saleData.driver.last_name}`}
                />
              )}
              <InfoItem 
                icon={<AlertCircle className="w-4 h-4 text-blue-500" />}
                label="Prioridade"
                value={<PriorityBadge priority={saleData.priority} />}
              />
            </CardContent>
          </Card>

          {/* Card de Valores */}
          <Card className="overflow-hidden border-green-100">
            <CardHeader className="bg-green-50 border-b border-green-100 py-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CreditCard className="w-5 h-5 text-green-600" /> Valores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <ValueItem 
                    label="Subtotal"
                    value={formatCurrency(saleData.subtotal)}
                  />
                  <ValueItem 
                    label="Desconto"
                    value={formatCurrency(saleData.discount_amount)}
                    percentage={saleData.discount_percentage}
                    valueClassName="text-amber-600"
                  />
                  <ValueItem 
                    label="Impostos"
                    value={formatCurrency(saleData.tax_amount)}
                    valueClassName="text-gray-600"
                  />
                  <ValueItem
                    label="Total"
                    value={formatCurrency(saleData.total_amount)}
                    valueClassName="text-lg font-bold text-green-600"
                  />
                  <Divider />
                  <SaleAccessoriesTable saleId={saleData.id} onUpdated={refreshSale} />
                  <Divider />
                  <SalePaymentsTable saleId={saleData.id} totalAmount={saleData.total_amount} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Cronograma */}
          <Card className="overflow-hidden border-purple-100">
            <CardHeader className="bg-purple-50 border-b border-purple-100 py-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Calendar className="w-5 h-5 text-purple-600" /> Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Timeline>
                <TimelineItem 
                  date={saleData.sale_date}
                  label="Data da Venda"
                  icon={<FileText />}
                  status="completed"
                />
                <TimelineItem 
                  date={saleData.delivery_date}
                  label="Execução"
                  icon={<CheckCircle />}
                  status="upcoming"
                  daysLeft={calculateDaysLeft(saleData.delivery_date)}
                />
              </Timeline>
            </CardContent>
          </Card>

          {/* Card de Observações */}
          {saleData.notes && (
            <Card className="overflow-hidden border-blue-100">
              <CardHeader className="bg-blue-50 border-b border-blue-100 py-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <FileText className="w-5 h-5 text-blue-600" /> Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ExpandableText text={saleData.notes} maxLength={100} />
              </CardContent>
            </Card>
          )}

          {/* Card de Notas Internas */}
          {saleData.internal_notes && (
            <Card className="overflow-hidden border-gray-100">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-5 h-5 text-gray-600" /> Notas Internas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ExpandableText text={saleData.internal_notes} maxLength={100} />
              </CardContent>
            </Card>
          )}
        </div>
        
        <DrawerFooter className="border-t px-6 py-4">
          <DrawerClose className="px-4 py-2 bg-zapchat-primary text-white rounded-md hover:bg-zapchat-medium">
            Fechar
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SaleDetailsDrawer;
