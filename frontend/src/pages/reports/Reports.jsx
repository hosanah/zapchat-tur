import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Reports = () => {
  const { showError } = useToast();

  const [salesFilters, setSalesFilters] = useState({
    start_date: '',
    end_date: '',
    trip_id: '',
    vendor_id: ''
  });
  const [salesReport, setSalesReport] = useState([]);

  const [dailyDate, setDailyDate] = useState('');
  const [dailyTrips, setDailyTrips] = useState([]);

  const [productivity, setProductivity] = useState([]);

  const [financialReport, setFinancialReport] = useState([]);

  useEffect(() => {
    loadSalesReport();
    loadDailyTrips();
    loadProductivityReport();
    loadFinancialReport();
  }, []);

  const loadSalesReport = async () => {
    try {
      const res = await reportService.getSalesReport(salesFilters);
      const data = res.data?.sales || res.data?.data || res.sales || [];
      setSalesReport(data);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar relatório de vendas');
    }
  };

  const loadDailyTrips = async () => {
    try {
      const params = dailyDate ? { date: dailyDate } : {};
      const res = await reportService.getDailyTripReport(params);
      const data = res.data?.trips || res.data?.data || res.trips || [];
      setDailyTrips(data);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar relatório diário de passeios');
    }
  };

  const loadProductivityReport = async () => {
    try {
      const res = await reportService.getSellerProductivityReport();
      const data =
        res.data?.productivity || res.data?.data || res.productivity || [];
      setProductivity(data);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar produtividade de vendedores');
    }
  };

  const loadFinancialReport = async () => {
    try {
      const res = await reportService.getFinancialByPaymentMethod();
      const data = res.data?.financial || res.data?.data || res.financial || [];
      setFinancialReport(data);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar relatório financeiro');
    }
  };

  const handleSalesFilterChange = (e) => {
    const { name, value } = e.target;
    setSalesFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Acompanhe métricas importantes</p>
      </div>

      {/* Sales Report */}
      <section className="bg-white rounded-lg shadow-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Relatório de Vendas
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="date"
              name="start_date"
              value={salesFilters.start_date}
              onChange={handleSalesFilterChange}
              className="border px-2 py-1 rounded"
            />
            <input
              type="date"
              name="end_date"
              value={salesFilters.end_date}
              onChange={handleSalesFilterChange}
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Passeio ID"
              name="trip_id"
              value={salesFilters.trip_id}
              onChange={handleSalesFilterChange}
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Vendedor ID"
              name="vendor_id"
              value={salesFilters.vendor_id}
              onChange={handleSalesFilterChange}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={loadSalesReport}
              className="bg-zapchat-medium text-white px-3 py-1 rounded"
            >
              Filtrar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Vendedor</th>
                <th className="px-4 py-2 text-left">Passeio</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesReport.map((r, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{r.seller_name}</td>
                  <td className="px-4 py-2">{r.trip_title}</td>
                  <td className="px-4 py-2 text-right">{r.total}</td>
                </tr>
              ))}
              {salesReport.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                    Nenhum dado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Trip Report */}
      <section className="bg-white rounded-lg shadow-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Relatório Diário de Passeios
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={loadDailyTrips}
              className="bg-zapchat-medium text-white px-3 py-1 rounded"
            >
              Filtrar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Passeio</th>
                <th className="px-4 py-2 text-right">Vendas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyTrips.map((r, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">{r.trip_title}</td>
                  <td className="px-4 py-2 text-right">{r.sales}</td>
                </tr>
              ))}
              {dailyTrips.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                    Nenhum dado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Seller Productivity Report */}
      <section className="bg-white rounded-lg shadow-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Produtividade dos Vendedores
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Vendedor</th>
                <th className="px-4 py-2 text-right">Vendas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productivity.map((r, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{r.seller_name}</td>
                  <td className="px-4 py-2 text-right">{r.sales}</td>
                </tr>
              ))}
              {productivity.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-4 py-2 text-center text-gray-500">
                    Nenhum dado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Financial Report */}
      <section className="bg-white rounded-lg shadow-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Financeiro por Forma de Pagamento
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Forma</th>
                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {financialReport.map((r, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{r.payment_method}</td>
                  <td className="px-4 py-2 text-right">{r.total}</td>
                </tr>
              ))}
              {financialReport.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-4 py-2 text-center text-gray-500">
                    Nenhum dado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Reports;
