import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Client", {
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    address: { type: DataTypes.STRING(255), allowNull: true }
  }, { tableName: "clients" });
};
