import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, X, Save, CheckCircle, XCircle } from 'lucide-react';

const emptyForm = {
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  website: '',
  description: ''
};

const Companies = () => {
  const { showSuccess, showError } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAll();
      setCompanies(response.data?.companies || []);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setFormData(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await companyService.update(editing.id, formData);
        showSuccess('Empresa atualizada com sucesso!');
      } else {
        await companyService.create(formData);
        showSuccess('Empresa criada com sucesso!');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchCompanies();
    } catch (err) {
      console.error(err);
      showError('Erro ao salvar empresa');
    }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setFormData({
      name: c.name || '',
      cnpj: c.cnpj || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      zipCode: c.zipCode || '',
      website: c.website || '',
      description: c.description || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await companyService.updateStatus(id);
      setCompanies(companies.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
      showSuccess('Status atualizado');
    } catch (err) {
      console.error(err);
      showError('Erro ao atualizar status');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
          className="bg-zapchat-primary text-white px-4 py-2 rounded-md hover:bg-zapchat-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Empresa
        </button>
      </div>

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
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">CNPJ</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map(c => (
                <tr key={c.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{c.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{c.cnpj}</td>
                  <td className="px-3 py-2">
                    {c.isActive ? (
                      <span className="inline-flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Ativa</span>
                    ) : (
                      <span className="inline-flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> Inativa</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline mr-3">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleToggleStatus(c.id)} className="text-yellow-600 hover:underline">
                      {c.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Editar Empresa' : 'Nova Empresa'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="CNPJ"
                value={formData.cnpj}
                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Telefone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Endereço"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="UF"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="CEP"
                  value={formData.zipCode}
                  onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="Website"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-md flex items-center">
                  <X className="w-4 h-4 mr-1" /> Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-zapchat-primary text-white rounded-md flex items-center">
                  <Save className="w-4 h-4 mr-1" /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
