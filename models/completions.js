'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Completions extends Model {
        static associate(models) {
            Completions.belongsTo(models.User, { foreignKey: 'userId' });
            Completions.belongsTo(models.Pages, { foreignKey: 'pageId' });
        }
    }
    Completions.init({
        userId: DataTypes.INTEGER,
        pageId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Completions',
    });
    return Completions;
};