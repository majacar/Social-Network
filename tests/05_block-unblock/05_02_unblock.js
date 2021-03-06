/**
 * Tests for unblock users
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('Unblock user', function () {

  it('POST /unblock Should return missing parameters', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

          request(app)
            .post('/api/v1/unblock')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + result1.token)
            .send('')
            .expect(400)
            .end(function (err, res) {
              if (err) {
                throw err;
              }

              should.not.exist(err);
              res.body.message.should.equal('Missing parameters');
              done();
            });
        });
    });
  });

  it('POST /unblock Should return successfully blocked', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

          request(app)
            .post('/api/v1/unblock')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + result1.token)
            .send({ userid: result2.user._id })
            .expect(200)
            .end(function (err, res) {
              if (err) {
                throw err;
              }

              should.not.exist(err);
              res.body.message.should.equal('Successfully unblocked');
              done();
            });
        });
    });
  });
});
