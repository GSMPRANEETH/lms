'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Enrollments extends Model {
        static associate(models) {
            Enrollments.belongsTo(models.User, { foreignKey: 'userId' });
            Enrollments.belongsTo(models.Courses, { foreignKey: 'courseId' });
        }
    }
    Enrollments.init({
        userId: DataTypes.INTEGER,
        courseId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Enrollments',
    });
    return Enrollments;
};