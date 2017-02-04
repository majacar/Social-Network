var tmp = require('tmp'),
  util = require('util'),
  s3 = require('s3'),
  fs = require('fs'),
  sharp = require('sharp'),
  config = require('./index'),
  _ = require('lodash'),
  uuid = require('node-uuid'),
  AWS = require('aws-sdk');

/**
 * Decode Base64 string and save to filesystem
 * @param f_path to the file
 * @param bucket name
 * @param cb
 */
function uploadFileToS3(f_path, bucket, cb) {
  // upload local file to s3
  var client = s3.createClient(
    {
      s3Options: {
        accessKeyId: config.amazonS3().accessKeyId,
        secretAccessKey: config.amazonS3().secretAccessKey
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
      }
    }
  );

  var f_type = f_path.split('.').slice(-1).pop(),
    key = uuid.v4() + '.' + f_type;

  var params = {
    localFile: f_path,

    s3Params: {
      Bucket: bucket,
      Key: key,
      ACL: 'public-read',
      CacheControl: "max-age=2592000"
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    }
  };

  if (process.env.NODE_ENV != 'test') {
    var uploader = client.uploadFile(params);
    uploader.on('error', function (err) {
      return cb(err, null);
    });
    uploader.on('progress', function () {
      //  uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function () {
      return cb(null, s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key));
    });
  } else {
    console.log(util.format("done uploading %s", s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key)));
    return cb(null, s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key));
  }
}

/**
 * Decode Base64 string and save to filesystem
 * @param base64_string
 * @param f_type
 * @param cb
 */
function decodeBase64AndSaveToFS(base64_string, f_type, cb) {

  var buff = new Buffer(base64_string, 'base64');
  var key = uuid.v4() + '.' + f_type;

  var tmpobj = tmp.dirSync();

  var file_path = tmpobj.name + '/' + key;

  fs.writeFile(file_path, buff, function (err) {
    return cb(err, file_path);
  });
}

/**
 * Check if given param is valid ObjectId
 */
module.exports.isValidObjectID = function (check_value) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(check_value);
};

function resizeUploadImage(img, resize, bucket, cb) {
  var allowed_types = ['jpg', 'jpeg', 'png'];

  if (allowed_types.indexOf(img.type.toLocaleLowerCase()) === -1) {
    var error = new Error();
    error.name = 'InvalidImageType';
    return cb(error);
  }
  sharp(new Buffer(img.image, 'base64')).resize(resize.width, resize.height).max().withoutEnlargement().sharpen().quality(config.maxImageSize().quality).toBuffer(function (err, resized_img) {
    if (err) {
      var error = new Error();
      error.name = 'UploadImageError';
      error.message = err.message;
      return cb(error);
    }
    decodeBase64AndSaveToFS(resized_img.toString('base64'), img.type, function (err, file_path) {
      if (err) {
        var error = new Error();
        error.name = 'UploadImageError';
        error.message = err.message;
        return cb(error);
      }
      if (process.env.NODE_ENV == 'test') {
        return cb(err, 'http://www.google.com/' + uuid.v4() + '.' + img.type);
      }
      uploadFileToS3(file_path, bucket, function (err, image_url) {
        if (err) {
          var error = new Error();
          error.message = err.message;
          error.name = 'UploadImageError';
          return cb(error);
        }
        return cb(null, image_url);
      });
    });
  });
}

function uploadTrack(track, bucket, cb) {
  var allowed_types = ['mp3', 'mpeg'];

  if (allowed_types.indexOf(track.type.toLocaleLowerCase()) === -1) {
    var error = new Error();
    error.name = 'InvalidTrackType';
    return cb(error);
  }

  decodeBase64AndSaveToFS(track.base, track.type, function (err, file_path) {
    if (err) {
      var error = new Error();
      error.name = 'UploadTrackError';
      error.message = err.message;
      return cb(error);
    }
    if (process.env.NODE_ENV == 'test') {
      return cb(err, 'www.google.com/' + uuid.v4() + track.type);
    }
    uploadFileToS3(file_path, bucket, function (err, track_url) {
      if (err) {
        var error = new Error();
        error.message = err.message;
        error.name = 'UploadTrackError';
        return cb(error);
      }
      return cb(null, track_url);
    });
  });
}

function removeFile(url, bucket, cb) {
  AWS.config = new AWS.Config();
  AWS.config.accessKeyId = config.amazonS3().accessKeyId;
  AWS.config.secretAccessKey = config.amazonS3().secretAccessKey;
  var AWS_S3 = new AWS.S3();

  var params = {
    Bucket: bucket,
    Key: url.replace("https://s3.amazonaws.com/" + bucket + "/", '')
  };
  if (process.env.NODE_ENV == 'test') {
    return cb(null, 1);
  }
  AWS_S3.deleteObject(params, function (err, data) {
    if (err) {
      return cb(err, data);
    } else {
      return cb(err, data);
    }
  });
}

exports.uploadFileToS3 = uploadFileToS3;
exports.decodeBase64AndSaveToFS = decodeBase64AndSaveToFS;
exports.resizeUploadImage = resizeUploadImage;
exports.uploadTrack = uploadTrack;
exports.removeFile = removeFile;
