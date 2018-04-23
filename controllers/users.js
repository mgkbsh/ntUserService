require('newrelic')

const models = require('../models');
const sequelize = require('sequelize');
var axios = require('axios')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env]
var cacheURL = config.user_cache
var client=require('../config/redis.js')

module.exports.follow = async (req, res) => {
  try {
    res.status(200).send('success');
    var follower = req.body.followerId;
    var followee = req.body.followeeId;

    var follow = await models.Relationship.create({
      followerId: follower,
      followeeId: followee
    });

    // //deleting the
    client.delAsync("userObj"+follower)
    client.delAsync("userObj"+followee)

    var incFollowers = models.User.update(
      { numFollowers: sequelize.literal(`"Users"."numFollowers" + 1`) },
      { where: { id: followee } });

    var incFollowees = models.User.update(
        { numFollowees: sequelize.literal(`"Users"."numFollowees" + 1`) },
        { where: { id: follower } });

    await sequelize.Promise.join(incFollowers, incFollowees)

  } catch (err) {

  }
};

module.exports.unfollow = async (req, res) => {
  try {
    res.status(200).send('success');

    var follower = req.body.followerId;
    var followee = req.body.followeeId;



    var relationships = await models.Relationship.destroy({
       where: {
         followerId: follower,
         followeeId: followee
       }
    });
    
    client.delAsync("userObj"+follower)
    client.delAsync("userObj"+followee)
    
    if (relationships <= 0) {
      throw new Error("Non-existent relationship");
    }

    var decFollowers = models.User.update(
      { numFollowers: sequelize.literal(`"Users"."numFollowers" - 1`) },
      { where: { id: followee } });

    var decFollowees = models.User.update(
        { numFollowees: sequelize.literal(`"Users"."numFollowees" - 1`) },
        { where: { id: follower } });

    await sequelize.Promise.join(decFollowers, decFollowees);

  } catch (err) {

  }
};

// Example return JSON:
// {
//     "fullName": "yoyo yoyo",
//     "fname": "yoyo",
//     "lname": "yoyo",
//     "numFollowers": 1,
//     "numFollowees": 1,
//     "numTweets": 16
// }
module.exports.getUser = async (req, res) => {
  var id = req.body.id
  var userCacheKey="userObj"+id.toString();  
  var getRequestURL=cacheURL+userCacheKey
  var postURL=cacheURL+'store/'+userCacheKey
  try {
    var result=await client.getAsync(userCacheKey);
    if (result==null) {

      var user = await models.User.findOne({
        where: { id: id },
        attributes: ['id', 'username', 'fname', 'lname', 'numFollowers', 'numFollowees', 'numTweets']
      });

      client.setAsync(userCacheKey, JSON.stringify(user))
      res.json(JSON.parse(JSON.stringify(user)));
    } else {
      res.json(JSON.parse(result));
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

// Gets the people who follow the user.
// Example return JSON:
// [
//     {
//         "createdAt": "2018-04-04T20:03:41.962Z",
//         "follower": {
//             "fullName": "hey hey",
//             "username": "hey",
//             "fname": "hey",
//             "lname": "hey"
//         }
//     }
// ]
module.exports.getFollowers = async (req, res) => {
  try {
    var id = req.body.id;

    var followers = await models.Relationship.findAll({
      where: { followeeId: id },
      include: [{
        model: models.User,
        as: 'follower',
        attributes: ['id', 'username', 'fname', 'lname']
      }],
      attributes: ['createdAt']
    });

    res.json(JSON.parse(JSON.stringify(followers)));

  } catch (err) {
    res.status(404).send(err);
  }

}

// Gets the people whom the user follows.
// Example return JSON:
// [
//     {
//         "createdAt": "2018-04-04T20:03:41.962Z",
//         "followee": {
//             "fullName": "hey hey",
//             "username": "hey",
//             "fname": "hey",
//             "lname": "hey"
//         }
//     }
// ]a
module.exports.getFollowees = async (req, res) => {
  try {
    var id = req.body.id;

    var followees = await models.Relationship.findAll({
      where: { followerId: id },
      include: [{
        model: models.User,
        as: 'followee',
        attributes: ['id', 'username', 'fname', 'lname']
      }],
      attributes: ['createdAt']
    });

    res.json(JSON.parse(JSON.stringify(followees)));

  } catch (err) {
    res.status(404).send(err);
  }

}
