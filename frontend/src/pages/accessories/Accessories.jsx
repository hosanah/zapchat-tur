import React, { useState, useEffect } from 'react';
import { accessoryService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const emptyForm = { name: '', value: '', description: '' };

const Accessories = () => {
  const { showSuccess, showError } = useToast();
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadAccessories = async () => {
    try {
      setLoading(true);
      const res = await accessoryService.getAll({ page: currentPage, limit: 10 });
      const { accessories: list = [], pagination } = res.data || {};
      setAccessories(list);
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || list.length);
      } else {
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar acessórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessories();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => setFormData(emptyForm);

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setFormData({
      name: acc.name || '',
      value: acc.value,
      description: acc.description || '',
    });
    setEditing(acc);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      value: parseFloat(formData.value) || 0,
      description: formData.description,
    };
    try {
      if (editing) {
        await accessoryService.update(editing.id, payload);
        showSuccess('Acessório atualizado com sucesso');
      } else {
        await accessoryService.create(payload);
        showSuccess('Acessório criado com sucesso');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      loadAccessories();
    } catch (err) {
      console.error(err);
      showError('Erro ao salvar acessório');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este acessório?')) return;
    try {
      await accessoryService.delete(id);
      showSuccess('Acessório excluído com sucesso');
      loadAccessories();
    } catch (err) {
      console.error(err);
      showError('Erro ao excluir acessório');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Acessórios</h1>
        <button
          onClick={openCreate}
          className="bg-zapchat-primary text-white px-4 py-2 rounded-md hover:bg-zapchat-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Acessório
        </button>
      </div>
      <p className="text-sm text-gray-600">Total de registros: {totalItems}</p>

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
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Valor</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Descrição</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accessories.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{a.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {Number(a.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-2">{a.description}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                    <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline mr-3">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {accessories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-sm text-gray-500">
                    Nenhum acessório encontrado
                  </td>
                </tr>
              )}
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Editar Acessório' : 'Novo Acessório'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              />
              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Accessories;
