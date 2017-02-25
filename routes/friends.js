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
var eventEmitter = require('events');
var emitter = new eventEmitter();

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
    User.findOneAndUpdate({ _id: req.body.userid }, { $addToSet: { friendRequests: req.user._id } }, { new: true }).exec(function (err, user) {
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

            if (user.privacy_nobody == true) { 
              var error = new Error();      
              error.name = 'Forbidden';
              error.message = 'This is not public profile';
              return next(error); 
            }

            User.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { sentRequests: req.body.userid } }, { new: true }).exec(function (err, user) {
                emitter.emit('sendFriendRequest');
                res.status(200).send({
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
 * @api {get} /sendFriendRequest/stream
 * @apiVersion 1.0.0
 * @apiDescription Emit new notification
 * @apiGroup Friends
 *
 */

module.exports.stream = function (req, res, next) {
  req.socket.setTimeout(0);

  emitter.on('sendFriendRequest', function () {
     
        res.write('New friend request');  
      
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('\n');

  req.on("close", function () {
    console.log('close')
  });

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
                 User.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { friends: req.body.userid }, $pull: { friendRequests: req.body.userid }, friendsCount: count }, { new: true }).exec(function (err, user) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                      User.findOneAndUpdate({ _id: req.body.userid }, { $addToSet: { friends: req.user._id }, $pull: { sentRequests: req.user._id }, friendsCount: count }, { new: true }).exec(function (err, user) {
                        res.status(200).send({
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

/*
 * @api {get} /friends
 * @apiDescription View list of my friends
 * @apiGroup Friends
 *
 * @apiSuccessExample Success-Response:
  HTTP/1.1 200 OK
{
 "status": "ok",
"results": [
    {
      "_id": "5849806f02eb617f5ae282c6",
      "name": "Song",
      "description": "Song",
      "category": "guitar",
      "url": "https://s3.amazonaws.com/soundhills/8903270a-e788-4cfb-9067-608114edce42.mp3",
      "creator": "5849802802eb617f5ae282c5",
      "__v": 0
    }
  ]
*/

module.exports.friends = function (req, res, next) {
      User.findOne({ _id: req.user._id }).populate('friends', 'username image').exec(function (err, user) {
        if (err) {
          var error = new Error();
          error.name = 'MongoSaveError';
          error.message = err.message;
          return next(error);
        } else {
          res.status(200).send({
            status: 'ok',
            results: user.friends
          });
        }
      });
  };

  /*
 * @api {get} /friends/:userid
 * @apiDescription View list of my friends
 * @apiGroup Friends
 *
 * @apiSuccessExample Success-Response:
  HTTP/1.1 200 OK
{
 "status": "ok",
"results": [
    {
      "_id": "5849806f02eb617f5ae282c6",
      "name": "Song",
      "description": "Song",
      "category": "guitar",
      "url": "https://s3.amazonaws.com/soundhills/8903270a-e788-4cfb-9067-608114edce42.mp3",
      "creator": "5849802802eb617f5ae282c5",
      "__v": 0
    }
  ]
*/

module.exports.user_friends = function (req, res, next) {
  if (req.params && req.params.userid) {
      User.findOne({ _id: req.params.userid }).populate('friends', 'username image').exec(function (err, user) {
        if (err) {
          var error = new Error();
          error.name = 'MongoSaveError';
          error.message = err.message;
          return next(error);
        } else {

          if (user && user.block) {
            var block = user.block.map(function(b) {
            return b.toString();
          });

            if (block.includes(req.user._id.toString())) {
              var error = new Error();
              error.name = 'Forbidden';
              error.message = 'You are blocked';
              return next(error);
            }
          }

          if (user.privacy_only_friends == true) {
            var friends = user.friends.map(function(b) {
            return b.toString();
          });

            if (!friends.includes(req.user._id.toString())) {
              var error = new Error();
              error.name = 'Forbidden';
              error.message = 'You are not friends';
              return next(error); 
            }
          }

          if (user.privacy_nobody == true) { 
            var error = new Error();      
            error.name = 'Forbidden';
            error.message = 'This is not public profile';
            return next(error); 
          }
          
          res.status(200).send({
            status: 'ok',
            results: user.friends
          });
        }
      });
    } else {
      var error = new Error();
      error.name = 'MissingParamsError';
      return next(error);
    }
  };