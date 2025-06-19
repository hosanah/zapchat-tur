const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Informações básicas da venda
  sale_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Número único da venda (ex: VND-2024-001)'
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada da venda'
  },
  
  // Valores financeiros
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Subtotal deve ser um valor positivo'
      }
    },
    comment: 'Valor subtotal da venda'
  },
  
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Desconto deve ser um valor positivo'
      }
    },
    comment: 'Valor do desconto em reais'
  },
  
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Percentual de desconto deve ser positivo'
      },
      max: {
        args: [100],
        msg: 'Percentual de desconto não pode ser maior que 100%'
      }
    },
    comment: 'Percentual de desconto aplicado'
  },
  
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Valor de impostos deve ser positivo'
      }
    },
    comment: 'Valor dos impostos'
  },
  
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Valor total deve ser positivo'
      }
    },
    comment: 'Valor total da venda (subtotal - desconto + impostos)'
  },
  
  // Comissões
  commission_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Percentual de comissão deve ser positivo'
      },
      max: {
        args: [100],
        msg: 'Percentual de comissão não pode ser maior que 100%'
      }
    },
    comment: 'Percentual de comissão do vendedor'
  },
  
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Valor da comissão deve ser positivo'
      }
    },
    comment: 'Valor da comissão calculada'
  },
  
  // Status da venda
  status: {
    type: DataTypes.ENUM('orcamento', 'pendente', 'confirmada', 'paga', 'cancelada', 'reembolsada'),
    defaultValue: 'orcamento',
    allowNull: false,
    comment: 'Status atual da venda'
  },
  
  priority: {
    type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
    defaultValue: 'media',
    allowNull: false,
    comment: 'Prioridade da venda'
  },
  
  
  payment_status: {
    type: DataTypes.ENUM('pendente', 'parcial', 'pago', 'atrasado', 'cancelado'),
    defaultValue: 'pendente',
    allowNull: false,
    comment: 'Status do pagamento'
  },
  
  // Datas importantes
  sale_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data da venda'
  },
  
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de vencimento do pagamento'
  },
  
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data do pagamento'
  },
  
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de entrega/realização do serviço'
  },
  
  // Parcelamento
  installments: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Número de parcelas deve ser pelo menos 1'
      },
      max: {
        args: [24],
        msg: 'Número máximo de parcelas é 24'
      }
    },
    comment: 'Número de parcelas'
  },
  
  // Observações
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações públicas da venda'
  },
  
  internal_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas (não visíveis ao cliente)'
  },

  // Relacionamentos obrigatórios
  trip_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'trips',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'Passeio associado à venda (obrigatório)'
  },

  driver_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'drivers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Motorista responsável pelo passeio'
  },

  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'vehicles',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Veículo utilizado no passeio'
  },


  // Cliente responsável pela venda
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'Cliente responsável pela venda'
  },
  
  
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: 'Empresa responsável pela venda'
  },

  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'Usuário vendedor da venda'
  },
  
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que criou a venda'
  }
}, {
  tableName: 'sales',
  indexes: [
    {
      unique: true,
      fields: ['sale_number']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['sale_date']
    },
    {
      fields: ['due_date']
    },
    {
      fields: ['trip_id']
    },
    {
      fields: ['driver_id']
    },
    {
      fields: ['vehicle_id']
    },
    {
      fields: ['seller_id']
    },
    {
      fields: ['company_id', 'status']
    },
    {
      fields: ['company_id', 'sale_date']
    }
  ],
  hooks: {
    beforeValidate: (sale) => {
      // Calcular valor total
      const subtotal = parseFloat(sale.subtotal) || 0;
      const discountAmount = parseFloat(sale.discount_amount) || 0;
      const taxAmount = parseFloat(sale.tax_amount) || 0;
      
      sale.total_amount = subtotal - discountAmount + taxAmount;
      
      // Calcular comissão
      if (sale.commission_percentage && sale.total_amount) {
        sale.commission_amount = (sale.total_amount * sale.commission_percentage) / 100;
      }
      
      // Gerar número da venda se não existir
      if (!sale.sale_number) {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        sale.sale_number = `VND-${year}-${timestamp}`;
      }
    },
    
    beforeUpdate: (sale) => {
      // Recalcular valores na atualização
      const subtotal = parseFloat(sale.subtotal) || 0;
      const discountAmount = parseFloat(sale.discount_amount) || 0;
      const taxAmount = parseFloat(sale.tax_amount) || 0;
      
      sale.total_amount = subtotal - discountAmount + taxAmount;
      
      if (sale.commission_percentage && sale.total_amount) {
        sale.commission_amount = (sale.total_amount * sale.commission_percentage) / 100;
      }
    }
  }
});

// Métodos de instância
Sale.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Formatar valores monetários
  if (values.subtotal) values.subtotal = parseFloat(values.subtotal);
  if (values.discount_amount) values.discount_amount = parseFloat(values.discount_amount);
  if (values.tax_amount) values.tax_amount = parseFloat(values.tax_amount);
  if (values.total_amount) values.total_amount = parseFloat(values.total_amount);
  if (values.commission_amount) values.commission_amount = parseFloat(values.commission_amount);
  
  return values;
};

Sale.prototype.isOverdue = function() {
  if (!this.due_date || this.payment_status === 'pago') return false;
  return new Date(this.due_date) < new Date();
};

Sale.prototype.getDaysUntilDue = function() {
  if (!this.due_date) return null;
  const today = new Date();
  const dueDate = new Date(this.due_date);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Métodos estáticos
Sale.findByCompany = function(company_id, options = {}) {
  return this.findAll({
    where: { company_id: company_id },
    order: [['sale_date', 'DESC']],
    ...options
  });
};

Sale.findByCustomer = function(customerId, options = {}) {
  return this.findAll({
    where: { customer_id: customerId },
    order: [['sale_date', 'DESC']],
    ...options
  });
};

Sale.findByStatus = function(company_id, status, options = {}) {
  return this.findAll({
    where: { 
      company_id: company_id,
      status: status 
    },
    order: [['sale_date', 'DESC']],
    ...options
  });
};

Sale.findOverdue = function(company_id) {
  return this.findAll({
    where: {
      company_id: company_id,
      due_date: {
        [DataTypes.Op.lt]: new Date()
      },
      payment_status: {
        [DataTypes.Op.notIn]: ['pago', 'cancelado']
      }
    },
    order: [['due_date', 'ASC']]
  });
};

Sale.getStats = function(company_id, startDate = null, endDate = null) {
  const whereClause = { company_id: company_id };
  
  if (startDate && endDate) {
    whereClause.sale_date = {
      [DataTypes.Op.between]: [startDate, endDate]
    };
  }
  
  return this.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_sales'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
      [sequelize.fn('SUM', sequelize.col('commission_amount')), 'total_commission'],
      [sequelize.fn('AVG', sequelize.col('total_amount')), 'average_sale']
    ],
    raw: true
  });
};

module.exports = Sale;

