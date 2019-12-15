'use strict';
module.exports = (sequelize, DataTypes) => {
  const accountTranssaction = sequelize.define('Transsaction', {
    name: DataTypes.STRING,
    value: DataTypes.INTEGER,
    type: DataTypes.STRING
  }, {});
  accountTranssaction.associate = function(models) {
    // associations can be defined here
  };
  return Transsaction;
};