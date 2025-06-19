const { Sale, SalePayment } = require('../models');
const { validationResult } = require('express-validator');

class SalePaymentController {
  static async index(req, res) {
    try {
      const { id } = req.params;
      const sale = await Sale.findByPk(id, {
        include: [{ model: SalePayment, as: 'payments' }]
      });
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }
      if (!req.user.isMaster() && sale.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      return res.json({ success: true, data: { payments: sale.payments } });
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  static async store(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
      }
      const { id } = req.params;
      const { amount, payment_method, payment_date, notes } = req.body;
      const sale = await Sale.findByPk(id, { include: [{ model: SalePayment, as: 'payments' }] });
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }
      if (!req.user.isMaster() && sale.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      const totalPaid = sale.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
      if (totalPaid + parseFloat(amount) > parseFloat(sale.total_amount)) {
        return res.status(400).json({ success: false, message: 'Valor pago excede o total da venda' });
      }
      const payment = await SalePayment.create({
        sale_id: id,
        amount,
        payment_method,
        payment_date,
        notes
      });
      return res.status(201).json({ success: true, data: { payment } });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  static async destroy(req, res) {
    try {
      const { id, payment_id } = req.params;
      const payment = await SalePayment.findByPk(payment_id);
      if (!payment || payment.sale_id !== id) {
        return res.status(404).json({ success: false, message: 'Pagamento não encontrado' });
      }
      const sale = await Sale.findByPk(payment.sale_id);
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }
      if (!req.user.isMaster() && sale.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      await payment.destroy();
      return res.json({ success: true, message: 'Pagamento removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover pagamento:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }
}

module.exports = SalePaymentController;
