var _ = require('lodash');
var config = require('./index');
var User = require('./../models/user');

function _verifyUser(user, req, res, next) {
  User.findOne({_id: user._id}).lean().exec(function (err, user) {
    if (_.isNull(user)) {
      var error = new Error();
      error.name = 'Forbidden';
      return next(error);
    } else {
      if (!user.isActive) {
        var error = new Error();
        error.name = 'Forbidden';
        error.message = 'Your account is inactive';
        return next(error);
      }

      if (!_.isUndefined(user)) {
        delete user.password;
      }

      req.user = user;
      next();
    }
  });
}

module.exports.ensureAuth = function (req, res, next) {
  var user = config.getTokenUser(req);
  if (!_.isNull(user)) {
    _verifyUser(user, req, res, next);
  } else {
    var error = new Error();
    error.name = 'Forbidden';
    return next(error);
  }
};
