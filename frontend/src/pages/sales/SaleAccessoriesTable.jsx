import React, { useEffect, useState } from 'react';
import { saleAccessoryService, accessoryService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2 } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const SaleAccessoriesTable = ({ saleId, onUpdated }) => {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [options, setOptions] = useState([]);
  const [form, setForm] = useState({ accessory_id: '', quantity: 1 });

  const loadItems = async () => {
    if (!saleId) return;
    try {
      const res = await saleAccessoryService.list(saleId);
      const list = res.data?.data || res.data || res;
      setItems(list);
    } catch (err) {
      console.error(err);
      showError('Erro ao buscar acessórios');
    }
  };

  useEffect(() => {
    loadItems();
  }, [saleId]);

  const openModal = async () => {
    try {
      const res = await accessoryService.getAll();
      setOptions(res.data?.accessories || res.accessories || []);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar acessórios');
      return;
    }
    setForm({ accessory_id: '', quantity: 1 });
    setShowModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await saleAccessoryService.add(saleId, form);
      showSuccess('Acessório adicionado');
      setShowModal(false);
      loadItems();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erro ao adicionar acessório');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este acessório?')) return;
    try {
      await saleAccessoryService.remove(saleId, id);
      showSuccess('Acessório removido');
      loadItems();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erro ao remover acessório');
    }
  };

  const total = Array.isArray(items)
    ? items.reduce((s, it) => s + parseFloat(it.accessory.value) * parseInt(it.quantity), 0)
    : 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Acessórios</h4>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center px-2 py-1 text-sm bg-zapchat-primary text-white rounded-md"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Nome</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Valor</th>
            <th className="px-3 py-2 text-center font-medium text-gray-700">Qtd</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="px-3 py-2">{it.accessory.name}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(it.accessory.value)}</td>
              <td className="px-3 py-2 text-center">{it.quantity}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(parseFloat(it.accessory.value) * it.quantity)}</td>
              <td className="px-3 py-2 text-right">
                <button onClick={() => handleDelete(it.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                Nenhum acessório associado
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="text-sm text-right mt-2">Total acessórios: {formatCurrency(total)}</div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h4 className="text-lg font-medium">Adicionar Acessório</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acessório</label>
                <select
                  required
                  value={form.accessory_id}
                  onChange={(e) => setForm({ ...form, accessory_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                >
                  <option value="">Selecione</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} - {formatCurrency(opt.value)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zapchat-primary text-white rounded-md text-sm hover:bg-zapchat-medium"
                >
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

export default SaleAccessoriesTable;
