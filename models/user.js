/**
 * User Model
 * @type {exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String },
  resetToken: String, // Used for storing a token for forgot password
  isActive: { type: Boolean, default: false },
  date_created: { type: Date, default: Date.now },
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
