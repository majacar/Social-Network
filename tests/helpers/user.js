/*
 * Helper methods for tags tests
 */

var request = require('supertest'),
  app = require('../../app'),
  faker = require('faker'),
  async = require('async');

module.exports.register_user = function(cb) {

    var profile = {
    email: faker.internet.email().toLowerCase(),
    username: faker.internet.userName().toLowerCase(),
    password: 'pass'
  };

  request(app)
    .post('/api/v1/signup')
    .set('Accept', 'application/json')
    .send(profile)
    .expect(201)
    .end(function (err, res) {
      if (err) {
        throw err;
      }

      return cb({ token: res.body.token, user: res.body.results });
    });
};


