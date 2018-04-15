const models = require('../models');
const sequelize = require('sequelize');
var axios = require('axios')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env]
var cacheURL = config.cache_service

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
  var id = 6
  console.log(id)
  var userCacheKey="userObj"+id.toString();
  var getRequestURL=cacheURL+userCacheKey
  var postURL=cacheURL+'store/'+userCacheKey
  try {
    var response=await axios.get(getRequestURL);
    var result=JSON.parse(response.data)
    if (result==null) {
      // data doesnt exists, will need to get from db and set in cache
      var user = await models.User.findOne({
        where: { id: id },
        attributes: ['id', 'username', 'fname', 'lname', 'numFollowers', 'numFollowees', 'numTweets']
      });
      console.log(JSON.parse(JSON.stringify(user)))
      res.json(JSON.parse(JSON.stringify(user)));
      axios.post(postURL, {params: { cacheKey: userCacheKey, cacheData: JSON.stringify(user)}})
    } else {
      console.log(result)


      // data exists in cache, will get from cache
      res.json(result);
    }
  } catch (err) {
    // console.log(err)
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
