/*
 * Tests user signin
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('./../helpers/user');

describe('Sign in', function () {

  it('POST /signin Should return missing parameters', function (done) {
    var profile = {
      username: faker.internet.email().toLowerCase()
    };

    request(app)
      .post('/api/v1/signin')
      .set('Accept', 'application/json')
      .send(profile)
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

  it('POST /signin Should return wrong credentials for not found', function (done) {

    var profile = {
      email: faker.internet.email().toLowerCase(),
      password: 'pass'
    };

    request(app)
      .post('/api/v1/signin')
      .set('Accept', 'application/json')
      .send(profile)
      .expect(401)
      .end(function (err, res) {
        if (err) {
          throw err;
        }

        should.not.exist(err);
        res.body.message.should.equal('Wrong credentials');
        done();
      });
  });

   it('POST /signin Should return invalid email error', function (done) {
    var profile = {
      email: 'bad_email.com',
      password: 'pass'
    };
    request(app)
      .post('/api/v1/signin')
      .set('Accept', 'application/json')
      .send(profile)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        should.not.exist(err);
        res.body.message.should.equal('Please fill a valid email address');
        done();
      });
  });

 it('POST /signin Should successfully sign in', function (done) {

    userHelper.register_user(function (result) {
      var profile = {
        email: result.user.email,
        password: 'pass'
      };
      request(app)
        .post('/api/v1/signin')
        .set('Accept', 'application/json')
        .send(profile)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          should.not.exist(err);
          should.exist(res.body.token);
          should.exist(res.body.results);
          res.body.status.should.equal('ok');
          done();
        });
    });
  });

});
