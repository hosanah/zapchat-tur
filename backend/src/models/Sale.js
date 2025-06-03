const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
        min: 0
      },
      comment: 'Valor subtotal (sem descontos/taxas)'
    },
    
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      },
      comment: 'Valor do desconto aplicado'
    },
    
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Percentual de desconto (0-100%)'
    },
    
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      },
      comment: 'Valor de impostos/taxas'
    },
    
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Valor total da venda (subtotal - desconto + taxas)'
    },
    
    // Status e controle
    status: {
      type: DataTypes.ENUM(
        'orcamento',      // Orçamento/cotação
        'pendente',       // Venda pendente de aprovação
        'confirmada',     // Venda confirmada
        'paga',          // Pagamento recebido
        'cancelada',     // Venda cancelada
        'reembolsada'    // Venda reembolsada
      ),
      allowNull: false,
      defaultValue: 'orcamento',
      comment: 'Status atual da venda'
    },
    
    priority: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
      allowNull: false,
      defaultValue: 'media',
      comment: 'Prioridade da venda'
    },
    
    // Informações de pagamento
    payment_method: {
      type: DataTypes.ENUM(
        'dinheiro',
        'cartao_credito',
        'cartao_debito',
        'pix',
        'transferencia',
        'boleto',
        'parcelado',
        'outros'
      ),
      allowNull: true,
      comment: 'Método de pagamento utilizado'
    },
    
    payment_status: {
      type: DataTypes.ENUM(
        'pendente',
        'parcial',
        'pago',
        'atrasado',
        'cancelado'
      ),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status do pagamento'
    },
    
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data do pagamento'
    },
    
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de vencimento do pagamento'
    },
    
    installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 24
      },
      comment: 'Número de parcelas (1-24)'
    },
    
    // Datas importantes
    sale_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data da venda'
    },
    
    delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de entrega/realização do serviço'
    },
    
    // Informações adicionais
    commission_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Percentual de comissão (0-100%)'
    },
    
    commission_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      },
      comment: 'Valor da comissão calculada'
    },
    
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações e anotações sobre a venda'
    },
    
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas internas (não visíveis ao cliente)'
    },
    
    // Campos de controle
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a venda está ativa'
    },
    
    // Relacionamentos (foreign keys)
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'ID do cliente'
    },
    
    event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID do evento relacionado (opcional)'
    },
    
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'ID da empresa'
    },
    
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'ID do usuário que criou a venda'
    }
  }, {
    tableName: 'sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    // Índices para performance
    indexes: [
      {
        fields: ['company_id']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['event_id']
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
        fields: ['sale_number'],
        unique: true
      },
      {
        fields: ['company_id', 'status']
      },
      {
        fields: ['company_id', 'sale_date']
      }
    ],
    
    // Hooks para cálculos automáticos
    hooks: {
      beforeValidate: (sale) => {
        // Calcular total_amount
        const subtotal = parseFloat(sale.subtotal) || 0;
        const discount = parseFloat(sale.discount_amount) || 0;
        const tax = parseFloat(sale.tax_amount) || 0;
        
        sale.total_amount = subtotal - discount + tax;
        
        // Calcular commission_amount se commission_percentage foi definido
        if (sale.commission_percentage && sale.commission_percentage > 0) {
          sale.commission_amount = (sale.total_amount * sale.commission_percentage) / 100;
        }
        
        // Gerar sale_number se não existir
        if (!sale.sale_number) {
          const year = new Date().getFullYear();
          const timestamp = Date.now().toString().slice(-6);
          sale.sale_number = `VND-${year}-${timestamp}`;
        }
      }
    }
  });
  
  // Métodos estáticos úteis
  Sale.findByCompany = function(companyId, options = {}) {
    return this.findAll({
      where: { company_id: companyId, is_active: true },
      include: [
        { association: 'customer' },
        { association: 'event' },
        { association: 'company' },
        { association: 'creator' }
      ],
      order: [['sale_date', 'DESC']],
      ...options
    });
  };
  
  Sale.findByStatus = function(status, companyId = null, options = {}) {
    const where = { status, is_active: true };
    if (companyId) where.company_id = companyId;
    
    return this.findAll({
      where,
      include: [
        { association: 'customer' },
        { association: 'event' },
        { association: 'company' },
        { association: 'creator' }
      ],
      order: [['sale_date', 'DESC']],
      ...options
    });
  };
  
  Sale.findByCustomer = function(customerId, options = {}) {
    return this.findAll({
      where: { customer_id: customerId, is_active: true },
      include: [
        { association: 'event' },
        { association: 'company' },
        { association: 'creator' }
      ],
      order: [['sale_date', 'DESC']],
      ...options
    });
  };
  
  Sale.getTotalsByCompany = function(companyId, startDate = null, endDate = null) {
    const where = { company_id: companyId, is_active: true };
    
    if (startDate && endDate) {
      where.sale_date = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }
    
    return this.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount'],
        [sequelize.fn('SUM', sequelize.col('commission_amount')), 'total_commission']
      ],
      group: ['status'],
      raw: true
    });
  };
  
  return Sale;
};

