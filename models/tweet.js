'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tweet = sequelize.define('Tweet', {
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      { fields: ['userId', 'originalId'] }
    ],
    defaultScope: {
      order: [['createdAt', 'desc']]
    }
  });

  Tweet.associate = models => {
    Tweet.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'cascade'
    });
    Tweet.belongsTo(models.Tweet, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    Tweet.belongsTo(models.Tweet, {
      foreignKey: 'originalId',
      as: 'original'
    });
    Tweet.hasMany(models.Mention);
    Tweet.hasMany(models.HashtagTweet);
    Tweet.hasMany(models.Like);
  };

  return Tweet;
};
