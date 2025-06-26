const { sequelize, Sale, SaleAccessory, Accessory, Company, Customer, Trip, User } = require('../models');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Sale hooks with accessories', () => {
  let company, user, customer, trip, accessory;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    company = await Company.create({
      name: 'Test Co',
      cnpj: '12345678000190',
      email: 'co@test.com'
    });
    user = await User.create({
      firstName: 'Seller',
      lastName: 'User',
      email: 'seller@test.com',
      password: 'secret',
      company_id: company.id
    });
    customer = await Customer.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      phone: '11999999999',
      company_id: company.id
    });
    trip = await Trip.create({
      title: 'Trip',
      maxPassengers: 10,
      priceTrips: 0,
      type: 'turismo',
      color: '#FFFFFF',
      company_id: company.id
    });
    accessory = await Accessory.create({
      name: 'Hat',
      value: 10,
      company_id: company.id
    });
  });

  test('adding accessory recalculates total_amount', async () => {
    const sale = await Sale.create({
      subtotal: 100,
      discount_amount: 0,
      tax_amount: 0,
      trip_id: trip.id,
      customer_id: customer.id,
      company_id: company.id,
      seller_id: user.id,
      created_by: user.id
    });

    await SaleAccessory.create({ sale_id: sale.id, accessory_id: accessory.id, quantity: 2 });
    await sale.reload({ include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }] });
    sale.changed('total_amount', true);
    await sale.save();
    const updated = await Sale.findByPk(sale.id);
    expect(parseFloat(updated.total_amount)).toBeCloseTo(120);
  });

  test('removing accessory recalculates total_amount', async () => {
    const sale = await Sale.create({
      subtotal: 100,
      discount_amount: 0,
      tax_amount: 0,
      trip_id: trip.id,
      customer_id: customer.id,
      company_id: company.id,
      seller_id: user.id,
      created_by: user.id
    });

    const sa = await SaleAccessory.create({ sale_id: sale.id, accessory_id: accessory.id, quantity: 1 });
    await sale.reload({ include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }] });
    sale.changed('total_amount', true);
    await sale.save();
    expect(parseFloat(sale.total_amount)).toBeCloseTo(110);

    await sa.destroy();
    await sale.reload({ include: [{ model: SaleAccessory, as: 'sale_accessories', include: [{ model: Accessory, as: 'accessory' }] }] });
    sale.changed('total_amount', true);
    await sale.save();
    const updated = await Sale.findByPk(sale.id);
    expect(parseFloat(updated.total_amount)).toBeCloseTo(100);
  });
});
