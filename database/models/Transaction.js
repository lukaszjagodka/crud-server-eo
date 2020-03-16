
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    name: DataTypes.STRING,
    value: DataTypes.INTEGER,
    type: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    tableName: 'transactions',
  });
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: 'userId' });
  };
  return Transaction;
};
