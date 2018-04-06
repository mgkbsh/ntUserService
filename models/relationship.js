'use strict';
module.exports = (sequelize, DataTypes) => {
  var Relationship = sequelize.define('Relationship', {}, {
    indexes: [
      { fields: ['followerId', 'followeeId'] }
    ],
    defaultScope: {
      order: [['createdAt', 'desc']]
    }
  });

  Relationship.associate = function (models) {
    Relationship.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'follower',
      onDelete: 'cascade'
    });
    Relationship.belongsTo(models.User, {
      foreignKey: 'followeeId',
      as: 'followee',
      onDelete: 'cascade'
    });
  };

  return Relationship;
};
