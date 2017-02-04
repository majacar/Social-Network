/**
 * Image Model
 * @type {exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

var Image = new Schema({
  url: { type: String, required: true, unique: true },
  description: { type: String },
  creator: { type: Schema.ObjectId, ref: 'User' } },
  { timestamps: true }
);

module.exports = mongoose.model('Image', Image);
