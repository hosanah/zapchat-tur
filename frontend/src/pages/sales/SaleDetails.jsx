import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { saleService } from '../../services/api';

const SaleDetails = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await saleService.getById(id);
        setSale(res.data?.data || res.data);
        const cRes = await saleService.getCustomers(id);
        setCustomers(cRes.data?.data || cRes.data);
      } catch (err) {
        console.error('Erro ao buscar detalhes da venda:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zapchat-primary" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Venda não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/sales" className="flex items-center text-zapchat-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Link>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" /> Imprimir Voucher
        </button>
      </div>

      <div className="card space-y-4 print:shadow-none print:border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Venda {sale.sale_number}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Responsável</label>
            <p className="text-gray-900">
              {sale.customer?.first_name} {sale.customer?.last_name}
            </p>
            {sale.customer?.email && <p className="text-gray-500 text-sm">{sale.customer.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <p className="text-gray-900">
              {sale.seller?.first_name} {sale.seller?.last_name || ''}
            </p>
          </div>

          {sale.trip && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passeio</label>
              <p className="text-gray-900">{sale.trip.title}</p>
            </div>
          )}

          {sale.vehicle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
              <p className="text-gray-900">
                {sale.vehicle.plate} - {sale.vehicle.model}
              </p>
            </div>
          )}

          {sale.driver && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motorista</label>
              <p className="text-gray-900">
                {sale.driver.first_name} {sale.driver.last_name}
              </p>
            </div>
          )}
        </div>

        {sale.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <p className="text-gray-900">{sale.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
            <p className="text-gray-900">{formatCurrency(sale.subtotal)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
            <p className="text-gray-900">
              {sale.discount_percentage ? `${sale.discount_percentage}% ` : ''}
              {formatCurrency(sale.discount_amount)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Impostos</label>
            <p className="text-gray-900">{formatCurrency(sale.tax_amount)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
            <p className="text-gray-900 font-semibold">{formatCurrency(sale.total_amount)}</p>
          </div>
          {sale.commission_percentage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comissão</label>
              <p className="text-gray-900">
                {sale.commission_percentage}% ({formatCurrency(sale.commission_amount)})
              </p>
            </div>
          )}
          {sale.payment_method && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
              <p className="text-gray-900">{sale.payment_method}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status do Pagamento</label>
            <p className="text-gray-900">{sale.payment_status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Venda</label>
            <p className="text-gray-900">{formatDate(sale.sale_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
            <p className="text-gray-900">{formatDate(sale.due_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento</label>
            <p className="text-gray-900">{formatDate(sale.payment_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
            <p className="text-gray-900">{formatDate(sale.delivery_date)}</p>
          </div>
        </div>

        {customers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participantes</label>
            <ul className="list-disc list-inside space-y-1 text-gray-900">
              {customers.map((sc) => (
                <li key={sc.id}>
                  {sc.customer.first_name} {sc.customer.last_name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sale.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <p className="text-gray-900">{sale.notes}</p>
          </div>
        )}

        {sale.internal_notes && (
          <div className="print:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
            <p className="text-gray-900">{sale.internal_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleDetails;
