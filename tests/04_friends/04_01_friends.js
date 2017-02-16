/**
 * Friend Requests and Add to friends
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('Send friend request and Add user to Friends', function () {

  it('POST /post Should return Friend request was sent', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

      request(app)
      .post('/api/v1/sendFriendRequest')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result1.token)
      .send({
          userid: result2.user._id
        })
      .expect(200)
      .end(function (err, res) {
          if (err) {
            throw err;
          }

          should.not.exist(err);
          res.body.message.should.equal('Friend request was sent');
          done();
        });
      });
     });
  });

  it('POST /post Should return Your request has already been sent', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

      request(app)
      .post('/api/v1/sendFriendRequest')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result1.token)
      .send({
          userid: result2.user._id
        })
      .end(function (err, res) {

        request(app)
        .post('/api/v1/sendFriendRequest')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + result1.token)
        .send({
          userid: result2.user._id
        })
        .expect(403)
        .end(function (err, res) {
            if (err) {
              throw err;
            }

            should.not.exist(err);
            res.body.message.should.equal('Your request has already been sent');
            done();
          });
        });
      });
    });
  });

 it('POST /post Should return You are now friends', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

      request(app)
      .post('/api/v1/addToFriends')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result1.token)
      .send({
          userid: result2.user._id
        })
      .expect(200)
      .end(function (err, res) {
          if (err) {
            throw err;
          }

          should.not.exist(err);
          res.body.message.should.equal('You are now friends');
          done();
        });
      });
     });
  });

   it('POST /post Should return You are already friends', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

      request(app)
      .post('/api/v1/addToFriends')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result1.token)
      .send({
          userid: result2.user._id
        })
      .end(function (err, res) {

        request(app)
        .post('/api/v1/sendFriendRequest')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + result1.token)
        .send({
          userid: result2.user._id
        })
        .expect(403)
        .end(function (err, res) {
            if (err) {
              throw err;
            }

            should.not.exist(err);
            res.body.message.should.equal('You are already friends');
            done();
          });
        });
      });
    });
  });

   it('GET /friends Should return my friends', function (done) {
    userHelper.register_user(function (result) {

      request(app)
        .get('/api/v1/friends')
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

    it('GET /friends Should return other user friends', function (done) {
    userHelper.register_user(function (result1) {

      userHelper.register_user(function (result2) {

      request(app)
        .get('/api/v1/friends/' + result2.user._id)
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
