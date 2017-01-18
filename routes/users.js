/**
 * Users Routes
 * @type {exports}
 */

var _ = require('lodash');
var bcryptjs = require('bcryptjs');
var config = require('../config');
var User = require('../models/user');
var slug = require('slug');
var shortid = require('shortid');

/**
 * @api {post} /signup User registration
 * @apiVersion 1.0.0
 * @apiName User signup
 * @apiDescription User signup
 * @apiGroup User
 *
 * @apiParam {String} email  Users email.
 * @apiParam {String} username  Users username.
 * @apiParam {String} password  User password.
 *
 * @apiSuccessExample Success-Response:
 HTTP/1.1 201 OK
 {
	"status": "ok",
	"message": "Successfully registered",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ODdmYWQwMjJhOWFmYzE3OWFmNjkxYmQiLCJuYW1lIjoibWFqYSIsImlhdCI6MTQ4NDc2MjM3MCwiZXhwIjoxNDg0ODA1NTcwfQ.4tNhlUmhY7DBvkD3mkZBLKyJTF2UKfiu_7zq-WtF0KM",
	"results": {
		"fullName": "Maja Plavsa",
		"username": "maja",
		"email": "maja@yahoo.com",
		"_id": "587fad022a9afc179af691bd",
		"date_created": "2017-01-18T17:59:30.065Z",
		"isActive": false
	}
}
 }
 */

module.exports.signup = function (req, res, next) {
if (req.body && req.body.email && req.body.username && req.body.password) {
    var user = new User();
    user.email = req.body.email.toLowerCase();
    user.username = slug(req.body.username.toLowerCase());
    user.password = bcryptjs.hashSync(req.body.password, 10);

    if (!_.isUndefined(req.body.fullName)) {
      user.fullName = req.body.fullName;
    }

    // validate user
    user.validate(function (err) {
      if (err) {
        var error = new Error();
        if (!_.isUndefined(err.errors) && (!_.isUndefined(err.errors.email) )) {
          if (!_.isUndefined(err.errors.email)) {
            error.name = 'DuplicateEmailError';
            error.message = err.errors.email.message;
          } 
        }

        return next(error);
      } else {
        
          // save user to db
          user.save().then(function (savedUser) {
          
              delete savedUser.password;
              savedUser = savedUser.toObject();
              
              res.status(201).send({
                status: 'ok',
                message: 'Successfully registered',
                token: config.issueNewToken({
                  id: savedUser._id,
                  name: savedUser.username
                }),
                results: savedUser
              });
            }).catch(function (err) {
    var error = new Error();
    error.name = 'MongoSaveError';
    error.message = err.message;
    return next(error);
  });
          }
              
    });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};