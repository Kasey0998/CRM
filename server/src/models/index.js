import { sequelize } from "../config/db.js";

import UserModel from "./User.js";
import ClientModel from "./Client.js";
import OrganizationModel from "./Organization.js";
import OrganizationClientModel from "./OrganizationClient.js";
import TaskModel from "./Task.js";

export const User = UserModel(sequelize);
export const Client = ClientModel(sequelize);
export const Organization = OrganizationModel(sequelize);
export const OrganizationClient = OrganizationClientModel(sequelize);
export const Task = TaskModel(sequelize);

// Relations
Organization.belongsToMany(Client, { through: OrganizationClient, foreignKey: "organizationId" });
Client.belongsToMany(Organization, { through: OrganizationClient, foreignKey: "clientId" });

Task.belongsTo(Client, { foreignKey: { name: "clientId", allowNull: false } });
Task.belongsTo(Organization, { foreignKey: { name: "organizationId", allowNull: false } });

Task.belongsTo(User, { as: "createdBy", foreignKey: { name: "createdByUserId", allowNull: false } });
Task.belongsTo(User, { as: "assignedTo", foreignKey: { name: "assignedToUserId", allowNull: true } });

export async function syncDb() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); // simple dev mode
}
