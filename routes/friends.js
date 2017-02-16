/**
 * Friends routes
 * @type {exports}
 */

var _ = require('lodash');
var bcryptjs = require('bcryptjs');
var config = require('../config');
var User = require('../models/user');
var slug = require('slug');
var shortid = require('shortid');
var utils = require('../config/utils');
var Image = require('../models/image');

/*
 * @api {post} /sendFriendRequest
 * @apiVersion 1.0.0
 * @apiDescription Send friend request to another user
 * @apiGroup Friends
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 200 OK
   {
  "status": "ok",
  "message": "Friend request was sent"
}
*/

module.exports.sendFriendRequest = function (req, res, next) {
  if (req.body && req.body.userid) {
    User.update({ _id: req.body.userid }, { $addToSet: { friendRequests: req.user._id } }, function (err, user) {
          if (err) {
            var error = new Error();
            error.name = 'MongoSaveError';
            error.message = err.message;
            return next(error);
          } else {

            if (req.user._id == req.body.recipient) {
              var error = new Error();
              error.name = 'NotAcceptable';
              error.message = 'Not acceptable';
              return next(error);
            }

            var sentRequests = req.user.sentRequests.map(function (b) {
              return b.toString();
            });

            if (sentRequests.includes(req.body.userid.toString())) {
              var error = new Error();
              error.name = 'Forbidden';
              error.message = 'Your request has already been sent';
              return next(error);
            }

            var friends = req.user.friends.map(function (b) {
              return b.toString();
            });

            if (friends.includes(req.body.userid.toString() || req.user._id.toString())) {
              var error = new Error();
              error.name = 'Forbidden';
              error.message = 'You are already friends';
              return next(error);
            }

            User.update({ _id: req.user._id }, { $addToSet: { sentRequests: req.body.userid } }).exec(function (err, user) {
                res.status(201).send({
                  status: 'ok',
                  message: 'Friend request was sent'
                });
              });
          }
      });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/*
 * @api {post} /addToFriends
 * @apiVersion 1.0.0
 * @apiDescription Add user to friends
 * @apiGroup Friends
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 200 OK
{
  "status": "ok",
  "message": "You are now friends"
}
*/

module.exports.addToFriends = function (req, res, next) {
  if (req.body && req.body.userid) {
    User.count({ friends: req.body.userid }).exec(function (err, count) {
              if (err) {
                var error = new Error();
                error.name = 'MongoSaveError';
                error.message = err.message;
                return next(error);
              }  else {
                 User.update({ _id: req.user._id }, { $addToSet: { friends: req.body.userid }, $pull: { friendRequests: req.body.userid }, friendsCount: count }, function (err, user) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                      User.update({ _id: req.body.userid }, { $addToSet: { friends: req.user._id }, $pull: { sentRequests: req.user._id }, friendsCount: count }).exec(function (err, user) {
                        res.status(201).send({
                          status: 'ok',
                          message: 'You are now friends'
                        });
                      });
                    }
                  });
              }
            });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

