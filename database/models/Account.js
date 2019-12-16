'use strict';
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    accountValue: DataTypes.INTEGER,
    accountCode: DataTypes.STRING
  }, {});
  Account.associate = function(models) {
    Account.belongsTo(models.User)
  };
  return Account;
};