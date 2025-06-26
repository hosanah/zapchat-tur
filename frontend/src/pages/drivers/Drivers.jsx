import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Phone, Mail, Calendar, MapPin, Car } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const { showSuccess, showError } = useToast();
  const { isAdmin, user } = useAuth();
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
    status: 'ativo',
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
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-red-100 text-red-800' },
    { value: 'ferias', label: 'Férias', color: 'bg-blue-100 text-blue-800' },
    { value: 'licenca', label: 'Licença Médica', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, [currentPage, searchTerm]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/drivers', { params });
      const list = response.data.drivers || [];
      setDrivers(
        list.map(driver => ({
          ...driver,
          cnh: driver.licenseNumber,
          cnhCategory: driver.licenseCategory,
          name: [driver.firstName, driver.lastName].filter(Boolean).join(' '),
          cnhExpiry: driver.licenseExpiry,
        }))
      );
      const pagination = response.data.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || list.length);
      } else {
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      showError('Erro ao carregar lista de motoristas');
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mapeia os dados do formData para os nomes esperados no backend
      const [firstName, ...lastParts] = formData.name.trim().split(' ');
      const lastName = lastParts.join(' ') || 'Sobrenome';

      const submitData = {
        firstName: firstName || 'Nome',
        lastName,
        email: formData.email || undefined,
        phone: formData.phone,
        cpf: formData.cpf,
        rg: formData.rg,
        birthDate: formData.birthDate,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        licenseNumber: formData.cnh,
        licenseCategory: formData.cnhCategory,
        licenseExpiry: formData.cnhExpiry || null,
        status: formData.status || 'ativo',
        vehicleId: formData.vehicleId || null
      };

      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, submitData);
        showSuccess('Motorista atualizado com sucesso!');
      } else {
        await api.post('/drivers', submitData);
        showSuccess('Motorista cadastrado com sucesso!');
      }

      setShowModal(false);
      setEditingDriver(null);
      resetForm();
      fetchDrivers();
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
    
      const response = error.response?.data;
    
      if (response?.success === false && Array.isArray(response.details)) {
        response.details.forEach((detail) => {
          if (detail.msg) showError(detail.msg);
        });
      } else {
        const errorMessage = response?.message || 'Erro ao salvar motorista';
        showError(errorMessage);
      }
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
      status: driver.status || 'ativo',
      vehicleId: driver.vehicleId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        await api.delete(`/drivers/${id}`);
        showSuccess('Motorista excluído com sucesso!');
        fetchDrivers();
      } catch (error) {
        console.error('Erro ao excluir motorista:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir motorista';
        showError(errorMessage);
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
      status: 'ativo',
      vehicleId: ''
    });
  };

  const filteredDrivers = drivers;

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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
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
              <p className="text-lg font-semibold text-gray-900">{totalItems}</p>
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
                {drivers.filter(d => d.status === 'ativo').length}
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
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Nome</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Telefone</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Cidade/UF</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{driver.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{driver.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{driver.phone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {driver.city && driver.state ? `${driver.city}, ${driver.state}` : ''}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}> 
                      {statusOptions.find(s => s.value === driver.status)?.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                    <button onClick={() => handleEdit(driver)} className="text-blue-600 hover:underline mr-3">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:underline">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                        {vehicles.filter(v => v.status === 'ativo').map(vehicle => (
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

