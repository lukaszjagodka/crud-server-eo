'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    token: DataTypes.STRING,
    authtoken: DataTypes.STRING,
    authTokenExpire: DataTypes.DATE
  }, {
    tableName: 'users'
  });
  User.associate = function(models) {
    User.hasOne(models.Account, {foreignKey: 'userId'});
    User.hasMany(models.Transaction, {foreignKey: 'userId'});
    
  };
  return User;
};