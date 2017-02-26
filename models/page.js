/**
 * Page Model
 * @type {exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');
var Image = require('../models/image');

var Page = new Schema({
  title: { type: String },	
  about: { type: String },
  image: { type: String },
  likes: Number,
  admin: { type: Schema.ObjectId, ref: 'User' },
  wall: { type: Schema.ObjectId, ref: 'Post' },
  date_created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Page', Page);
