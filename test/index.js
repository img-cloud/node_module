/// <reference path="../typings/mocha/mocha.d.ts"/>
'use strict';

var assert = require('assert'),
  imgCloud = require('../lib/index'),
  config = require('../config');

describe('img-cloud', function () {
 
  describe('configure', function (){
    it('should fail if no options are provided', function (){
      try {
        imgCloud.configure();
      } catch (e){
        assert(e.toString(), 'Missing configuration options');
      }
    });

    it('should fail if api key is provided', function (){
      try {
        imgCloud.configure({});
      } catch (e){
        assert(e.toString(), 'Missing API Key');
      }
    });
  });
  
  describe('upload', function (){
    it('should upload image to img-cloud server', function () {
      var options = {
        folder: 'nodeModuleTest',
        tags: 'test, node'
      };
      
      imgCloud.configure({
        apiKey: config.testApiKey
      });
      
      imgCloud.upload('test/fixtures/test.jpg', options, function (error, data){
        var regEx = new RegExp(config.baseUrl + '/ic_.{6}/[0-9]*_test.jpg');
        assert(error, null);
        assert(data.url !== null, true);
        assert(data.url.match(regEx) !== null, true);
        assert(data.folder, 'nodeModuleTest');
        assert(data.tags, ['test', 'node']);
      });
    });
    
    it('should fail if input file path not specified', function () {
      imgCloud.upload('', {}, function (error){
        assert(error, '"path" is required');
      });
    });
    
    it('should fail if input file path is not a string', function () {
      imgCloud.upload({}, function (error){
        assert(error, 'Invalid format for "path"');
      });
    });
    
    it('should fail if api key is not set', function () {
      imgCloud.upload('test/fixtures/test.jpg', {}, function (error){
        assert(error, 'API Key not set');
      });
    });
    
    it('should fail if "tags" is not a string', function () {
      imgCloud.upload('test/fixtures/test.jpg', {tags: ['test', 'node']}, function (error){
        assert(error, 'Invalid format for "tags". A CSV of strings is expected.');
      });
    });
  });
  
  describe('transform', function (){
    it('should fail if path is not provided', function (){
      try {
        imgCloud.transform('', {});  
      } catch (e){
        assert(e.toString(), '"path" is required');
      }
    });
    
    it('should fail if height is not a number', function (){
      try {
        imgCloud.transform('/path/to/file', {height: 'abc'});  
      } catch (e){
        assert(e.toString(), 'Invalid type for height. Must be a number');
      }
    });
    
    it('should fail if width is not a number', function (){
      try {
        imgCloud.transform('/path/to/file', {width: 'abc'});  
      } catch (e){
        assert(e.toString(), 'Invalid type for width. Must be a number');
      }
    });
    
    it('should return the URL for the transformed image', function (){
      var imageTag = imgCloud.transform('icp_ca3a83/1441279211081_test.jpg', {
        width: 150, 
        height: 150,
        class: 'test-class',
        alt: 'test image',
        title: 'test-title',
        style: 'width: 150px'
      });
      var expectedTag = '<img src="' + config.endPointBase + 'icp_ca3a83/w_150,h_150/1441279211081_test.jpg" \
         width="150" \
         height="150" \
         class="test-class" \
         alt="test image" \
         title="test-title" \
         style="width: 150px">';
      assert(imageTag, expectedTag);
    });
    
    it('should return the origninal URL if no transformation options are provided', function (){
      var imageTag = imgCloud.transform('icp_ca3a83/1441279211081_test.jpg');
      var expectedTag = '<img src="' + config.endPointBase + 'icp_ca3a83/1441279211081_test.jpg">';
      assert(imageTag, expectedTag);
    });
  });
  
});
