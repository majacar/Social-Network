/**
 * Upload image tests
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('Upload profile and background image', function () {

  it('POST /backgroundImage Should return uploaded background image', function (done) {
     userHelper.register_user(function (result) {

    request(app)
      .post('/api/v1/backgroundImage')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result.token)
      .send({        
           "image": {
           "description": "My picture",
           "data": {
               "type": "png",
               "base": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              }
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


  it('POST /profilePicture Should return uploaded profile picture', function (done) {
     userHelper.register_user(function (result) {

    request(app)
      .post('/api/v1/profilePicture')
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
