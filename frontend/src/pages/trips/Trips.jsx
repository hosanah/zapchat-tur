import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

const Trips = () => {
  const { isMaster } = useAuth();
  const { showSuccess, showError } = useToast();
  const [trips, setTrips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxPassengers: '',
    priceTrips: '',
    type: 'turismo',
    company_id: '',
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAll();
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

  useEffect(() => {
    fetchTrips();
    if (isMaster()) fetchCompanies();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      maxPassengers: '',
      priceTrips: '',
      type: 'turismo',
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
    } catch (err) {
      showError('Erro ao salvar passeio');
    }
  };

  const handleEdit = (trip) => {
    setEditing(trip);
    setFormData({
      title: trip.title || '',
      description: trip.description || '',
      origin: trip.origin || '',
      destination: trip.destination || '',
      type: trip.type || 'turismo',
      startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
      startTime: trip.startDate ? trip.startDate.split('T')[1]?.slice(0, 5) : '',
      endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
      endTime: trip.endDate ? trip.endDate.split('T')[1]?.slice(0, 5) : '',
      pricePerPerson: trip.pricePerPerson || '',
      maxPassengers: trip.maxPassengers || '',
      priceTrips: trip.priceTrips || '',
      type: trip.type || 'turismo',
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Passeios</h1>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
          className="inline-flex items-center px-4 py-2 bg-zapchat-primary text-white rounded-lg hover:bg-zapchat-medium">
          <Plus className="w-4 h-4 mr-2" />
          Novo
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left text-sm font-semibold">Título</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Preço</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">Máx. passageiros</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-t">
                <td className="px-3 py-2">{trip.title}</td>
                <td className="px-3 py-2 capitalize">{trip.type}</td>
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
