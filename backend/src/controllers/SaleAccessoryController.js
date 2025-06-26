const { Sale, Accessory, SaleAccessory } = require('../models');
const { validationResult } = require('express-validator');

// Helper utilizado pelos métodos abaixo para atualizar valores de uma venda
// com base nos acessórios atualmente associados. Os hooks do modelo Sale
// também realizam esse cálculo ao salvar, mas o controller mantém a lógica
// explícita para clareza e para ações que não disparam hooks automaticamente.
function recalcTotals(sale) {
  const subtotal = parseFloat(sale.subtotal) || 0;
  const discount = parseFloat(sale.discount_amount) || 0;
  const tax = parseFloat(sale.tax_amount) || 0;
  let accessoriesTotal = 0;
  if (Array.isArray(sale.sale_accessories)) {
    sale.sale_accessories.forEach(sa => {
      const qty = parseInt(sa.quantity || 1);
      const value = parseFloat(sa.accessory?.value || 0);
      accessoriesTotal += qty * value;
    });
  }
  sale.total_amount = subtotal - discount + tax + accessoriesTotal;
  if (sale.commission_percentage) {
    sale.commission_amount = (sale.total_amount * parseFloat(sale.commission_percentage)) / 100;
  }
}

class SaleAccessoryController {
  static async index(req, res) {
    try {
      const { id } = req.params;
      const sale = await Sale.findByPk(id, {
        include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }]
      });
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }
      if (!req.user.isMaster() && sale.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      return res.json({ success: true, data: sale.sale_accessories });
    } catch (error) {
      console.error('Erro ao listar acessórios da venda:', error);
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
      const { accessory_id, quantity = 1 } = req.body;
      const sale = await Sale.findByPk(id, {
        include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }]
      });
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }
      if (!req.user.isMaster() && sale.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      const accessory = await Accessory.findByPk(accessory_id);
      if (!accessory || accessory.company_id !== sale.company_id) {
        return res.status(404).json({ success: false, message: 'Acessório não encontrado' });
      }
      const saleAccessory = await SaleAccessory.create({ sale_id: id, accessory_id, quantity });
      // Recarrega a venda com a associação de acessórios para que o hook
      // `beforeUpdate` do modelo possa recalcular `total_amount` corretamente.
      await sale.reload({ include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }] });
      recalcTotals(sale);
      await sale.save();
      return res.status(201).json({ success: true, message: 'Acessório adicionado', data: { saleAccessory, sale } });
    } catch (error) {
      console.error('Erro ao adicionar acessório:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  static async destroy(req, res) {
    try {
      const { id, sale_accessory_id } = req.params;
      const saleAccessory = await SaleAccessory.findByPk(sale_accessory_id);
      if (!saleAccessory || saleAccessory.sale_id !== id) {
        return res.status(404).json({ success: false, message: 'Registro não encontrado' });
      }
      const sale = await Sale.findByPk(id, {
        include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }]
      });
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venda não encontrada' });
      }
      if (!req.user.isMaster() && sale.company_id !== req.user.company_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      await saleAccessory.destroy();
      // Após remover, recarrega a venda para que o hook `beforeUpdate`
      // considere os acessórios restantes no cálculo do total.
      await sale.reload({ include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }] });
      recalcTotals(sale);
      await sale.save();
      return res.json({ success: true, message: 'Acessório removido', data: { sale } });
    } catch (error) {
      console.error('Erro ao remover acessório:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }
}

module.exports = SaleAccessoryController;
