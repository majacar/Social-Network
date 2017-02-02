/**
 * Tests for User profile
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('User profile', function () {

  it('GET /profile/:id Should return not found', function (done) {
     userHelper.register_user(function (result1) {
     
      userHelper.register_user(function (result2) {

    request(app)
      .get('/api/v1/profile/' + result1.user._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + '')
      .expect(401)
      .end(function (err, res) {
        if (err) {
          throw err;
        }

        should.not.exist(err);
        res.body.message.should.equal('No authorization token was found');
        done();
      });
     });
    });
  });    

  it('GET /profile/:id Should return user profile', function (done) {
      userHelper.register_user(function (result1) {
     
      userHelper.register_user(function (result2) {
     

      request(app)
      .get('/api/v1/profile/' + result1.user._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result2.token)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          throw err;
        }

        should.not.exist(err);
        should.exist(res.body.results);
        res.body.status.should.equal('ok');
        done();
      });
    });
  });
  });
});
