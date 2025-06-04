import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Phone, Mail, Calendar, MapPin, Car } from 'lucide-react';
import api from '../../services/api';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    cnh: '',
    cnhCategory: 'D',
    cnhExpiry: '',
    birthDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'ACTIVE',
    vehicleId: ''
  });

  const cnhCategories = [
    { value: 'A', label: 'Categoria A' },
    { value: 'B', label: 'Categoria B' },
    { value: 'C', label: 'Categoria C' },
    { value: 'D', label: 'Categoria D' },
    { value: 'E', label: 'Categoria E' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Inativo', color: 'bg-red-100 text-red-800' },
    { value: 'VACATION', label: 'Férias', color: 'bg-blue-100 text-blue-800' },
    { value: 'SICK_LEAVE', label: 'Licença Médica', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        vehicleId: formData.vehicleId || null
      };

      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, submitData);
      } else {
        await api.post('/drivers', submitData);
      }

      setShowModal(false);
      setEditingDriver(null);
      resetForm();
      fetchDrivers();
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      cpf: driver.cpf || '',
      rg: driver.rg || '',
      cnh: driver.cnh || '',
      cnhCategory: driver.cnhCategory || 'D',
      cnhExpiry: driver.cnhExpiry ? driver.cnhExpiry.split('T')[0] : '',
      birthDate: driver.birthDate ? driver.birthDate.split('T')[0] : '',
      address: driver.address || '',
      city: driver.city || '',
      state: driver.state || '',
      zipCode: driver.zipCode || '',
      status: driver.status || 'ACTIVE',
      vehicleId: driver.vehicleId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        await api.delete(`/drivers/${id}`);
        fetchDrivers();
      } catch (error) {
        console.error('Erro ao excluir motorista:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      rg: '',
      cnh: '',
      cnhCategory: 'D',
      cnhExpiry: '',
      birthDate: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      status: 'ACTIVE',
      vehicleId: ''
    });
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.cnh?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Motoristas</h1>
          <p className="text-gray-600">Gerencie os motoristas da empresa</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingDriver(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-zapchat-primary text-white rounded-lg hover:bg-zapchat-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Motorista
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou CNH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{drivers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-lg font-semibold text-gray-900">
                {drivers.filter(d => d.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">CNH Vencendo</p>
              <p className="text-lg font-semibold text-gray-900">
                {drivers.filter(d => isExpiringSoon(d.cnhExpiry)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">CNH Vencida</p>
              <p className="text-lg font-semibold text-gray-900">
                {drivers.filter(d => isExpired(d.cnhExpiry)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapchat-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-zapchat-light rounded-lg">
                      <User className="w-5 h-5 text-zapchat-dark" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">CNH: {driver.cnh}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}>
                    {statusOptions.find(s => s.value === driver.status)?.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {driver.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {driver.email}
                    </div>
                  )}
                  {driver.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {driver.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Categoria: {driver.cnhCategory}
                  </div>
                  {driver.cnhExpiry && (
                    <div className={`flex items-center text-sm ${isExpired(driver.cnhExpiry) ? 'text-red-600' :
                        isExpiringSoon(driver.cnhExpiry) ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Vence: {formatDate(driver.cnhExpiry)}
                      {isExpired(driver.cnhExpiry) && ' (Vencida)'}
                      {isExpiringSoon(driver.cnhExpiry) && !isExpired(driver.cnhExpiry) && ' (Vencendo)'}
                    </div>
                  )}
                  {driver.Vehicle && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Car className="w-4 h-4 mr-2" />
                      Veículo: {driver.Vehicle.plate} - {driver.Vehicle.model}
                    </div>
                  )}
                  {driver.city && driver.state && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {driver.city}, {driver.state}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredDrivers.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum motorista encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar sua busca.' : 'Comece adicionando um novo motorista.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6">

            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Dados Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Nome completo do motorista"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RG
                      </label>
                      <input
                        type="text"
                        value={formData.rg}
                        onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="00.000.000-0"
                      />
                    </div>
                  </div>
                </div>

                {/* CNH */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Carteira de Habilitação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número da CNH *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cnh}
                        onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="00000000000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        required
                        value={formData.cnhCategory}
                        onChange={(e) => setFormData({ ...formData, cnhCategory: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      >
                        {cnhCategories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        value={formData.cnhExpiry}
                        onChange={(e) => setFormData({ ...formData, cnhExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Rua, número, complemento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Cidade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="SP"
                        maxLength="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>

                {/* Status e Veículo */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Configurações</h4>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veículo Designado
                      </label>
                      <select
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      >
                        <option value="">Nenhum veículo</option>
                        {vehicles.filter(v => v.status === 'ACTIVE').map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDriver(null);
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
                    {editingDriver ? 'Atualizar' : 'Criar'}
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

export default Drivers;

