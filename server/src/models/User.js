import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      role: {
        type: DataTypes.ENUM("ADMIN", "EMPLOYEE"),
        allowNull: false,
        defaultValue: "EMPLOYEE",
      },

      // Login
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      // ✅ Employee display ID (starts from 1 for employees only)
      employeeCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },

      // Employee details
      firstName: { type: DataTypes.STRING(80), allowNull: true },
      lastName: { type: DataTypes.STRING(80), allowNull: true },
      address: { type: DataTypes.STRING(255), allowNull: true },
      phone: { type: DataTypes.STRING(40), allowNull: true },
    },
    {
      tableName: "users",
    }
  );

  User.prototype.verifyPassword = async function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
  };

  return User;
};
