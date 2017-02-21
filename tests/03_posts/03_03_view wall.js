/**
 * View my and other users wall
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('View my and other users wall', function () {

  it('GET /posts Should return my wall with posts', function (done) {
    userHelper.register_user(function (result) {

      request(app)
        .get('/api/v1/posts')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + result.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }

          should.not.exist(err);
          should.exist(res.body.results);
          done();
        });
    });
  });

    it('GET /user_posts Should return other users wall with posts', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

      request(app)
        .get('/api/v1/user_posts/' + result2.user._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + result1.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }

          should.not.exist(err);
          should.exist(res.body.results);
          done();
        });
      });
    });
  });

});
