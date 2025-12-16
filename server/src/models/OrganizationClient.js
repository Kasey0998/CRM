import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("OrganizationClient", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }
  }, { tableName: "organization_clients" });
};
