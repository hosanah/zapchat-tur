import React, { useEffect, useState } from 'react';
import { saleService } from '@/services/api';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const defaultPayment = {
  date: new Date().toISOString().split('T')[0],
  method: '',
  amount: '',
  status: 'pendente',
};

const PaymentsTable = ({ saleId }) => {
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState(defaultPayment);

  const loadPayments = async () => {
    if (!saleId) return;
    try {
      const res = await saleService.getPayments(saleId);
      const list = res.data?.payments ?? res.payments ?? [];
      setPayments(list);
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [saleId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await saleService.addPayment(saleId, formData);
      setFormData(defaultPayment);
      loadPayments();
    } catch (err) {
      console.error('Erro ao adicionar pagamento:', err);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remover pagamento?')) return;
    try {
      await saleService.removePayment(saleId, id);
      loadPayments();
    } catch (err) {
      console.error('Erro ao remover pagamento:', err);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value) || 0);

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="border rounded-md px-2 py-1"
          required
        />
        <input
          type="text"
          placeholder="Método"
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          className="border rounded-md px-2 py-1"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Valor"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="border rounded-md px-2 py-1"
          required
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="border rounded-md px-2 py-1"
        >
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1 bg-zapchat-primary text-white rounded-md"
        >
          Adicionar
        </button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length > 0 ? (
            payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.payment_date || p.date}</TableCell>
                <TableCell>{p.payment_method || p.method}</TableCell>
                <TableCell className="capitalize">
                  {p.payment_status || p.status}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remover
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                Sem pagamentos cadastrados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentsTable;
