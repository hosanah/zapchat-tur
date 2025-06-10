const { sequelize } = require('../config/database');

// Importar modelos (já inicializados)
const Company = require('./Company');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Customer = require('./Customer');
const Trip = require('./Trip');
const Booking = require('./Booking');
const Event = require('./Event');
const Sale = require('./Sale');
const Seller = require('./Seller');
const SaleCustomer = require('./SaleCustomer');

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

Company.hasMany(Event, {
  foreignKey: 'company_id',
  as: 'events'
});

Company.hasMany(Sale, {
  foreignKey: 'company_id',
  as: 'sales'
});

Company.hasMany(Seller, {
  foreignKey: 'company_id',
  as: 'sellers'
});

// User associations
User.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

User.hasMany(Event, {
  foreignKey: 'created_by',
  as: 'created_events'
});

User.hasMany(Sale, {
  foreignKey: 'created_by',
  as: 'created_sales'
});

User.hasMany(Seller, {
  foreignKey: 'created_by',
  as: 'created_sellers'
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

Seller.belongsTo(Company, {
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

Trip.hasMany(Event, {
  foreignKey: 'trip_id',
  as: 'events'
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

// Event associations
Event.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

Event.belongsTo(Trip, {
  foreignKey: 'trip_id',
  as: 'trip'
});

Event.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'users'
});

Event.hasMany(Sale, {
  foreignKey: 'event_id',
  as: 'sales'
});

// Seller associations
Seller.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'users'
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

Sale.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
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

Sale.belongsTo(Seller, {
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

Seller.hasMany(Sale, {
  foreignKey: 'seller_id',
  as: 'sales'
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
  Event,
  Sale,
  Seller,
  SaleCustomer
};

