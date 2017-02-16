/**
 * User Model
 * @type {exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('../models/image');
var Post = require('../models/post');

var User = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String },
  resetToken: String, // Used for storing a token for forgot password
  isActive: { type: Boolean, default: true },
  date_created: { type: Date, default: Date.now },
  tmp: { type: String },
  tmp_expiry: { type: Date },
  gallery: [{ type: Schema.ObjectId, ref: 'Image' }],
  image: String,
  wall: [{ type: Schema.ObjectId, ref: 'Post' }],
  friends: [{ type: Schema.ObjectId, ref: 'User' }],
  friendRequests: [{ type: Schema.ObjectId, ref: 'User' }],
  sentRequests: [{ type: Schema.ObjectId, ref: 'User' }],
}, { versionKey: false });

User.path('email').validate(function (email) {
  return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}, 'This email address is not valid');

User.path('email').validate(function (email, done) {
  this.model('User').count({ email: email }, function (err, count) {
    if (err) {
      return done(err);
    }

    done(!count);
  });
}, 'This email address is already registered');

module.exports = mongoose.model('User', User);
