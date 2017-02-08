/**
 * Post Model
 * @type {exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');
var Image = require('../models/image');

var Post = new Schema({
  text: { type: String },
  image: { type: String },
  creator: { type: Schema.ObjectId, ref: 'User' } },
  { timestamps: true }
);

module.exports = mongoose.model('Post', Post);
