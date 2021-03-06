/**
 * View images from gallery
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');
var imageHelper = require('../helpers/image');

describe('View images from gallery', function () {

  it('GET /pictures Should return list of my pictures from gallery', function (done) {
     userHelper.register_user(function (result) {
      imageHelper.create_image(result.token, function (image) {

    request(app)
      .get('/api/v1/pictures/' + result.user._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result.token)
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


  it('GET /pictures Should return list of other user pictures from gallery', function (done) {
     userHelper.register_user(function (result1) {
     userHelper.register_user(function (result2) {

    request(app)
      .get('/api/v1/pictures/' + result1.user._id)
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
