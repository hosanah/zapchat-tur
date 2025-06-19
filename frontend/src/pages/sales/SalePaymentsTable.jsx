import React, { useEffect, useState } from 'react';
import { salePaymentService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2 } from 'lucide-react';

const paymentMethodOptions = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'parcelado', label: 'Parcelado' },
  { value: 'outros', label: 'Outros' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);

const SalePaymentsTable = ({ saleId, totalAmount }) => {
  const { showSuccess, showError } = useToast();
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ method: '', amount: '', date: '', notes: '' });

  const fetchPayments = async () => {
    if (!saleId) return;
    try {
      const res = await salePaymentService.list(saleId);
      setPayments(res.data?.data || res.data || res);
    } catch (err) {
      console.error(err);
      showError('Erro ao buscar pagamentos');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [saleId]);

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const remaining = (parseFloat(totalAmount) || 0) - totalPaid;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await salePaymentService.add(saleId, {
        method: formData.method,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes,
      });
      showSuccess('Pagamento adicionado');
      setFormData({ method: '', amount: '', date: '', notes: '' });
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erro ao adicionar pagamento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este pagamento?')) return;
    try {
      await salePaymentService.remove(saleId, id);
      showSuccess('Pagamento removido');
      fetchPayments();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erro ao remover pagamento');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Pagamentos</h4>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={remaining <= 0}
          className="flex items-center px-2 py-1 text-sm bg-zapchat-primary text-white rounded-md disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Método</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Valor</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Data</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Notas</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="px-3 py-2">
                {paymentMethodOptions.find((o) => o.value === p.method)?.label || p.method}
              </td>
              <td className="px-3 py-2 text-right">{formatCurrency(p.amount)}</td>
              <td className="px-3 py-2">
                {p.date ? new Date(p.date).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td className="px-3 py-2">{p.notes || '-'}</td>
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                Nenhum pagamento registrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="text-sm text-right mt-2">
        Total pago: {formatCurrency(totalPaid)} / {formatCurrency(totalAmount)}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h4 className="text-lg font-medium mb-4">Adicionar Pagamento</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método
                </label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                >
                  <option value="">Selecione</option>
                  {paymentMethodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={remaining}
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-zapchat-primary focus:border-zapchat-primary"
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
                  disabled={parseFloat(formData.amount || 0) > remaining}
                  className="px-4 py-2 bg-zapchat-primary text-white rounded-md text-sm hover:bg-zapchat-medium disabled:opacity-50"
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

export default SalePaymentsTable;
