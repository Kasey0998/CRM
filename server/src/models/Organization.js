import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Organization", {
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true }
  }, { tableName: "organizations" });
};
