'use strict';
module.exports = (sequelize, DataTypes) => {
  var HashtagTweet = sequelize.define('HashtagTweet', {}, {
    indexes: [
      { fields: ['hashtagId'] }
    ]
  });

  HashtagTweet.associate = function (models) {
    HashtagTweet.belongsTo(models.Tweet, {
      foreignKey: 'tweetId',
      as: 'tweet',
      onDelete: 'cascade'
    });
    HashtagTweet.belongsTo(models.Hashtag, {
      foreignKey: 'hashtagId',
      as: 'hashtag',
      onDelete: 'cascade'
    });
  };

  return HashtagTweet;
};
