/**
 * Tests for reset password
 */

var app = require('../../app'),
  request = require('supertest'),
  should = require('chai').should(),
  userHelper = require('./../helpers/user'),
  moment = require('moment'),
  faker = require('faker');

var admin;
describe('Forgot password', function () {

  it('POST /forgot Should return missing parameters', function (done) {
    request(app)
      .post('/api/v1/forgot')
      .set('Accept', 'application/json')
      .send()
      .expect(400)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        should.not.exist(err);
        res.body.status.should.equal('error');
        res.body.message.should.equal('Missing parameters');
        done();
      });
  });

  it('POST /forgot Should return email does not exist', function (done) {
    var data = {
      email: faker.internet.email().toLowerCase()
    };
    request(app)
      .post('/api/v1/forgot')
      .set('Accept', 'application/json')
      .send(data)
      .expect(404)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        should.not.exist(err);
        res.body.status.should.equal('error');
        res.body.message.should.equal('User with this email address does not exist');
        done();
      });
  });

  it('POST /forgot Should return successfully send reset code to e-mail', function (done) {
    userHelper.register_user(function (result) {
    
      request(app)
        .post('/api/v1/forgot')
        .set('Accept', 'application/json')
        .send({ email: result.user.email })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          should.not.exist(err);
          res.body.status.should.equal('ok');
          should.exist(res.body.reset_token);
          should.exist(res.body.tmp_expiry);
          result.reset_token = res.body.reset_token;
          res.body.message.should.equal('Password reset email sent');
          done();
        });
    });
  });

});