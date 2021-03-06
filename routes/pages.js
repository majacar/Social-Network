/**
 * Pages routes
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
var Page = require('../models/page');


/*
 * @api {post} /create_page
 * @apiVersion 1.0.0
 * @apiDescription Create page
 * @apiGroup Pages
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
   		"image": "https://s3.amazonaws.com/socialnetwork/0a8a14a5-5b3b-4382-a4ff-20ab5dd3d392.png",
   		"title": "Moja firma",
   		"admin": "58a84f68c5931f0e62c3068f",
   		"_id": "58b2ec486cd1de114d6f8873",
   		"date_created": "2017-02-26T14:55:04.814Z"
   	}
   }
*/


module.exports.create_page = function (req, res, next) {
  if (req.body && req.user._id && req.body.title) {

    var page = new Page();
    User.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { pages: page._id } }, { new: true }, function (err, savedUser) {
                if (err) {
                  var error = new Error();
                  error.name = 'MongoSaveError';
                  error.message = err.message;
                  return cb(error, null);
                } else {
                  page.admin = req.user._id;
                  page.title = req.body.title;

                  if (!_.isUndefined(req.body.about)) {
                    page.about = req.body.about;
                  }

                  if (!_.isUndefined(req.body.image) && !_.isUndefined(req.body.image.type) && !_.isUndefined(req.body.image.image)) {
                    utils.resizeUploadImage(req.body.image, config.maxImageSize(), config.amazonS3().bucket, function (err, url) {
                      if (err) return next(err);
                      page.image = url;

                      page.save(function (err, data) {
                        if (err) {
                          var error = new Error();
                          error.name = 'MongoSaveError';
                          error.message = err.message;
                          return next(error);
                        } else {
                          if (err) return next(err);
                          res.status(201).send({
                            status: 'ok',
                            results: data
                          });
                        }
                      });
                    });
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
 * @api {delete} /delete_page
 * @apiVersion 1.0.0
 * @apiDescription Delete page
 * @apiGroup Pages
 *
 * @apiHeader {String} Token authorization value.
 * @apiHeaderExample {json} Token Example:
 * {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJ..."}
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 200 OK
   {
  "status": "ok",
  "message": "Successfully deleted"
}
*/

module.exports.delete_page = function (req, res, next) {
  if (req.params && req.params.pageid) {
    Page.findOne({ _id: req.params.pageid }, function (err, page) {
      if (err) {
        var error = new Error();
        error.name = 'MongoSaveError';
        error.message = err.message;
        return next(error);
      } else {
        if (page.admin.toString() !== req.user._id.toString()) {
          var error = new Error();
          error.name = 'NotAcceptable';
          return next(error);
        } else {
          Page.findOneAndRemove({ _id: req.params.pageid }, function (err, page) {
            if (err) {
              var error = new Error();
              error.name = 'MongoDeleteError';
              error.message = err.message;
              return next(error, null);
            } else {
              User.findOneAndUpdate({ _id: page.admin }, { $pull: { pages: req.params.pageid }}).exec(function (err, page) {
                if (err) return next(err);
                res.status(200).send({
                  status: 'ok',
                  message: 'Successfully deleted'
                });
              });
            }
          });
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
 * @api {get} /my_pages
 * @apiVersion 1.0.0
 * @apiDescription View my Pages
 * @apiGroup Pages
 *
 * @apiHeader {String} Token authorization value.
 * @apiHeaderExample {json} Token Example:
 * {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJ..."}
 *
 * @apiSuccessExample Success-Response:
   HTTP/1.1 200 OK
   {
  "status": "ok",
  "results": [
    {
      "_id": "58f50b696abede08d342e679",
      "image": "https://s3.amazonaws.com/soundhills/b2569336-d774-4f27-af29-e3aab5af80b4.png",
      "title": "Moja firma",
      "admin": "58a84f68c5931f0e62c3068f",
      "__v": 0,
      "date_created": "2017-04-17T18:37:29.800Z"
    }
  ]
}
*/

module.exports.my_pages = function (req, res, next) {
    if (req.params && req.params.userid) {
      Page.find({ admin: req.params.userid }).sort('likes').exec(function (err, pages) {
        if (err) {
          var error = new Error();
          error.name = 'MongoSaveError';
          error.message = err.message;
          return next(error);
        } else {
          res.status(200).send({
            status: 'ok',
            results: pages
          });
        }
      });
    }
  };