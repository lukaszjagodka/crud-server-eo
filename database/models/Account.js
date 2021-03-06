
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    accountValue: DataTypes.INTEGER,
    accountCode: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    tableName: 'accounts',
  });
  Account.associate = (models) => {
    Account.belongsTo(models.User, { foreignKey: 'userId' });
  };
  return Account;
};
