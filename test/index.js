/// <reference path="../typings/mocha/mocha.d.ts"/>
'use strict';

var assert = require('assert'),
  imgCloud = require('../lib/index'),
  config = require('../config');

var TEST_API_KEY = config.testApiKey;

describe('img-cloud', function () {
  
  describe('configure', function(){
    it('should fail if no options are provided', function(){
      try {
        imgCloud.configure()
      } catch(e){
        assert(e.toString(), 'Missing configuration options');
      }
    });
    
    it('should fail if api key is provided', function(){
      try {
        imgCloud.configure({})
      } catch(e){
        assert(e.toString(), 'Missing API Key');
      }
    });
  });
  
  describe('upload', function(){
    it('should upload image to img-cloud server', function () {
      var options = {
        folder: 'nodeModuleTest',
        tags: ['test', 'node']
      };
      
      imgCloud.configure({
        apiKey: config.testApiKey 
      });
      
      imgCloud.upload('test/fixtures/test.jpg', options, function (error, data){
        var regEx = new RegExp(config.baseUrl + '/ic_.{6}/[0-9]*_test.jpg');
        assert(error, null);
        assert(data.url.match(regEx) !== null, true);
        assert(data.folder, 'nodeModuleTest');
        assert(data.tags, ['test', 'node']);
      });
    });
    
    it('should fail if input file path not specified', function () {
      imgCloud.upload('', {}, function (error, data){
        assert(error, '"path" is required');
      });
    });
    
    it('should fail if input file path is not a string', function () {
      imgCloud.upload({}, function (error, data){
        assert(error, 'Invalid format for "path"');
      });
    });
    
    it('should fail if api key is not set', function () {
      imgCloud.upload('test/fixtures/test.jpg', {}, function (error, data){
        assert(error, 'API Key not set');
      });
    });
    
    it('should fail if "tags" is not an array', function () {
      imgCloud.upload('test/fixtures/test.jpg', {tags: 'test, node'}, function (error, data){
        assert(error, 'Invalid format for "tags"');
      });
    });
  });
  
});
