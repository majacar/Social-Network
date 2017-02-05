var app = require('../../app');
var request = require('supertest');
var userHelper = require('./user');

module.exports.create_image = function(token, cb) {
  var image = {
    image: {
      description: 'slika',
      data: {
        type: 'png',
        base: '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'
      }
    }
  };

  request(app)
    .post('/api/v1/backgroundImage')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    .send(image)
    .expect(201)
    .end(function (err, res) {
      if (err) {
        throw err;
      }

      return cb(res.body.results);
    });
};
