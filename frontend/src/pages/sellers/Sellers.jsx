import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { sellerService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const Sellers = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '' });

  useEffect(() => {
    fetchSellers();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (user.role !== 'master') params.company_id = user.company_id;
      const res = await sellerService.getAll(params);
      setSellers(res.data?.sellers || res.sellers || []);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setFormData({ first_name: '', last_name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: formData.first_name,
        lastName: formData.last_name,
      };
      if (user.role !== 'master') payload.company_id = user.company_id;
      if (editing) {
        await sellerService.update(editing.id, payload);
        showSuccess('Vendedor atualizado');
      } else {
        await sellerService.create(payload);
        showSuccess('Vendedor criado');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchSellers();
      navigate('/sellers');
    } catch (err) {
      console.error(err);
      showError('Erro ao salvar vendedor');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (seller) => {
    setEditing(seller);
    setFormData({
      first_name: seller.firstName || '',
      last_name: seller.lastName || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este vendedor?')) return;
    try {
      await sellerService.delete(id);
      showSuccess('Vendedor excluído');
      setSellers(sellers.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      showError('Erro ao excluir vendedor');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditing(null);
    resetForm();
    navigate('/sellers');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendedores</h1>
        <button
          onClick={() => {
            resetForm();
            setEditing(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-zapchat-primary text-white rounded-lg hover:bg-zapchat-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapchat-primary" />
        </div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold">Nome</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id} className="border-t">
                <td className="px-3 py-2">
                  {seller.firstName} {seller.lastName}
                </td>
                <td className="px-3 py-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(seller)}
                    className="text-blue-600 hover:underline"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(seller.id)}
                    className="text-red-600 hover:underline"
                  >
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
            <h2 className="text-lg font-semibold mb-4">Cadastro de Vendedor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sobrenome *</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full border px-3 py-2 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded-md flex items-center"
                >
                  <X className="w-4 h-4 mr-1" /> Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-zapchat-primary text-white rounded-md flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;
