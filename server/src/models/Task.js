import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Task", {
    taskName: { type: DataTypes.STRING(200), allowNull: false },
    service: {
      type: DataTypes.ENUM("Accounting", "It-return", "GST", "Data-entry"),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "follow-up", "reverted of client", "completed", "in-progress"),
      allowNull: false,
      defaultValue: "pending"
    }
  }, { tableName: "tasks" });
};
