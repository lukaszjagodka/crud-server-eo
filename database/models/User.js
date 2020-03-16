
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    token: DataTypes.STRING,
    authtoken: DataTypes.STRING,
  }, {
    tableName: 'users',
  });
  User.associate = (models) => {
    User.hasOne(models.Account, { foreignKey: 'userId' });
    User.hasMany(models.Transaction, { foreignKey: 'userId' });
  };
  return User;
};
