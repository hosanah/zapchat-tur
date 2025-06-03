const { sequelize } = require('../config/database');

// Importar modelos
const Company = require('./Company');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Customer = require('./Customer');
const Trip = require('./Trip');
const Booking = require('./Booking');
const Event = require('./Event');
const Sale = require('./Sale');

// Inicializar modelos
const CompanyModel = Company(sequelize);
const UserModel = User(sequelize);
const VehicleModel = Vehicle(sequelize);
const DriverModel = Driver(sequelize);
const CustomerModel = Customer(sequelize);
const TripModel = Trip(sequelize);
const BookingModel = Booking(sequelize);
const EventModel = Event(sequelize);
const SaleModel = Sale(sequelize);

// Definir associações
// Company associations
CompanyModel.hasMany(UserModel, {
  foreignKey: 'company_id',
  as: 'users'
});

CompanyModel.hasMany(VehicleModel, {
  foreignKey: 'company_id',
  as: 'vehicles'
});

CompanyModel.hasMany(DriverModel, {
  foreignKey: 'company_id',
  as: 'drivers'
});

CompanyModel.hasMany(CustomerModel, {
  foreignKey: 'company_id',
  as: 'customers'
});

CompanyModel.hasMany(TripModel, {
  foreignKey: 'company_id',
  as: 'trips'
});

CompanyModel.hasMany(EventModel, {
  foreignKey: 'company_id',
  as: 'events'
});

CompanyModel.hasMany(SaleModel, {
  foreignKey: 'company_id',
  as: 'sales'
});

// User associations
UserModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

UserModel.hasMany(EventModel, {
  foreignKey: 'created_by',
  as: 'created_events'
});

UserModel.hasMany(SaleModel, {
  foreignKey: 'created_by',
  as: 'created_sales'
});

// Vehicle associations
VehicleModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

VehicleModel.hasMany(TripModel, {
  foreignKey: 'vehicle_id',
  as: 'trips'
});

// Driver associations
DriverModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

DriverModel.hasMany(TripModel, {
  foreignKey: 'driver_id',
  as: 'trips'
});

// Customer associations
CustomerModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

CustomerModel.hasMany(BookingModel, {
  foreignKey: 'customer_id',
  as: 'bookings'
});

CustomerModel.hasMany(SaleModel, {
  foreignKey: 'customer_id',
  as: 'sales'
});

// Trip associations
TripModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

TripModel.belongsTo(VehicleModel, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

TripModel.belongsTo(DriverModel, {
  foreignKey: 'driver_id',
  as: 'driver'
});

TripModel.hasMany(BookingModel, {
  foreignKey: 'trip_id',
  as: 'bookings'
});

TripModel.hasMany(EventModel, {
  foreignKey: 'trip_id',
  as: 'events'
});

// Booking associations
BookingModel.belongsTo(CustomerModel, {
  foreignKey: 'customer_id',
  as: 'customer'
});

BookingModel.belongsTo(TripModel, {
  foreignKey: 'trip_id',
  as: 'trip'
});

// Event associations
EventModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

EventModel.belongsTo(TripModel, {
  foreignKey: 'trip_id',
  as: 'trip'
});

EventModel.belongsTo(UserModel, {
  foreignKey: 'created_by',
  as: 'creator'
});

EventModel.hasMany(SaleModel, {
  foreignKey: 'event_id',
  as: 'sales'
});

// Sale associations
SaleModel.belongsTo(CompanyModel, {
  foreignKey: 'company_id',
  as: 'company'
});

SaleModel.belongsTo(CustomerModel, {
  foreignKey: 'customer_id',
  as: 'customer'
});

SaleModel.belongsTo(EventModel, {
  foreignKey: 'event_id',
  as: 'event'
});

SaleModel.belongsTo(UserModel, {
  foreignKey: 'created_by',
  as: 'creator'
});

module.exports = {
  sequelize,
  Company: CompanyModel,
  User: UserModel,
  Vehicle: VehicleModel,
  Driver: DriverModel,
  Customer: CustomerModel,
  Trip: TripModel,
  Booking: BookingModel,
  Event: EventModel,
  Sale: SaleModel
};

