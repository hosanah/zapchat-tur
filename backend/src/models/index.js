const { sequelize } = require('../config/database');

// Importar modelos
const Company = require('./Company');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Customer = require('./Customer');
const Trip = require('./Trip');
const Booking = require('./Booking');

// Definir associações
// Company associations
Company.hasMany(User, {
  foreignKey: 'companyId',
  as: 'users'
});

Company.hasMany(Vehicle, {
  foreignKey: 'companyId',
  as: 'vehicles'
});

Company.hasMany(Driver, {
  foreignKey: 'companyId',
  as: 'drivers'
});

Company.hasMany(Customer, {
  foreignKey: 'companyId',
  as: 'customers'
});

Company.hasMany(Trip, {
  foreignKey: 'companyId',
  as: 'trips'
});

// User associations
User.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'Company'
});

// Vehicle associations
Vehicle.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'Company'
});

Vehicle.hasMany(Trip, {
  foreignKey: 'vehicleId',
  as: 'trips'
});

// Driver associations
Driver.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'Company'
});

Driver.hasMany(Trip, {
  foreignKey: 'driverId',
  as: 'trips'
});

// Customer associations
Customer.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'Company'
});

Customer.hasMany(Booking, {
  foreignKey: 'customerId',
  as: 'bookings'
});

// Trip associations
Trip.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'Company'
});

Trip.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'Vehicle'
});

Trip.belongsTo(Driver, {
  foreignKey: 'driverId',
  as: 'Driver'
});

Trip.hasMany(Booking, {
  foreignKey: 'tripId',
  as: 'Bookings'
});

// Booking associations
Booking.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'Customer'
});

Booking.belongsTo(Trip, {
  foreignKey: 'tripId',
  as: 'Trip'
});

module.exports = {
  sequelize,
  Company,
  User,
  Vehicle,
  Driver,
  Customer,
  Trip,
  Booking
};

