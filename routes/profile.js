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
var Image = require('../models/image');

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
    "username": "maja",
    "email": "brena@yahoo.com",
    "gallery": [],
    "image": [],
    "date_created": "2017-02-04T16:05:31.792Z",
    "isActive": true
  }
}
 */

module.exports.edit = function (req, res, next) {
    if (req.params && req.user._id) {

      if (!user) {
        var error = new Error();
        error.name = 'Forbidden';
        error.message = 'Account is inactive';
        return next(error);
      }

       // email and username can not be changed
          delete req.body.email;
          delete req.body.username; 

      User.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true }, function (err, user) {
        if (err) {
           var error = new Error();
            error.name = 'MongoSaveError';
            error.message = err.message;
            return next(error);
        } else {         
            res.status(201).send({
                  status: 'ok',
                  message: 'Successfully updated',
                  results: user
                });   
              }                          
           });
      } else {
        var error = new Error();
        error.name = 'MissingParamsError';
        return next(error);
    }         
  };

  /**
 * @api {post} /backgroundImage
 * @apiVersion 1.0.0
 * @apiDescription Change background image
 * @apiGroup Profile
 *
 * @apiRequest:
 {
"image": {
  "description": "My picture",
  "data": {
    "type": "png",
    "base": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }
}
}
 *
 * @apiSuccessExample Success-Response:
 HTTP/1.1 201 OK
 {
  "status": "ok",
  "results": {
    "__v": 0,
    "updatedAt": "2017-02-04T20:18:53.676Z",
    "createdAt": "2017-02-04T20:18:53.676Z",
    "description": "My picture",
    "url": "https://s3.amazonaws.com/soundhills/d83251ab-3067-4b56-a1d9-c9af00054086.png",
    "creator": "589635327afc4f5af6d10403",
    "_id": "5896372d6ed9b65c29f400ac"
  }
}
 */

  module.exports.backgroundImage = function (req, res, next) {
        if (req.body && req.body.image) {
          utils.uploadImage(req.body.image.data, config.amazonS3().bucket, function (err, url) {
                if (err) return next(err);
                var imageData = {
                  description: req.body.image.description,
                  url: url,
                  creator: req.user._id
                };
                var image = new Image(imageData);
                image.save(function (err, data) {
                  if (err) {
                    var error = new Error();
                    error.name = 'MongoSaveError';
                    error.message = err.message;
                    return next(error);
                  } else {

                    User.update({ _id: req.user._id }, { $addToSet: { gallery: data._id } }).exec(function (err, user) {
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

                  }
                });
              });
            } else {
              var error = new Error();
              error.name = 'MissingParamsError';
              return next(error);
            }
          };

/**
 * @api {post} /profilePicture
 * @apiVersion 1.0.0
 * @apiDescription Add profile picture - Avatar
 * @apiGroup Profile
 *
 * @apiRequest:
 {  
  "image": {
  "type": "png",
  "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }
}
 *
 * @apiSuccessExample Success-Response:
 HTTP/1.1 201 OK
{
  "status": "ok",
  "message": "Successfully updated",
  "results": {
    "_id": "589635327afc4f5af6d10403",
    "fullName": "Brena",
    "password": "$2a$10$aNGwWVlgDMN3y7gyLE3UyeLWblWqtdgxF3EnvV5SyG76lxloI5Tqa",
    "username": "brena",
    "email": "brena@yahoo.com",
    "image": "https://s3.amazonaws.com/soundhills/2dc458cc-5234-4e6a-80d4-8af28ebd18f0.png",
    "gallery": [],
    "date_created": "2017-02-04T20:10:26.276Z",
    "isActive": true
  }
}
 */

  module.exports.profilePicture = function (req, res, next) {
     if (!_.isUndefined(req.body.image) && !_.isUndefined(req.body.image.type) && !_.isUndefined(req.body.image.image)) {
        utils.resizeUploadImage(req.body.image, config.maxImageSize(), config.amazonS3().bucket, function (err, url) {
                if (err) return next(err);
                User.findOneAndUpdate({ _id: req.user._id }, { image: url }, { new: true }, function (err, user) {
                      if (err) {
                        var error = new Error();
                        error.name = 'MongoSaveError';
                        error.message = err.message;
                        return next(error);
                      } else {
                  res.status(201).send({
                        status: 'ok',
                        message: 'Successfully updated',
                        results: user
                      });
                   }
                });
              });
            } else {
              var error = new Error();
              error.name = 'MissingParamsError';
              return next(error);
            }
          };               

/*
 * @api {get} /pictures/:userid
 * @apiDescription View list of images from gallery
 * @apiGroup Images
 *
 * @apiSuccessExample Success-Response:
  HTTP/1.1 200 OK
{
  "status": "ok",
  "results": [
    {
      "_id": "5896372d6ed9b65c29f400ac",
      "updatedAt": "2017-02-04T20:18:53.676Z",
      "createdAt": "2017-02-04T20:18:53.676Z",
      "description": "My picture",
      "url": "https://s3.amazonaws.com/soundhills/d83251ab-3067-4b56-a1d9-c9af00054086.png",
      "creator": "589635327afc4f5af6d10403",
      "__v": 0
    }
  ]
}
*/

module.exports.pictures = function (req, res, next) {
    if (req.params && req.params.userid) {
      Image.find({ creator: req.params.userid }).sort({ createdAt: 'descending' }).exec(function (err, images) {
        if (err) {
          var error = new Error();
          error.name = 'MongoSaveError';
          error.message = err.message;
          return next(error);
        } else {
          res.status(200).send({
            status: 'ok',
            results: images
          });
        }
      });
    }
  };
