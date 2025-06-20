const { sequelize } = require('../config/database');

// Importar modelos (já inicializados)
const Company = require('./Company');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Customer = require('./Customer');
const Trip = require('./Trip');
const Booking = require('./Booking');
const Sale = require('./Sale');
const SaleCustomer = require('./SaleCustomer');
const SalePayment = require('./SalePayment');
const Accessory = require('./Accessory');
const SaleAccessory = require('./SaleAccessory');
const GeneralSetting = require('./GeneralSetting');
const Notification = require('./Notification');

// Definir associações
// Company associations
Company.hasMany(User, {
  foreignKey: 'company_id',
  as: 'users'
});

Company.hasMany(Vehicle, {
  foreignKey: 'company_id',
  as: 'vehicles'
});

Company.hasMany(Driver, {
  foreignKey: 'company_id',
  as: 'drivers'
});

Company.hasMany(Customer, {
  foreignKey: 'company_id',
  as: 'customers'
});

Company.hasMany(Trip, {
  foreignKey: 'company_id',
  as: 'trips'
});

Company.hasMany(Accessory, {
  foreignKey: 'company_id',
  as: 'accessories'
});

Company.hasOne(GeneralSetting, {
  foreignKey: 'company_id',
  as: 'general_setting'
});

GeneralSetting.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

Accessory.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});


Company.hasMany(Sale, {
  foreignKey: 'company_id',
  as: 'sales'
});


// User associations
User.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});


User.hasMany(Sale, {
  foreignKey: 'created_by',
  as: 'created_sales'
});
User.hasMany(Sale, {
  foreignKey: 'seller_id',
  as: 'sales_as_seller'
});
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications'
});
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});


// Vehicle associations
Vehicle.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

Vehicle.hasMany(Trip, {
  foreignKey: 'vehicle_id',
  as: 'trips'
});

// Driver associations
Driver.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});


Driver.hasMany(Trip, {
  foreignKey: 'driver_id',
  as: 'trips'
});

// Customer associations
Customer.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

Customer.hasMany(Booking, {
  foreignKey: 'customer_id',
  as: 'bookings'
});

Customer.hasMany(Sale, {
  foreignKey: 'customer_id',
  as: 'sales'
});

// Trip associations
Trip.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});


Trip.hasMany(Booking, {
  foreignKey: 'trip_id',
  as: 'bookings'
});


Trip.hasMany(Sale, {
  foreignKey: 'trip_id',
  as: 'sales'
});

// Booking associations
Booking.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

Booking.belongsTo(Trip, {
  foreignKey: 'trip_id',
  as: 'trip'
});






// Sale associations
Sale.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

Sale.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});


Sale.belongsTo(Trip, {
  foreignKey: 'trip_id',
  as: 'trip'
});

Sale.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

Sale.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});


Sale.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

Sale.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'users'
});


// Relacionamento N:N entre Sale e Customer através de SaleCustomer
Sale.belongsToMany(Customer, {
  through: SaleCustomer,
  foreignKey: 'sale_id',
  otherKey: 'customer_id',
  as: 'customers'
});

Customer.belongsToMany(Sale, {
  through: SaleCustomer,
  foreignKey: 'customer_id',
  otherKey: 'sale_id',
  as: 'sales_as_participant'
});

// Relacionamentos diretos com SaleCustomer
Sale.hasMany(SaleCustomer, {
  foreignKey: 'sale_id',
  as: 'sale_customers'
});

SaleCustomer.belongsTo(Sale, {
  foreignKey: 'sale_id',
  as: 'sale'
});

SaleCustomer.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

SalePayment.belongsTo(Sale, {
  foreignKey: 'sale_id',
  as: 'sale'
});

Customer.hasMany(SaleCustomer, {
  foreignKey: 'customer_id',
  as: 'sale_customers'
});

// Relacionamentos adicionais para os novos campos
Driver.hasMany(Sale, {
  foreignKey: 'driver_id',
  as: 'sales'
});

Vehicle.hasMany(Sale, {
  foreignKey: 'vehicle_id',
  as: 'sales'
});

Sale.belongsToMany(Accessory, {
  through: SaleAccessory,
  foreignKey: 'sale_id',
  otherKey: 'accessory_id',
  as: 'accessories'
});

Accessory.belongsToMany(Sale, {
  through: SaleAccessory,
  foreignKey: 'accessory_id',
  otherKey: 'sale_id',
  as: 'sales'
});

Sale.hasMany(SaleAccessory, {
  foreignKey: 'sale_id',
  as: 'sale_accessories'
});

SaleAccessory.belongsTo(Sale, {
  foreignKey: 'sale_id',
  as: 'sale'
});

SaleAccessory.belongsTo(Accessory, {
  foreignKey: 'accessory_id',
  as: 'accessory'
});

Accessory.hasMany(SaleAccessory, {
  foreignKey: 'accessory_id',
  as: 'sale_accessories'
});

Sale.hasMany(SalePayment, {
  foreignKey: 'sale_id',
  as: 'payments'
});



module.exports = {
  sequelize,
  Company,
  User,
  Vehicle,
  Driver,
  Customer,
  Trip,
  Booking,
  Sale,
  SaleCustomer,
  SalePayment,
  Accessory,
  SaleAccessory,
  GeneralSetting,
  Notification
};

