/**
 * Create new page
 */

var app = require('../../app');
var request = require('supertest');
var should = require('chai').should();
var faker = require('faker');
var userHelper = require('../helpers/user');
var pageHelper = require('../helpers/page');

describe('Create new page', function () {

  it('POST /create_page Should return created page', function (done) {
     userHelper.register_user(function (result) {

     pageHelper.create_page(result.token, function (results) {
       done();
   
      });
    });
   });

});
