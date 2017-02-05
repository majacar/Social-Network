/**
 * Edit profile tests
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');

describe('Edit profile', function () {

  it('PUT /edit/:id Should return not found', function (done) {
     userHelper.register_user(function (result) {

    request(app)
      .put('/api/v1/edit/' + result.user._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + '')
      .send({ 
        'fullName': 'Maja Car'
      })
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


  it('PUT /edit/:id Should return successfully updated', function (done) {
   
   userHelper.register_user(function (result) {

    request(app)
      .put('/api/v1/edit/' + result.user._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + result.token)
      .send({ 
        'fullName': 'Maja Car'
      })
      .expect(201)
      .end(function (err, res) {
        if (err) {
          throw err;
        }

        should.not.exist(err);
        should.exist(res.body.results);
        res.body.message.should.equal('Successfully updated');
        done();
      });
    });
   });

});
