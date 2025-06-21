module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'roles',
    timestamps: true
  });

  return Role;
};
