'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('QuizAttempts', 'attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 3,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('QuizAttempts', 'attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // or whatever it was before
    });
  }
};
