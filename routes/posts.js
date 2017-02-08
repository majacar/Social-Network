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
 * @api {post} /post/:userid
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
    "text": "Hello!!!",
    "_id": "589b7535bfe2f61bb730ecae"
  }
}
}
*/

module.exports.post = function (req, res, next) {
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

          if (user) {
            var updateSet = req.body;
            function updateUser(userid, updateSet, cb) {
              User.findOneAndUpdate({ _id: req.params.userid }, updateSet, { $addToSet: { wall: post._id } }).exec(function (err, user) {
                        if (err) {
                          var error = new Error();
                          error.name = 'MongoSaveError';
                          error.message = err.message;
                          return next(error);
                        } else {
                          return cb(null, data);
                        }
                      });
            }

            var post = new Post();
            if (!_.isUndefined(req.body.text)) {
              post.text = req.body.text;

              post.save(function (err, data) {
                    if (err) {
                      var error = new Error();
                      error.name = 'MongoSaveError';
                      error.message = err.message;
                      return next(error);
                    } else {
                      res.status(201).send({
                            status: 'ok',
                            results: data
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
                      res.status(201).send({
                            status: 'ok',
                            results: data
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
