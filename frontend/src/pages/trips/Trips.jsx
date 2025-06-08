import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Calendar, Clock, Users, Car, User, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const Trips = () => {
  const { isMaster, user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: '',
    destination: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    pricePerPerson: '',
    maxPassengers: '',
    vehicleId: '',
    driverId: '',
    companyId: '',
    observations: '',
    status: 'planejado',
    notes: ''
  });

  const statusOptions = [
    { value: 'planejado', label: 'Planejado', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-purple-100 text-purple-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
    fetchCustomers();
    if (isMaster()) {
      fetchCompanies();
    }
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trips');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Erro ao carregar passeios:', error);
      showError('Erro ao carregar lista de passeios');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      showError('Erro ao carregar lista de veículos');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      showError('Erro ao carregar lista de motoristas');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showError('Erro ao carregar lista de clientes');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const buildDateTime = (date, time) => {
        if (!date) return '';
        return time ? `${date}T${time}` : date;
      };

      const submitData = {
        title: formData.title,
        description: formData.description,
        origin: formData.origin,
        destination: formData.destination,
        startDate: buildDateTime(formData.startDate, formData.startTime),
        endDate: buildDateTime(formData.endDate, formData.endTime) || null,
        pricePerPerson: parseFloat(formData.pricePerPerson) || 0,
        maxPassengers: parseInt(formData.maxPassengers) || 0,
        vehicleId: formData.vehicleId || null,
        driverId: formData.driverId || null,
        status: formData.status,
        notes: formData.notes
      };
      if (isMaster()) {
        submitData.company_id = formData.companyId;
      }
      delete submitData.companyId;

      if (editingTrip) {
        await api.put(`/trips/${editingTrip.id}`, submitData);
        showSuccess('Passeio atualizado com sucesso!');
      } else {
        await api.post('/trips', submitData);
        showSuccess('Passeio cadastrado com sucesso!');
      }
      
      setShowModal(false);
      setEditingTrip(null);
      resetForm();
      fetchTrips();
    } catch (error) {
      console.error('Erro ao salvar passeio:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar passeio';
      showError(errorMessage);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title || '',
      description: trip.description || '',
      origin: trip.origin || '',
      destination: trip.destination || '',
      startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
      startTime: trip.startDate ? trip.startDate.split('T')[1]?.slice(0,5) || '' : '',
      endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
      endTime: trip.endDate ? trip.endDate.split('T')[1]?.slice(0,5) || '' : '',
      pricePerPerson: trip.pricePerPerson || '',
      maxPassengers: trip.maxPassengers || '',
      vehicleId: trip.vehicleId || '',
      driverId: trip.driverId || '',
      companyId: trip.company_id || '',
      status: trip.status || 'PLANNED',
      observations: trip.observations || '',
      notes: trip.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este passeio?')) {
      try {
        await api.delete(`/trips/${id}`);
        showSuccess('Passeio excluído com sucesso!');
        fetchTrips();
      } catch (error) {
        console.error('Erro ao excluir passeio:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir passeio';
        showError(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      origin: '',
      destination: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      pricePerPerson: '',
      maxPassengers: '',
      vehicleId: '',
      driverId: '',
      companyId: '',
      observations: '',
      status: 'planejado',
      notes: ''
    });
  };

  const filteredTrips = trips.filter(trip =>
    trip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.origin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDaysUntilTrip = (startDate) => {
    if (!startDate) return null;
    const today = new Date();
    const departure = new Date(startDate);
    const diffTime = departure - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passeios</h1>
          <p className="text-gray-600">Gerencie os passeios e roteiros da empresa</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingTrip(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-zapchat-primary text-white rounded-lg hover:bg-zapchat-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Passeio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por título, destino ou local de partida..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{trips.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-lg font-semibold text-gray-900">
                  {trips.filter(t => t.status === 'confirmado').length}
                </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-lg font-semibold text-gray-900">
                  {trips.filter(t => t.status === 'em_andamento').length}
                </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-lg font-semibold text-gray-900">
                  {trips.filter(t => t.status === 'concluido').length}
                </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(trips.reduce((total, t) => total + (parseFloat(t.pricePerPerson) || 0), 0))}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapchat-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const daysUntil = getDaysUntilTrip(trip.startDate);
            return (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-zapchat-light rounded-lg">
                        <MapPin className="w-5 h-5 text-zapchat-dark" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
                        <p className="text-sm text-gray-600">{trip.destination}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                      {statusOptions.find(s => s.value === trip.status)?.label}
                    </span>
                  </div>

                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-4">{trip.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {trip.origin && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        Saída: {trip.origin}
                      </div>
                    )}
                    {trip.startDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Partida: {formatDate(trip.startDate)}
                        {trip.startDate.split('T')[1] && ` às ${trip.startDate.split('T')[1].slice(0,5)}`}
                      </div>
                    )}
                    {trip.endDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Retorno: {formatDate(trip.endDate)}
                        {trip.endDate.split('T')[1] && ` às ${trip.endDate.split('T')[1].slice(0,5)}`}
                      </div>
                    )}
                    {trip.pricePerPerson && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Preço: {formatCurrency(trip.pricePerPerson)}
                      </div>
                    )}
                    {trip.maxPassengers && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Capacidade: {trip.maxPassengers} passageiros
                      </div>
                    )}
                    {trip.Vehicle && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2" />
                        Veículo: {trip.Vehicle.plate} - {trip.Vehicle.model}
                      </div>
                    )}
                    {trip.Driver && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        Motorista: {trip.Driver.name}
                      </div>
                    )}
                  </div>

                  {daysUntil !== null && trip.status !== 'concluido' && trip.status !== 'cancelado' && (
                    <div className={`mb-4 p-2 rounded-lg text-sm ${
                      daysUntil < 0 ? 'bg-red-100 text-red-800' :
                      daysUntil === 0 ? 'bg-yellow-100 text-yellow-800' :
                      daysUntil <= 7 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {daysUntil < 0 ? `Atrasado há ${Math.abs(daysUntil)} dias` :
                       daysUntil === 0 ? 'Hoje!' :
                       daysUntil === 1 ? 'Amanhã' :
                       `Em ${daysUntil} dias`}
                    </div>
                  )}

                  {trip.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Observações:</strong> {trip.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredTrips.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum passeio encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar sua busca.' : 'Comece adicionando um novo passeio.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTrip ? 'Editar Passeio' : 'Novo Passeio'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isMaster() && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa *
                        </label>
                        <select
                          required
                          value={formData.companyId}
                          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        >
                          <option value="">Selecione a empresa</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título do Passeio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Ex: Passeio para Campos do Jordão"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Descrição detalhada do passeio..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destino *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Cidade/Local de destino"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local de Partida *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Local de saída"
                      />
                    </div>
                  </div>
                </div>

                {/* Datas e Horários */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Datas e Horários</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Partida *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horário de Partida
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Retorno
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horário de Retorno
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Preço e Capacidade */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Preço e Capacidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço por Pessoa (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pricePerPerson}
                        onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo de Passageiros
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxPassengers}
                        onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>

                {/* Recursos */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Recursos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veículo
                      </label>
                      <select
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      >
                        <option value="">Selecione um veículo</option>
                        {vehicles.filter(v => v.status === 'ACTIVE').map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand} {vehicle.model} (Cap: {vehicle.capacity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motorista
                      </label>
                      <select
                        value={formData.driverId}
                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      >
                        <option value="">Selecione um motorista</option>
                        {drivers.filter(d => d.status === 'ACTIVE').map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} - CNH: {driver.cnh}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status e Observações */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Status e Observações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Observações sobre o passeio..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTrip(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zapchat-primary text-white rounded-md text-sm font-medium hover:bg-zapchat-medium"
                  >
                    {editingTrip ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;

