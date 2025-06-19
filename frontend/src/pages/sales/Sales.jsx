import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api, { saleService } from '../../services/api';
import AsyncSelect from "react-select/async";
import SaleDetailsDrawer from './SaleDetailsDrawer';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Building,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Save,
  FileText,
  Users,
  CalendarCheck,
  Car,
  UserCheck,
  UserPlus,
  Printer
} from 'lucide-react';

const Sales = () => {
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [sales, setSales] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [responsibleCustomer, setResponsibleCustomer] = useState('');
  const [saleCustomers, setSaleCustomers] = useState([]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: ''
  });
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);
  const [newResponsibleCustomer, setNewResponsibleCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: ''
  });
  const [isNewMainCustomer, setIsNewMainCustomer] = useState(false);
  const [newMainCustomer, setNewMainCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  const [formData, setFormData] = useState({
    trip_id: '',
    driver_id: '',
    vehicle_id: '',
    seller_id: '',
    customer_id: '',
    description: '',
    subtotal: '',
    discount_amount: 0,
    discount_percentage: 0,
    tax_amount: 0,
    status: 'orcamento',
    priority: 'media',
    payment_status: 'pendente',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    installments: 1,
    sale_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
    commission_percentage: 0,
    notes: '',
    internal_notes: ''
  });

  const statusOptions = [
    { value: 'orcamento', label: 'Orçamento', color: 'bg-gray-100 text-gray-800' },
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmada', label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
    { value: 'paga', label: 'Paga', color: 'bg-green-100 text-green-800' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    { value: 'reembolsada', label: 'Reembolsada', color: 'bg-purple-100 text-purple-800' }
  ];

  const paymentStatusOptions = [
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'parcial', label: 'Parcial', color: 'bg-orange-100 text-orange-800' },
    { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-800' },
    { value: 'atrasado', label: 'Atrasado', color: 'bg-red-100 text-red-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
  ];

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-800' },
    { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchSales();
    fetchDrivers();
    fetchVehicles();
    fetchSellers();
    fetchStats();
    fetchTrips();
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter, startDateFilter, endDateFilter]);


  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Erro ao buscar passeios:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  const fetchSellers = async () => {
    try {
      const [adminsRes, usersRes] = await Promise.all([
        api.get('/users', { params: { role: 'admin' } }),
        api.get('/users', { params: { role: 'user' } })
      ]);
      const admins = adminsRes.data?.users || [];
      const normalUsers = usersRes.data?.users || [];
      setSellers([...admins, ...normalUsers]);
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('payment_status', paymentStatusFilter);
      if (startDateFilter) params.append('start_date', startDateFilter);
      if (endDateFilter) params.append('end_date', endDateFilter);

      const response = await api.get(`/sales?${params}`);
      setSales(response.data.sales);
      setTotalPages(response.data.pagination.total_pages);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOptions = async (inputValue) => {
    try {
      const response = await api.get("/customers", { params: { search: inputValue } });
      const customers = response.data.customers || [];
      return customers.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName} - ${c.email || c.phone}` }));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  };

  const fetchCustomerOptionById = async (id) => {
    try {
      const res = await api.get(`/customers/${id}`);
      const c = res.data.data.customer;
      return { value: c.id, label: `${c.firstName} ${c.lastName} - ${c.email || c.phone}` };
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }
  };

  const fetchSaleCustomers = async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}/customers`);
      setSaleCustomers(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes da venda:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/sales/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };

      if (isNewMainCustomer) {
        dataToSend.new_customer = { ...newMainCustomer };
        delete dataToSend.customer_id;
      }
      
      // Calcular total_amount
      const subtotal = parseFloat(dataToSend.subtotal) || 0;
      const discount = parseFloat(dataToSend.discount_amount) || 0;
      const tax = parseFloat(dataToSend.tax_amount) || 0;
      dataToSend.total_amount = subtotal - discount + tax;

      if (!useExistingCustomer) {
        const customerRes = await api.post('/customers', newResponsibleCustomer);
        dataToSend.customer_id = customerRes.data.data.customer.id;
      }

      if (modalMode === 'create') {
        await api.post('/sales', dataToSend);
        showSuccess('Venda criada com sucesso!');
      } else {
        await api.put(`/sales/${selectedSale.id}`, dataToSend);
        showSuccess('Venda atualizada com sucesso!');
      }

      setShowModal(false);
      resetForm();
      fetchSales();
      fetchStats();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    
      const response = error.response?.data;
    
      if (response?.success === false && Array.isArray(response.errors)) {
        response.errors.forEach((detail) => {
          if (detail.msg) showError(detail.msg);
        });
      } else {
        const errorMessage = response?.message || 'Erro ao salvar venda';
        showError(errorMessage);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await api.delete(`/sales/${id}`);
        showSuccess('Venda excluída com sucesso!');
        fetchSales();
        fetchStats();
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir venda';
        showError(errorMessage);

      }
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!selectedSale) return;
    try {
      await api.post(`/sales/${selectedSale.id}/customers`, newCustomer);
      showSuccess('Cliente adicionado com sucesso');
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', birthDate: '' });
      fetchSaleCustomers(selectedSale.id);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      const msg = error.response?.data?.message || 'Erro ao adicionar cliente';
      showError(msg);
    }
  };

  const openModal = (mode, sale = null) => {
    setModalMode(mode);
    setSelectedSale(sale);
    setUseExistingCustomer(true);
    setNewResponsibleCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: ''
    });
    setIsNewMainCustomer(false);
    setNewMainCustomer({ firstName: '', lastName: '', email: '', phone: '', birthDate: '' });
    
    if (mode === 'create') {
      resetForm();
      setSaleCustomers([]);
      setSelectedCustomerOption(null);
    } else if (mode === 'edit' && sale) {
      setFormData({
        trip_id: sale.trip_id || '',
        driver_id: sale.driver_id || '',
        vehicle_id: sale.vehicle_id || '',
        seller_id: sale.seller_id || '',
        customer_id: sale.customer_id || '',
        description: sale.description || '',
        subtotal: sale.subtotal || '',
        discount_amount: sale.discount_amount || 0,
        discount_percentage: sale.discount_percentage || 0,
        tax_amount: sale.tax_amount || 0,
        status: sale.status || 'orcamento',
        priority: sale.priority || 'media',
        payment_status: sale.payment_status || 'pendente',
        payment_date: sale.payment_date ? sale.payment_date.split('T')[0] : '',
        due_date: sale.due_date ? sale.due_date.split('T')[0] : '',
        installments: sale.installments || 1,
        sale_date: sale.sale_date ? sale.sale_date.split('T')[0] : '',
        delivery_date: sale.delivery_date ? sale.delivery_date.split('T')[0] : '',
        commission_percentage: sale.commission_percentage || 0,
        notes: sale.notes || '',
        internal_notes: sale.internal_notes || ''
      });
      fetchSaleCustomers(sale.id);
      if (sale.customer) {
        const c = sale.customer;
        setSelectedCustomerOption({
          value: c.id,
          label: `${c.firstName || c.first_name} ${c.lastName || c.last_name} - ${c.email || c.phone}`,
        });
      } else if (sale.customer_id) {
        fetchCustomerOptionById(sale.customer_id).then(setSelectedCustomerOption);
      } else {
        setSelectedCustomerOption(null);
      }
    }

    setShowModal(true);
  };

  const openAddCustomerModal = (sale) => {
    setSelectedSale(sale);
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: ''
    });
    setShowAddCustomerModal(true);
  };

  const fetchSaleDetails = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      return res.data?.data || res.data;
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      return null;
    }
  };

  const openDetailsModal = async (sale) => {
    const details = await fetchSaleDetails(sale.id);
    if (details) setSelectedSale(details);
    fetchSaleCustomers(sale.id);
    setShowDetailsModal(true);
  };

  const handlePrintVoucher = async (sale) => {
    try {
      const data = await saleService.downloadVoucher(sale.id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voucher-${sale.sale_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar voucher:', error);
      showError('Não foi possível gerar o voucher');
    }
  };

  const resetForm = () => {
    setFormData({
      trip_id: '',
      driver_id: '',
      vehicle_id: '',
      seller_id: '',
      customer_id: '',
      description: '',
      subtotal: '',
      discount_amount: 0,
      discount_percentage: 0,
      tax_amount: 0,
      status: 'orcamento',
      priority: 'media',
      payment_status: 'pendente',
      payment_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      installments: 1,
      sale_date: new Date().toISOString().split('T')[0],
      delivery_date: new Date().toISOString().split('T')[0],
      commission_percentage: 0,
      notes: '',
      internal_notes: ''
    });
    setSelectedCustomerOption(null);
    setUseExistingCustomer(true);
    setNewResponsibleCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: ''
    });
    setIsNewMainCustomer(false);
    setNewMainCustomer({ firstName: '', lastName: '', email: '', phone: '', birthDate: '' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status, options) => {
    const option = options.find(opt => opt.value === status);
    return option ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
        {option.label}
      </span>
    ) : status;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const discount = parseFloat(formData.discount_amount) || 0;
    const tax = parseFloat(formData.tax_amount) || 0;
    return subtotal - discount + tax;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zapchat-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zapchat-darker flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-zapchat-primary" />
            Vendas
          </h1>
          <p className="text-gray-600 mt-1">Gerencie todas as vendas da empresa</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nova Venda
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-zapchat-darker">{stats.total_sales || 0}</p>
            </div>
            <div className="h-12 w-12 bg-zapchat-light rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-zapchat-primary" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-zapchat-darker">{formatCurrency(stats.total_amount)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comissões</p>
              <p className="text-2xl font-bold text-zapchat-darker">{formatCurrency(stats.total_commission)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média por Venda</p>
              <p className="text-2xl font-bold text-zapchat-darker">{formatCurrency(stats.average_sale)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar vendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
              >
                <option value="">Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
              <div className="w-full sm:w-48">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                >
                  <option value="">Pagamento</option>
                  {paymentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                />
              </div>
              <div className="w-full sm:w-40">
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPaymentStatusFilter('');
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sale.sale_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getStatusBadge(sale.priority, priorityOptions)}
                      </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                      <div className="h-10 w-10 bg-zapchat-light rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-zapchat-primary" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.customer?.first_name} {sale.customer?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.customer?.email}
                        </div>
                      </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.seller || sale.users ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sale.seller?.first_name || sale.users?.first_name} {sale.seller?.last_name || sale.users?.last_name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.users || sale.users ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sale.users?.first_name || sale.users?.first_name} {sale.users?.last_name || sale.users?.last_name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(sale.total_amount)}
                      </div>
                    {sale.commission_amount > 0 && (
                      <div className="text-sm text-gray-500">
                        Comissão: {formatCurrency(sale.commission_amount)}
                      </div>
                    )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(sale.status, statusOptions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sale.payment_status, paymentStatusOptions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(sale.sale_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openDetailsModal(sale)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePrintVoucher(sale)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Imprimir Voucher"
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal('edit', sale)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openAddCustomerModal(sale)}
                          className="text-green-600 hover:text-green-900"
                          title="Adicionar Cliente"
                        >
                          <UserPlus className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? 'bg-zapchat-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Próxima
            </button>
          </nav>
        </div>
      )}

      {/* Modal de Detalhes da Venda */}
      <SaleDetailsDrawer
        open={showDetailsModal && !!selectedSale}
        onOpenChange={setShowDetailsModal}
        sale={selectedSale}
        customers={saleCustomers}
        refreshCustomers={() => selectedSale && fetchSaleCustomers(selectedSale.id)}
      />

      {/* Modal de Venda */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {modalMode === 'create' && 'Nova Venda'}
                    {modalMode === 'edit' && 'Editar Venda'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1 */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cliente Responsável
                        </label>
                        {isNewMainCustomer ? (
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-zapchat-primary">Novo Cliente</span>
                              <button
                                type="button"
                                onClick={() => setIsNewMainCustomer(false)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Usar cliente existente
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nome
                                </label>
                                <input
                                  type="text"
                                  value={newMainCustomer.firstName}
                                  onChange={(e) =>
                                    setNewMainCustomer({
                                      ...newMainCustomer,
                                      firstName: e.target.value
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Sobrenome
                                </label>
                                <input
                                  type="text"
                                  value={newMainCustomer.lastName}
                                  onChange={(e) =>
                                    setNewMainCustomer({
                                      ...newMainCustomer,
                                      lastName: e.target.value
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={newMainCustomer.email}
                                onChange={(e) =>
                                  setNewMainCustomer({
                                    ...newMainCustomer,
                                    email: e.target.value
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Telefone
                                </label>
                                <input
                                  type="text"
                                  value={newMainCustomer.phone}
                                  onChange={(e) =>
                                    setNewMainCustomer({
                                      ...newMainCustomer,
                                      phone: e.target.value
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Data de Nascimento
                                </label>
                                <input
                                  type="date"
                                  value={newMainCustomer.birthDate}
                                  onChange={(e) =>
                                    setNewMainCustomer({
                                      ...newMainCustomer,
                                      birthDate: e.target.value
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-zapchat-primary">Cliente Existente</span>
                              <button
                                type="button"
                                onClick={() => setIsNewMainCustomer(true)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Cadastrar novo cliente
                              </button>
                            </div>
                            <AsyncSelect
                              cacheOptions
                              defaultOptions
                              loadOptions={loadCustomerOptions}
                              value={selectedCustomerOption}
                              onChange={(option) => {
                                setSelectedCustomerOption(option);
                                setFormData({ ...formData, customer_id: option ? option.value : '' });
                              }}
                              placeholder="Selecione um cliente"
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isClearable
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passeio
                        </label>
                        <select
                          value={formData.trip_id}
                          onChange={(e) => setFormData({ ...formData, trip_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        >
                          <option value="">Selecione um passeio</option>
                          {trips.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                              {trip.title} - {formatCurrency(trip.priceTrips)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motorista
                        </label>
                        <select
                          value={formData.driver_id}
                          onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        >
                          <option value="">Selecione um motorista</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.firstName} {driver.lastName} - CNH: {driver.licenseNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Veículo
                        </label>
                        <select
                          value={formData.vehicle_id}
                          onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        >
                          <option value="">Selecione um veículo</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.model} - {vehicle.plate}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vendedor
                        </label>
                        <select
                          value={formData.seller_id}
                          onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        >
                          <option value="">Selecione um vendedor</option>
                          {sellers.map((seller) => (
                            <option key={seller.id} value={seller.id}>
                              {seller.firstName} {seller.lastName} - ({seller.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        ></textarea>
                      </div>
                    </div>

                    {/* Coluna 2 */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prioridade
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          >
                            {priorityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data da Venda
                          </label>
                          <input
                            type="date"
                            value={formData.sale_date}
                            onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Entrega
                          </label>
                          <input
                            type="date"
                            value={formData.delivery_date}
                            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.subtotal}
                          onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Desconto (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.discount_amount}
                            onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Taxa (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.tax_amount}
                            onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-gray-700">Total:</span>
                          <span className="text-xl font-bold text-zapchat-primary">
                            {formatCurrency(calculateTotal())}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status do Pagamento
                          </label>
                          <select
                            value={formData.payment_status}
                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          >
                            {paymentStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Pagamento
                          </label>
                          <input
                            type="date"
                            value={formData.payment_date}
                            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Vencimento
                          </label>
                          <input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Botões */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zapchat-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-zapchat-medium"
                    >
                      {modalMode === 'create' ? 'Criar Venda' : 'Atualizar Venda'}
                    </button>
                 </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Cliente */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Adicionar Cliente à Venda
                  </h3>
                  <button
                    onClick={() => setShowAddCustomerModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleAddCustomer}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={newCustomer.firstName}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              firstName: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sobrenome
                        </label>
                        <input
                          type="text"
                          value={newCustomer.lastName}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              lastName: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            email: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={newCustomer.phone}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              phone: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          value={newCustomer.birthDate}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              birthDate: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomerModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zapchat-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-zapchat-medium"
                    >
                      Adicionar Cliente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
