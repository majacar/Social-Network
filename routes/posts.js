/**
 * Posts and statuses
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
var Post = require('../models/post');

/*
 * @api {post} /post_users_wall/:userid
 * @apiVersion 1.0.0
 * @apiDescription Post text or photo on other users wall
 * @apiGroup Post
 *
 * @apiHeader {String} Token authorization value.
 * @apiHeaderExample {json} Token Example:
 * {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJ..."}
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 201 OK
{
  "status": "ok",
  "results": {
    "__v": 0,
    "updatedAt": "2017-02-08T19:44:53.338Z",
    "createdAt": "2017-02-08T19:44:53.338Z",
    "creator": "58a84f68c5931f0e62c3068f",
    "wall": "58a84f68c5931f0e62c3078g",
    "text": "Hello!!!",
    "_id": "589b7535bfe2f61bb730ecae"
  }
}
}
*/


module.exports.post_users_wall = function (req, res, next) {
  if (req.body && req.params && req.params.userid) {
    User.findOne({ _id: req.params.userid }).lean().exec(function (err, user) {
          if (_.isNull(user)) {
            var error = new Error();
            error.name = 'Forbidden';
            error.message = 'Account is inactive';
            return next(error);
          }

          if (!user.isActive) {
            var error = new Error();
            error.name = 'Forbidden';
            error.message = 'Account is inactive';
            return next(error);
          }

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

          if (user) {
            var post = new Post();
            var updateSet = { $addToSet: { wall: post._id }};
            function updateUser(user_id, updateSet, cb) {
              User.findOneAndUpdate({ _id: req.params.userid }, updateSet, { new: true }, function (err, savedUser) {
                if (err) {
                  var error = new Error();
                  error.name = 'MongoSaveError';
                  error.message = err.message;
                  return cb(error, null);
                } else {
                  return cb(null, savedUser);
                }
              });
            }

            if (!_.isUndefined(req.body.text)) {
              post.text = req.body.text;

              post.creator = req.user._id;
              post.wall = req.params.userid;

              post.save(function (err, data) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                  updateUser(user._id, updateSet, function (err, data) {
                  if (err) return next(err);
                      res.status(201).send({
                            status: 'ok',
                            results: post
                          });
                    });
                     }
                  });
            } else {
              if (!_.isUndefined(req.body.image) && !_.isUndefined(req.body.image.type) && !_.isUndefined(req.body.image.image)) {
                utils.resizeUploadImage(req.body.image, config.maxImageSize(), config.amazonS3().bucket, function (err, url) {
                  if (err) return next(err);
                  post.image = url;
                  post.save(function (err, data) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                       updateUser(user._id, updateSet, function (err, data) {
                  if (err) return next(err);
                      res.status(201).send({
                            status: 'ok',
                            results: post
                          });
                    });
                     }
                  });
                });
              }
            }
          }
        });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/*
 * @api {post} /post
 * @apiVersion 1.0.0
 * @apiDescription Post text or photo on my wall
 * @apiGroup Posts and statuses
 *
 * @apiHeader {String} Token authorization value.
 * @apiHeaderExample {json} Token Example:
 * {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJ..."}
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 201 OK
{
  "status": "ok",
  "results": {
    "__v": 0,
    "updatedAt": "2017-02-15T14:33:40.903Z",
    "createdAt": "2017-02-15T14:33:40.903Z",
    "creator": "58a84f68c5931f0e62c3068f",
    "wall": "58a84f68c5931f0e62c3068f",
    "image": "https://s3.amazonaws.com/socialnetwork/bfea7a4d-2b09-4b38-857d-ab5494814818.png",
    "_id": "58a466c4e316b90f67c439fa"
  }
}
}
*/


module.exports.post = function (req, res, next) {
  if (req.body && req.user._id) {
  
            var post = new Post();
            var updateSet = { $addToSet: { wall: post._id }};

            function updateUser(user_id, updateSet, cb) {
              User.findOneAndUpdate({ _id: req.user._id }, updateSet, { new: true }, function (err, savedUser) {
                if (err) {
                  var error = new Error();
                  error.name = 'MongoSaveError';
                  error.message = err.message;
                  return cb(error, null);
                } else {
                  return cb(null, savedUser);
                }
              });
            }

            if (!_.isUndefined(req.body.text)) {
              post.text = req.body.text;

              post.creator = req.user._id;
              post.wall = req.user._id;

              post.save(function (err, data) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                  updateUser(req.user._id, updateSet, function (err, data) {
                  if (err) return next(err);
                      res.status(201).send({
                            status: 'ok',
                            results: post
                          });
                    });
                     }
                  });
            } else {
              if (!_.isUndefined(req.body.image) && !_.isUndefined(req.body.image.type) && !_.isUndefined(req.body.image.image)) {
                utils.resizeUploadImage(req.body.image, config.maxImageSize(), config.amazonS3().bucket, function (err, url) {
                  if (err) return next(err);
                  post.image = url;
                  post.save(function (err, data) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                       updateUser(req.user._id, updateSet, function (err, data) {
                  if (err) return next(err);
                      res.status(201).send({
                            status: 'ok',
                            results: post
                          });
                    });
                     }
                  });
                });
              }
            }
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/*
 * @api {get} /posts
 * @apiDescription View my wall and my posts and posts from other users
 * @apiGroup Posts and statuses
 *
 * @apiSuccessExample Success-Response:
  HTTP/1.1 200 OK
{
  "status": "ok",
  "results": [
    {
      "_id": "58a989c2e44b12124c06a064",
      "image": "https://s3.amazonaws.com/socialnetwork/730782bd-8e67-4bee-8e70-bb17d96213e7.png"
    },
    {
      "_id": "58a98a14e5a2a21298dd3c17",
      "text": "Nice day"
    }
  ]
}
*/

module.exports.posts = function (req, res, next) {
      User.findOne({ _id: req.user._id }).populate('wall', 'creator text image').exec(function (err, user) {
        if (err) {
          var error = new Error();
          error.name = 'MongoSaveError';
          error.message = err.message;
          return next(error);
        } else {
          res.status(200).send({
            status: 'ok',
            results: user.wall
          });
        }
      });
  };

  /*
 * @api {get} /user_posts/:userid
 * @apiDescription View list of my friends
 * @apiGroup Friends
 *
 * @apiSuccessExample Success-Response:
  HTTP/1.1 200 OK
{
  "status": "ok",
  "results": [
    {
      "_id": "58a98b7e305a55131a5d58b1",
      "text": "Hello!"
    }
  ]
}
*/

module.exports.user_posts = function (req, res, next) {
  if (req.params && req.params.userid) {
      User.findOne({ _id: req.params.userid }).populate('wall', 'creator text image').exec(function (err, user) {
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
            results: user.wall
          });       
          
        }      
      });
    } else {
      var error = new Error();
      error.name = 'MissingParamsError';
      return next(error);
    }
  };