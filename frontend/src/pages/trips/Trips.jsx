import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, User, Phone, Mail, MapPin, Calendar, Users} from 'lucide-react';
import { tripService, companyService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const TYPES = [
  { value: 'turismo', label: 'Turismo' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'excursao', label: 'Excursão' },
  { value: 'fretamento', label: 'Fretamento' },
  { value: 'outros', label: 'Outros' },
];

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo', color: 'bg-blue-100 text-blue-800' },
  { value: 'inativo', label: 'Inativo', color: 'bg-green-100 text-green-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

const Trips = () => {
  const { isMaster } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [trips, setTrips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxPassengers: '',
    priceTrips: '',
    type: 'turismo',
    status: 'ativo',
    color: '#99CD85',
    company_id: '',
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await tripService.getAll(params);
      setTrips(response.data?.trips || response.trips || []);
    } catch (err) {
      showError('Erro ao carregar passeios');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getAll();
      setCompanies(response.data?.companies || response.companies || []);
    } catch (err) {
      showError('Erro ao carregar empresas');
    }
  };

  const filteredCustomers = trips.filter(trip =>
    trip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchTrips();
    if (isMaster()) fetchCompanies();
  }, [statusFilter]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      maxPassengers: '',
      priceTrips: '',
      type: 'turismo',
      status: 'ativo',
      color: '#99CD85',
      company_id: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await tripService.update(editing.id, formData);
        showSuccess('Passeio atualizado');
      } else {
        await tripService.create(formData);
        showSuccess('Passeio criado');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchTrips();
    } catch (error) {
      console.error('Erro ao salvar passeio:', error);
    
      const response = error.response?.data;
    
      if (response?.success === false && Array.isArray(response.details)) {
        response.details.forEach((detail) => {
          if (detail.msg) showError(detail.msg);
        });
      } else {
        const errorMessage = response?.message || 'Erro ao salvar passeio';
        showError(errorMessage);
      }
    }
  };

  const handleEdit = (trip) => {
    setEditing(trip);
    setFormData({
      title: trip.title || '',
      description: trip.description || '',
      maxPassengers: trip.maxPassengers || '',
      priceTrips: trip.priceTrips || '',
      type: trip.type || 'turismo',
      status: trip.status || 'ativo',
      color: trip.color || '#99CD85',
      company_id: trip.company_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este passeio?')) return;
    try {
      await tripService.delete(id);
      showSuccess('Passeio removido');
      fetchTrips();
    } catch (err) {
      showError('Erro ao excluir passeio');
    }
  };

  const handleStatusChange = async (tripId, newStatus) => {
    try {
      await tripService.updateStatus(tripId, { status: newStatus });
      showSuccess('Status atualizado com sucesso');
      fetchTrips();
    } catch (err) {
      showError('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    if (!statusOption) return null;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption.color}`}>
        {statusOption.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Passeios</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm">
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
            className="inline-flex items-center px-4 py-2 bg-zapchat-primary text-white rounded-lg hover:bg-zapchat-medium">
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
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
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-lg font-semibold text-gray-900">
                {trips.filter(c => c.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left text-sm font-semibold">Título</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Status</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Preço</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Máx. passageiros</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-t" style={{ borderLeft: `4px solid ${trip.color || '#99CD85'}` }}>
                <td className="px-3 py-2">{trip.title}</td>
                <td className="px-3 py-2 capitalize">{trip.type}</td>
                <td className="px-3 py-2">
                  <select
                    value={trip.status || 'ativo'}
                    onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1">
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  {Number(trip.priceTrips).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-3 py-2">{trip.maxPassengers}</td>
                <td className="px-3 py-2 flex space-x-2">
                  <button onClick={() => handleEdit(trip)} className="text-blue-600 hover:underline">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(trip.id)} className="text-red-600 hover:underline">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Passeio' : 'Novo Passeio'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md">
                  {TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Máx. passageiros *</label>
                <input
                  type="number"
                  required
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preço *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.priceTrips}
                  onChange={(e) => setFormData({ ...formData, priceTrips: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md">
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 border rounded-md p-0" />
              </div>
              {isMaster() && (
                <div>
                  <label className="block text-sm font-medium mb-1">Empresa *</label>
                  <select
                    required
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full border px-3 py-2 rounded-md">
                    <option value="">Selecione</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditing(null); }}
                  className="px-4 py-2 border rounded-md">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zapchat-primary text-white rounded-md">
                  {editing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
