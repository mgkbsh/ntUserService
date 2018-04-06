'use strict';
module.exports = (sequelize, DataTypes) => {
  var Like = sequelize.define('Like', {}, {
    indexes: [
      { fields: ['tweetId'] }
    ],
    defaultScope: {
      order: [['createdAt', 'desc']]
    }
  });

  Like.associate = function(models) {
    Like.belongsTo(models.Tweet, {
      foreignKey: 'tweetId',
      as: 'tweet',
      onDelete: 'cascade'
    });
    Like.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'cascade'
    });
  };

  return Like;
};
