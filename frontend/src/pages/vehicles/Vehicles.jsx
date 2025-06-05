import React, { useState, useEffect } from 'react';
import { vehicleService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Save,
} from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    type: 'van',
    status: 'ativo',
    mileage: '',
    color: '',
    registration: '',
    insurance_number: '',
    insurance_expiry: '',
    last_maintenance: '',
    next_maintenance: '',
    fuel: '',
    observations: ''
  });

  const vehicleTypes = [
    { value: 'van', label: 'Van' },
    { value: 'micro_onibus', label: 'Micro-ônibus' },
    { value: 'onibus', label: 'Ônibus' },
    { value: 'carro', label: 'Carro' },
    { value: 'suv', label: 'SUV' }
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'manutencao', label: 'Manutenção', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-red-100 text-red-800' }
  ];
  
  const fuelOptions = [
    { value: 'gasolina', label: 'Gasolina', color: 'bg-green-100 text-green-800' },
    { value: 'etanol', label: 'Etanol', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'diesel', label: 'Diesel', color: 'bg-red-100 text-red-800' },
    { value: 'flex', label: 'Flex', color: 'bg-red-100 text-red-800' },
    { value: 'eletrico', label: 'Elétrico', color: 'bg-red-100 text-red-800' },
    { value: 'hibrido', label: 'Híbrido', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setVehicles(response.data.vehicles || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar veículos');
      console.error(err);
      showError('Erro ao carregar lista de veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        year: parseInt(formData.year) || new Date().getFullYear(),
        capacity: parseInt(formData.capacity) || 0,
        mileage: parseInt(formData.mileage) || 0
      };

      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, submitData);
        showSuccess('Veículo atualizado com sucesso!');
      } else {
        await vehicleService.create(submitData);
        showSuccess('Veículo cadastrado com sucesso!');
      }
      
      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
    
      const response = error.response?.data;
    
      if (response?.success === false && Array.isArray(response.details)) {
        response.details.forEach((detail) => {
          if (detail.msg) showError(detail.msg);
        });
      } else {
        const errorMessage = response?.message || 'Erro ao salvar veículo';
        showError(errorMessage);
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      capacity: vehicle.capacity || '',
      type: vehicle.type || 'van',
      status: vehicle.status || 'ativo',
      mileage: vehicle.mileage || '',
      color: vehicle.color || '',
      registration: vehicle.registration || '',
      insurance_number: vehicle.insurance_number || '',
      insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split('T')[0] : '',
      last_maintenance: vehicle.last_maintenance ? vehicle.last_maintenance.split('T')[0] : '',
      next_maintenance: vehicle.next_maintenance ? vehicle.next_maintenance.split('T')[0] : '',
      fuel: vehicle.fuel,
      observations: vehicle.observations || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    try {
      await vehicleService.delete(id);
      showSuccess('Veículo excluído com sucesso!');
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao excluir veículo';
      showError(errorMessage);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await vehicleService.updateStatus(id, newStatus);
      showSuccess(`Status do veículo alterado para ${getStatusText(newStatus)}`);
      setVehicles(vehicles.map(v => 
        v.id === id ? { ...v, status: newStatus } : v
      ));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar status';
      showError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      plate: '',
      brand: '',
      model: '',
      year: '',
      capacity: '',
      type: 'van',
      status: 'ativo',
      mileage: '',
      color: '',
      registration: '',
      insurance_number: '',
      insurance_expiry: '',
      last_maintenance: '',
      next_maintenance: '',
      fuel: '',
      observations: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'manutencao':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'inativo':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'manutencao':
        return 'Manutenção';
      case 'inativo':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'van':
        return 'Van';
      case 'micro_onibus':
        return 'Micro-ônibus';
      case 'onibus':
        return 'Ônibus';
      case 'carro':
        return 'Carro';
      case 'suv':
        return 'SUV';
      default:
        return type;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#99CD85]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600">Gerencie a frota de veículos</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => {
              resetForm();
              setEditingVehicle(null);
              setShowModal(true);
            }}
            className="bg-[#99CD85] text-white px-4 py-2 rounded-md hover:bg-[#7FA653] transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Veículo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Placa, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
            >
              <option value="all">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
            >
              <option value="all">Todos</option>
              <option value="van">Van</option>
              <option value="micro_onibus">Micro-ônibus</option>
              <option value="onibus">Ônibus</option>
              <option value="carro">Carro</option>
              <option value="suv">SUV</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={loadVehicles}
            className="bg-[#7FA653] text-white px-4 py-2 rounded-md hover:bg-[#63783D] transition-colors flex items-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Lista de veículos */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quilometragem
                </th>
                {isAdmin() && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin() ? 6 : 5} className="px-6 py-12 text-center">
                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhum veículo encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Tente ajustar os filtros de busca.'
                        : 'Comece cadastrando um novo veículo.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#99CD85] flex items-center justify-center">
                            <Car className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.plate}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#CFE0BC] text-[#1C2B20]">
                        {getTypeText(vehicle.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.capacity} passageiros
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(vehicle.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A'}
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-[#99CD85] hover:text-[#7FA653]"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicles.filter(v => v.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Manutenção</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicles.filter(v => v.status === 'manutencao').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicles.filter(v => v.status === 'inativo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Car className="h-8 w-8 text-[#99CD85]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicles.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="ABC1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="Mercedes-Benz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="Sprinter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidade (passageiros) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quilometragem
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="Branco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registro/RENAVAM
                  </label>
                  <input
                    type="text"
                    value={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="12345678901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Seguro
                  </label>
                  <input
                    type="text"
                    value={formData.insurance_number}
                    onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                    placeholder="987654321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimento do Seguro
                  </label>
                  <input
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Última Manutenção
                  </label>
                  <input
                    type="date"
                    value={formData.last_maintenance}
                    onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Próxima Manutenção
                  </label>
                  <input
                    type="date"
                    value={formData.next_maintenance}
                    onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combustível *
                  </label>
                  <select
                    required
                    value={formData.fuel}
                    onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  >
                    <option value="" disabled>Selecione o combustível</option>
                    {fuelOptions.map((fuel) => (
                      <option key={fuel.value} value={fuel.value}>
                        {fuel.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#99CD85] focus:border-[#99CD85]"
                  placeholder="Informações adicionais sobre o veículo..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#99CD85] text-white rounded-md hover:bg-[#7FA653] flex items-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingVehicle ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;

