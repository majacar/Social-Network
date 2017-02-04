/**
 * User Profile
 * @type {exports}
 */

var _ = require('lodash');
var bcryptjs = require('bcryptjs');
var config = require('../config');
var User = require('../models/user');
var slug = require('slug');
var shortid = require('shortid');
var utils = require('../config/utils');

/*
 * @api {get} /me My profile
 * @apiVersion 1.0.0
 * @apiDescription My profile
 * @apiGroup Profile
 *
 * @apiHeader {String} Token authorization value.
 * @apiHeaderExample {json} Token Example:
 * {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJ..."}
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 200 OK
   {
  "status": "ok",
  "results": {
    "_id": "58938a7bb72d7011a4f428d3",
    "fullName": "Maja Car",
    "username": "majacarica",
    "email": "maja@socialnetwork.com",
    "date_created": "2017-02-02T19:37:31.821Z",
    "isActive": true
  }
}
*/

module.exports.me = function (req, res, next) {
  res.status(200).send({
    status: 'ok',
    results: req.user
  });
};

/*
 * @api {get} /profile Users profile
 * @apiVersion 1.0.0
 * @apiDescription Profile of another user
 * @apiGroup Profile
 *
 * @apiParam {String} username  Other users username.
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 200 OK
   {
  "status": "ok",
  "results": {
    "_id": "58938d016b3f531311d6e2ce",
    "fullName": "Lepa Brena",
    "username": "lepabrena",
    "date_created": "2017-02-02T19:48:17.037Z",
    "isActive": true
  }
}
*/

module.exports.profile = function (req, res, next) {
  if (req.params && req.params._id) {
    User.findOne({ _id: req.params._id }).lean().exec(function (err, user) {
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
        delete user.password;
        delete user.email;
      }

      res.status(200).send({
          status: 'ok',
          results: user
        });

    });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/**
 * @api {put} /profile/edit Edit profile
 * @apiVersion 1.0.0
 * @apiDescription Edit profile
 * @apiGroup Edit
 *
 * @apiParam {String} username  Users username.
 *
 * @apiSuccessExample Success-Response:
 HTTP/1.1 201 OK
 {
  "status": "ok",
  "message": "Successfully updated",
  "results": {
    "_id": "5895fbcb60a95e49c59a8cdd",
    "fullName": "Lepa Brena",
    "password": "$2a$10$5uBTpTujBgY41MtGuIq5pe1sgjwGenfYn9Bhvb1ZH23FpTyKiwVfm",
    "username": "brena",
    "email": "brena@yahoo.com",
    "image": "https://s3.amazonaws.com/soundhills/a0ac4885-4daf-4491-b176-ed847ca99c75.png",
    "date_created": "2017-02-04T16:05:31.792Z",
    "isActive": true
  }
}
 */

module.exports.edit = function (req, res, next) {
    if (req.params && req.user._id) {
      User.findOne({ _id: req.user._id }).exec().then(function (user) {
      
        // email and username can not be changed
            delete req.body.email;
            delete req.body.username;

            var updateSet = req.body;
            if (!_.isUndefined(req.body.img) && !_.isUndefined(req.body.img.type) && !_.isUndefined(req.body.img.image)) {
              utils.resizeUploadImage(req.body.img, config.maxImageSize(), config.amazonS3().bucket, function (err, url) {
                if (err) return next(err);
                updateSet.image = url;
                updateUser(user._id, updateSet, function (err, user) {
                  if (err) return next(err);
                  res.status(201).send({
                        status: 'ok',
                        message: 'Successfully updated',
                        results: user
                      });
                });
              });
            } else {
              updateUser(user._id, updateSet, function (err, user) {
                if (err) return next(err);
                res.status(201).send({
                      status: 'ok',
                      message: 'Successfully updated',
                      results: user
                    });
              });
            }
          }).catch(function (err) {
            var error = new Error();
            error.name = 'MongoSaveError';
            error.message = err.message;
            return next(error);
          });
    } else {
      var error = new Error();
      error.name = 'MissingParamsError';
      return next(error);
    }         
  };

// Helper function

   function updateUser(user_id, updateSet, cb) {
              User.findOneAndUpdate({ _id: user_id }, updateSet, { new: true }, function (err, savedUser) {
                if (err) {
                  var error = new Error();
                  error.name = 'MongoSaveError';
                  error.message = err.message;
                  return cb(error, null);
                } else {
                  delete savedUser.password;
                  return cb(null, savedUser);
                }
              });
            }