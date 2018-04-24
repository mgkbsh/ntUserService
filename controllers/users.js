require('newrelic')

const models = require('../models');
const sequelize = require('sequelize');
var axios = require('axios')
var client = require('../config/redis')

module.exports.follow = async (req, res) => {
  try {
    res.status(200).send('success');
    var follower = req.body.followerId;
    var followee = req.body.followeeId;

    var follow = await models.Relationship.create({
      followerId: follower,
      followeeId: followee
    });

    var incFollowers = models.User.update(
      { numFollowers: sequelize.literal(`"Users"."numFollowers" + 1`) },
      { where: { id: followee } });

    var incFollowees = models.User.update(
        { numFollowees: sequelize.literal(`"Users"."numFollowees" + 1`) },
        { where: { id: follower } });

    await sequelize.Promise.join(incFollowers, incFollowees)

    client.del('userProfile:' + req.followerId)
    client.del('userProfile:' + req.followeeId)

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

    client.del('userProfile:' + req.followerId)
    client.del('userProfile:' + req.followeeId)

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
  try {
    var id = req.body.id;

    var user = await client.getAsync('userProfile:' + id)

    if (user) {
      return res.json(JSON.parse(user))
    }

    user = await models.User.findOne({
      where: { id: id },
      attributes: ['id', 'username', 'fname', 'lname', 'numFollowers', 'numFollowees', 'numTweets']
    });

    client.set('userProfile:' + id, JSON.stringify(user), 'EX', 60 * 60);

    res.json(user);

  } catch (err) {
    console.log(err)
    // res.status(404).send(err);
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

  }

}
