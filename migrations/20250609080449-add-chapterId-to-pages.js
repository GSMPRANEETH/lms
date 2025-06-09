'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Pages', 'chapterId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Chapters',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Pages', 'chapterId');
  }
};
