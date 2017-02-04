var jwt = require('jsonwebtoken');

/**
 * Databases settings
 * @returns {string}
 */

module.exports.db = function () {
  if (process.env.NODE_ENV == 'production') {
   return 'mongodb://localhost:27017/socialnetwork_dev';
  } else if (process.env.NODE_ENV == 'development') {
    var db = 'socialnetwork_dev';

    if (process.env.NODE_ENV_QA && process.env.NODE_ENV_QA == 'true') {
      db = 'socialnetwork_qa';
    }
    return 'mongodb://localhost:27017/socialnetwork_dev';
   
  } else if (process.env.NODE_ENV == 'test') {
    return 'mongodb://localhost:27017/socialnetwork_test';
  } else {
    return 'mongodb://localhost:27017/socialnetwork_dev';
  }
};

/**
 * jwt token secret
 * @returns {string}
 */
module.exports.getTokenSecret = function () {
  return process.env.JWT_SECRET;
};

/**
 * Issue a new jwt token
 * token expires in 30 days
 * @param user
 * @returns {*}
 */
module.exports.issueNewToken = function (user) {
  return jwt.sign({_id: user.id, name: user.name}, this.getTokenSecret(), {expiresIn: 60 * 720});
};

/**
 * Get User from encrypted token
 * @param req
 * @returns {*}
 */
module.exports.getTokenUser = function (req) {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization;
    var part = authorization.split(' ');
    if (part.length === 2) {
      var token = part[1];
      return jwt.decode(token);
    } else {
      return null;
    }
  } else if (req.query && req.query.token) {
    return jwt.decode(req.query.token);
  } else {
    return null;
  }
};

/**
 * Add Powered by in request header
 * @param req
 * @param res
 * @param next
 * @constructor
 */
module.exports.XPoweredBy = function (req, res, next) {
  res.header('X-Powered-By', 'SocialNetwork');
  next();
};

module.exports.cors = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
};

module.exports.amazonS3 = function () {
  return {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET,
    docs_bucket: process.env.S3_DOCS_BUCKET
  };
};

module.exports.maxImageSize = function () {
  return {
    profile: {height: 450, width: 450},
    quality: 65
  };
};
