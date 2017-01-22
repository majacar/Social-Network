/**
 * Tests user sign up
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');

describe('Sign up', function () {

    var profile = {
      email: 'majacar@maildrop.cc',
      username: 'majacar',
      password: '123'
    };

    it('POST /signup Should return successfully registered', function (done) {

    request(app)
      .post('/api/v1/signup')
      .set('Accept', 'application/json')
      .send(profile)
      .expect(201)
      .end(function (err, res) {
        if (err) {
          throw err;
        }

        should.not.exist(err);
        should.exist(res.body.token);

        // assign user globaly
        global.user = res.body.results;

        done();
      });
  });

  it('POST /signup should give error if profile already exists', function(done) {

    request(app)
      .post('/api/v1/signup')
      .set('Accept', 'application/json')
      .send(profile)
      .expect(401)
      .end(function(err, res) {
        res.body.message.should.equal("This email address is already registered");
        res.body.status.should.equal('error');
        done();
      });
  });

  it('POST /signup Should return missing parameters if email is missing', function (done) {
    var profile = {
      username: faker.username,
      password: "123"
    };

    request(app)
      .post('/api/v1/signup')
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

   it('POST /signup Should return missing parameters if username is missing', function (done) {
    var profile = {
      email: faker.internet.email().toLowerCase(),
      password: "123"
    };

    request(app)
      .post('/api/v1/signup')
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

    it('POST /signup Should return missing parameters if password is missing', function (done) {
    var profile = {
      email: faker.internet.email().toLowerCase(),
      username: faker.username
    };

    request(app)
      .post('/api/v1/signup')
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


});
