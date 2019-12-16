'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    name: DataTypes.STRING,
    value: DataTypes.INTEGER,
    type: DataTypes.STRING
  }, {});
  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User);
  };
  return Transaction;
};