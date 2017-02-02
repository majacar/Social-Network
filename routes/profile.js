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
        error.message = 'Ypur account is inactive';
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