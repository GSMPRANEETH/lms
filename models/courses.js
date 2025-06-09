'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Courses.belongsTo(models.User, {
        foreignKey: 'creatorId',
        onDelete: 'CASCADE'
      });
      Courses.hasMany(models.Chapters, {
        foreignKey: 'courseId',
        onDelete: 'CASCADE'
      });
      Courses.belongsToMany(models.User, {
        through: 'Enrollments',
        foreignKey: 'courseId',
        as: 'enrolledUsers'
      });
    }
  }
  Courses.init({
    name: DataTypes.STRING,
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Courses',
  });
  return Courses;
};