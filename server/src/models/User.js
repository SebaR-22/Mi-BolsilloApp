const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING,
    },
    theme: {
        type: DataTypes.STRING,
        defaultValue: 'light', // light or dark
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // user or admin
    }
}, {
    timestamps: true,
});

module.exports = User;
