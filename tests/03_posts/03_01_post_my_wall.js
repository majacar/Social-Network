/**
 * Post on my wall
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('Post on my wall', function () {

  it('POST /post Should return post on my wall - post text', function (done) {
     userHelper.register_user(function (result) {

    request(app)
      .post('/api/v1/post')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result.token)
      .send({  
          "text": "Hello"
      })
      .expect(201)
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

  it('POST /post Should return post on my wall - post image', function (done) {
     userHelper.register_user(function (result) {

    request(app)
      .post('/api/v1/post/')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result.token)
      .send({  
          "image": {
          "type": "png",
          "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
      })
      .expect(201)
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
