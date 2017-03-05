var app = require('../../app');
var request = require('supertest');
var userHelper = require('./user');

module.exports.create_page = function(token, cb) {
  var page = {
     title: "Title"
  };

  request(app)
    .post('/api/v1/create_page')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    .send(page)
    .expect(201)
    .end(function (err, res) {
      if (err) {
        throw err;
      }

      return cb(res.body.results);
    });
};
