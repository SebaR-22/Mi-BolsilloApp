const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#000000',
    },
    icon: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    }
}, {
    timestamps: false,
});

module.exports = Category;
