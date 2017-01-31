/*
 * Users Routes
 * @type {exports}
 */

var _ = require('lodash');
var bcryptjs = require('bcryptjs');
var config = require('../config');
var User = require('../models/user');
var slug = require('slug');
var shortid = require('shortid');
var Email = require('../modules/send_mail');
var moment = require('moment');


/*
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
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JuYW12MjM3MCwiZXhwvkD3mkZBLKyJTF2UKfiu_7zq-WtF0KM",
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

  // save to db
  user.save().then(function (saved_user) {
    delete saved_user.password;
  
    if (process.env.NODE_ENV == 'test') {
      res.status(201).send({
        status: 'ok',
        message: 'Successfully registered',
        token: config.issueNewToken(
          {
            id: saved_user._id,
            name: saved_user.name,
            email: saved_user.email
          }),
        results: saved_user
      });
    } else {
        redirect_link = req.protocol + '://' + req.get('host') + '/#!/?redirect='

       var sub_params = [
      ['-link-', redirect_link]      
    ];

        Email.sendMail(req.body.email, 'New user signed up', sub_params, 'user-registered', function (err) {
        });
      res.status(201).send({
        status: 'ok',
        message: 'Successfully registered',
        results: saved_user
      });
    }
  }).catch(function (err) {
    var error = new Error();
    error.name = 'MongoSaveError';
    error.message = err.message;
    if (!_.isUndefined(err.errors) && !_.isUndefined(err.errors.email)) {
      error.name = 'DuplicateEmailError';
      error.message = err.errors.email.message;
    }
    return next(error);
  });
   
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/*
 * @api {post} /signin User authentication
 * @apiVersion 1.0.0
 * @apiName Sign in user
 * @apiDescription Authenticate user with given credentials.
 * @apiGroup User
 *
 * @apiParam {String} email User email address.
 * @apiParam {String} password  User password.
 *
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
{
  "status": "ok",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9Zjk0NDQiLCJuYW1NCwiZXhwIjoxNDg1MjQ2NDU0fQ.tu16A9QnpdwLhZgE32Ht4RJ8wFJ_kw21dyIzJR-ED14",
  "results": {
    "_id": "587faec8c74247184d6f9444",
    "fullName": "Maja Plavsa",
    "username": "maja",
    "email": "maja@yahoo.com",
    "date_created": "2017-01-18T18:07:04.757Z",
    "isActive": true
  }
}
 */

 module.exports.signin = function (req, res, next) {

  if (req.body && req.body.email && req.body.password) {

    var valid_email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!valid_email_regex.test(req.body.email)) {
      var error = new Error();
      error.name = 'ValidEmailError';
      return next(error);
    } else {

      User.findOne({ email: req.body.email }).lean().exec().then(function (user) {

      if (!user) {
        var error = new Error();
        error.name = 'CredentialsError';
        return next(error);
      }

      if (!user.isActive) {
        var error = new Error();
        error.name = 'Forbidden';
        error.message = 'Your account is not active, please check your e-mail';
        return next(error);
      } else {
        if (bcryptjs.compareSync(req.body.password, user.password)) {

          delete user.password;

          res.status(200).send({
            status: 'ok',
            token: config.issueNewToken({
              id: user._id,
              name: user.username,
              email: user.email
            }),
            results: user
          });
        } else {
          var error = new Error();
          error.name = 'CredentialsError';
          return next(error);
        }
      }
    }).catch(function (err) {
    var error = new Error();
    error.name = 'MongoSaveError';
    error.message = err.message;
    return next(error);
  });
  }
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/**
 * @api {post} /forgot
 * @apiVersion 1.0.0
 * @apiName Forgot password
 * @apiDescription User forgot password
 * @apiGroup User
 *
 * @apiParam {String} email  User email.
 *
 *@apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
  {
  "status": "ok",
  "message": "Password reset email sent"
}
 */
module.exports.forgotPassword = function (req, res, next) {
  if (req.body && req.body.email) {
    User.findOne({ email: req.body.email }).lean().exec().then(function (user) {
      if (!user) {
        var error = new Error();
        error.name = 'EmailDoesNotExist';
        return next(error);
      } else {
        var reset_token = shortid.generate(),
          reset_link = req.protocol + '://' + req.get('host') + '/#!/?reset=' + reset_token;
        // save token to db
        var exp_date = new Date(moment(new Date).add(2, 'days'));
        if (process.env.NODE_ENV == 'test') {
          exp_date = new Date();
        }
        User.update({ email: req.body.email }, {
          $set: {
            tmp: reset_token,
            tmp_expiry: exp_date
          }
        }).exec().then(function () {
          if (process.env.NODE_ENV == 'test') {
            User.findOne({ email: req.body.email }).lean().exec().then(function (updated_user) {
              res.status(200).send({
                status: 'ok',
                message: 'Password reset email sent',
                reset_token: reset_token,
                tmp_expiry: updated_user.tmp_expiry
              });
            }).catch(function (err) {
              var error = new Error();
              error.name = 'MongoGetError';
              error.message = err.message;
              return next(error);
            });
          } else {
            var sub_params = [
              ['-link-', reset_link]
            ];
            Email.sendMail(req.body.email, 'Create your new SocialNetwork password', sub_params, 'forgot-password', function (err) {
              if (err) {
                var error = new Error();
                error.name = 'EmailNotSentError';
                return next(error);
              } else {
                res.status(200).send({
                  status: 'ok',
                  message: 'Password reset email sent'
                });
              }
            });
          }
        }).catch(function (err) {
          var error = new Error();
          error.name = 'MongoSaveError';
          error.message = err.message;
          return next(error);
        });
      }
    }).catch(function (err) {
      var error = new Error();
      error.name = 'MongoGetError';
      error.message = err.message;
      return next(error);
    });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};

/**
 * @api {post} /reset
 * @apiVersion 1.0.0
 * @apiName Reset password
 * @apiDescription User reset password
 * @apiGroup User
 *
 * @apiParam {String} pasword User password.
 *
 * @apiSuccessExample Success-Response:
 HTTP/1.1 201 OK
 {
  "status": "ok",
  "message": "Password is successfully changed",
  "results": {
    "_id": "58231ac1ed33431c2af972ba",
    "updatedAt": "2016-11-11T17:26:35.949Z",
    "createdAt": "2016-11-09T12:46:57.733Z",
    "username": "maja",
    "email": "maja@soundhills.com",
    "isActive": true
  }
}
 */

module.exports.resetPassword = function (req, res, next) {
  if (req.body && req.body.password && req.body.confirm && req.body.reset_token) {
    User.findOneAndUpdate({ tmp: req.body.reset_token }, { $unset: { tmp: "", tmp_expiry: "" }}, { new: true })
    .exec().then(function (user) {

      if (user) {
        // ignore validation
        user.$ignore('email');
        user.$ignore('username');

        var password = req.body.password;
        var confirm = req.body.confirm;

        if (password !== confirm) {
          var error = new Error();
          error.name = 'NotAcceptable';
          return next(error);
        } else {
          user.password = bcryptjs.hashSync(req.body.password, 10);

          // save new password
          user.save(function (err, savedUser) {
            if (err) {
              var error = new Error();
              error.name = 'MongoSaveError';
              error.message = err.message;
              return next(error);
            } else {
              savedUser = savedUser.toObject();
              delete savedUser.password;
              res.status(201).send({
                status: 'ok',
                message: 'Password is successfully changed',
                results: savedUser
              });
            }
          });
        }
      } else {
        var error = new Error();
        error.name = 'UnauthorizedError';
        return next(error);
      }
  }).catch(function (err) {
    var error = new Error();
    error.name = 'MongoGetError';
    error.message = err.message;
    return next(error);
  });
  } else {
    var error = new Error();
    error.name = 'MissingParamsError';
    return next(error);
  }
};