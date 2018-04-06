'use strict';
module.exports = (sequelize, DataTypes) => {
  var Mention = sequelize.define('Mention', {}, {
    indexes: [
      { fields: ['userId'] }
    ]
  });

  Mention.associate = function (models) {
    Mention.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'cascade'
    });
    Mention.belongsTo(models.Tweet, {
      foreignKey: 'tweetId',
      as: 'tweet',
      onDelete: 'cascade'
    });
  };

  return Mention;
};
