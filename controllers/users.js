const models = require('../models');
const sequelize = require('sequelize');

module.exports.follow = async (req, res) => {
  res.status(200).send('success');

  var follower = req.query.followerId;
  var followee = req.query.followeeId;

  try {
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

  } catch (err) {

  }
};

module.exports.unfollow = async (req, res) => {
  res.status(200).send('success')

  var follower = req.query.followerId;
  var followee = req.query.followeeId;

  try {
    var relationships = await models.Relationship.destroy({
       where: {
         followerId: follower,
         followeeId: followee
       }
    });

    if (relationships >= 0) {
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
  var id = req.query.id

  try {
    var user = await models.User.findOne({
      where: { id: id },
      attributes: ['fname', 'lname', 'numFollowers', 'numFollowees', 'numTweets']
    })

    res.json(user);

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
  var id = req.query.id;

  try {
    var followers = await models.Relationship.findAll({
      where: { followeeId: id },
      include: [{
        model: models.User,
        as: 'follower',
        attributes: ['username', 'fname', 'lname']
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
//         "follower": {
//             "fullName": "hey hey",
//             "username": "hey",
//             "fname": "hey",
//             "lname": "hey"
//         }
//     }
// ]
module.exports.getFollowees = async (req, res) => {
  var id = req.query.id;

  try {
    var followees = await models.Relationship.findAll({
      where: { followerId: id },
      include: [{
        model: models.User,
        as: 'follower',
        attributes: ['username', 'fname', 'lname']
      }],
      attributes: ['createdAt']
    });

    res.json(JSON.parse(JSON.stringify(followees)));

  } catch (err) {
    res.status(404).send(err);
  }

}
