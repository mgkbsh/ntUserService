const bcrypt = require('bcrypt');

'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fname: { type: DataTypes.STRING },
    lname: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowEmpty: false,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowEmpty: false,
      allowNull: false,
      validate: {
        len: {
          args: 3
        }
      }
    },
    username:  {
      type: DataTypes.STRING,
      allowEmpty: false,
      unique: true,
      allowNull: false,
    },
    numFollowers: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    numFollowees: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    numTweets: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  } , {
    defaultScope: {
      order: [['createdAt', 'desc']]
    },
    getterMethods: {
      fullName: function() {
        return this.fname + ' ' + this.lname
      }
    }
  });

  User.associate = function (models) {
    User.hasMany(models.Tweet);
    User.hasMany(models.Relationship);
    User.hasMany(models.Mention);
    User.hasMany(models.Like);
  };

  // Generate hash for password.
  User.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // Check if the password is the same.
  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  return User;
};
