import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    birthDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    observations: '',
    status: 'ativo'
  });

  const statusOptions = [
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-red-100 text-red-800' },
    { value: 'bloqueado', label: 'Bloqueado', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/customers', { params });
      const { customers: list = [], pagination } = response.data || {};
      setCustomers(list);
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || list.length);
      } else {
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showError('Erro ao carregar lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  function prepareCustomerPayload(formData) {
  const [firstName = '', ...lastNameParts] = formData.name.trim().split(' ');
  const lastName = lastNameParts.join(' ') || '';

    const mapStatus = (frontStatus) => {
      switch (frontStatus?.toUpperCase()) {
        case 'ACTIVE':
          return 'ativo';
        case 'INACTIVE':
          return 'inativo';
        case 'BLOCKED':
          return 'bloqueado';
        default:
          return undefined;
      }
    };

    const payload = {
      firstName,
      lastName,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      birthDate: formData.birthDate,
    };

    if (formData.cpf.trim()) payload.cpf = formData.cpf.trim();
    if (formData.rg?.trim()) payload.rg = formData.rg.trim();
    if (formData.address.trim()) payload.address = formData.address.trim();
    if (formData.city.trim()) payload.city = formData.city.trim();
    if (formData.state.trim()) payload.state = formData.state.trim().toUpperCase();
    if (formData.zipCode.trim()) payload.zipCode = formData.zipCode.trim();
    if (formData.emergencyContact.trim()) payload.emergencyContact = formData.emergencyContact.trim();
    if (formData.emergencyPhone.trim()) payload.emergencyPhone = formData.emergencyPhone.trim();
    if (formData.observations.trim()) payload.notes = formData.observations.trim();

    const mappedStatus = mapStatus(formData.status);
    if (mappedStatus) payload.status = mappedStatus;

    return payload;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, prepareCustomerPayload(formData));
        showSuccess('Cliente atualizado com sucesso!');
      } else {
        await api.post('/customers', prepareCustomerPayload(formData));
        showSuccess('Cliente cadastrado com sucesso!');
      }
      
      setShowModal(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    
      const response = error.response?.data;
    
      if (response?.success === false && Array.isArray(response.details)) {
        response.details.forEach((detail) => {
          if (detail.msg) showError(detail.msg);
        });
      } else {
        const errorMessage = response?.message || 'Erro ao salvar cliente';
        showError(errorMessage);
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    setFormData({
      name: fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      cpf: customer.cpf || '',
      rg: customer.rg || '',
      birthDate: customer.birthDate ? customer.birthDate.split('T')[0] : '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      emergencyContact: customer.emergencyContact || '',
      emergencyPhone: customer.emergencyPhone || '',
      observations: customer.observations || '',
      status: customer.status || 'ativo'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/customers/${id}`);
        showSuccess('Cliente excluído com sucesso!');
        fetchCustomers();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir cliente';
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
      birthDate: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      observations: '',
      status: 'ativo'
    });
  };

  const filteredCustomers = customers;

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie a base de clientes da empresa</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-zapchat-primary text-white rounded-lg hover:bg-zapchat-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone ou CPF..."
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
              <Users className="w-5 h-5 text-blue-600" />
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
                {customers.filter(c => c.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <User className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Bloqueados</p>
              <p className="text-lg font-semibold text-gray-900">
                {customers.filter(c => c.status === 'BLOCKED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Novos (30 dias)</p>
              <p className="text-lg font-semibold text-gray-900">
                {customers.filter(c => {
                  const createdDate = new Date(c.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdDate >= thirtyDaysAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{customer.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{customer.phone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.city && customer.state ? `${customer.city}, ${customer.state}` : ''}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {statusOptions.find(s => s.value === customer.status)?.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                    <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:underline mr-3">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:underline">
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

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar sua busca.' : 'Comece adicionando um novo cliente.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6">

            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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
                        placeholder="Nome completo do cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF
                      </label>
                      <input
                        type="text"
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

                {/* Contato de Emergência */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Contato de Emergência</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Contato
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Nome do contato de emergência"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone de Emergência
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Observações e Status */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Informações Adicionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
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
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-zapchat-primary focus:border-zapchat-primary"
                        placeholder="Observações sobre o cliente..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCustomer(null);
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
                    {editingCustomer ? 'Atualizar' : 'Criar'}
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

export default Customers;

