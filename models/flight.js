"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Flight.hasMany(models.BookingDetails, {
        foreignKey: 'flight_id',
        as: 'details'
      })
    }
  }
  Flight.init(
    {
      airline: DataTypes.STRING,
      airline_logo: DataTypes.STRING,
      origin: DataTypes.STRING,
      origin_city: DataTypes.STRING,
      destination: DataTypes.STRING,
      destination_city: DataTypes.STRING,
      departure: DataTypes.DATE,
      arrival: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Flight",
    }
  );
  return Flight;
};
