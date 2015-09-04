'use strict';

var API_KEY;

// Private functions

/**
 * Validates input for upload method
 * @param {String} path Path to the image to be uploaded
 * @param {Object} options Options for upload
 * @param {String} [options.tags] CSV of tags to be associated to the image
 * @return {String|undefined} Error message if validation fails; undefined otherwise.
 */

function validateUpload(path, options) {
	if (!path){
		return '"path" is required';
	}
	if (typeof path !== 'string'){
		return 'Invalid format for "path"';
	}
	if (!API_KEY){
		return 'API Key not set';
	}
	if (options){
		if (options.tags){
			if (typeof options.tags !== 'string'){
				return 'Invalid format for "tags". A CSV of strings is expected.';
			}
		}
	}
	return;
}

/**
 * Validates input for transform method
 * @param {String} path Path to originial image on img-cloud server
 * @options {Object} options Transformation options
 * @return {String|undefined} Error message if validation fails; undefined otherwise.
 */
function validateTransform(path, options){
	if (!path){
		return '"path" is required';
	}
	if (options){
		if (options.height && isNaN(parseInt(options.height))){
			return 'Invalid type for height. Must be a number';
		}
		if (options.width && isNaN(parseInt(options.width))){
			return 'Invalid type for width. Must be a number';
		}
	}
	return;
}

/**
 * Returns the URL for the transformed image
 * @param {String} path Relative path for the original image file on img-cloud server
 * @param {Object} options Transformation options
 * @param {String} [options.height] Expected height of the transformed image
 * @param {String} [options.width] Expected width of the transformed image
 */
function getImageTagSource(path, options) {
	var tokens = path.split('/'),
		fileName = tokens[tokens.length - 1],
		transformationCsv = '';
	if (options){
		if (options.width){
			transformationCsv += 'w_' + options.height;
		}
		if (options.height){
			transformationCsv += 'h_' + options.height;
		}
	}
	return tokens.slice(0, tokens[tokens.length - 1]).concat([transformationCsv, fileName]).join('/');
}

/**
 * Returns the image tag attributes other than source
 * @param {Object} [options] Transformation options
 * @param {String} [options.height] Expected height of the transformed image
 * @param {String} [options.width] Expected width of the transformed image
 * @param {String} [options.class] CSS class to be used on the image DOM
 * @param {String} [options.alt] "alt" attribute to be used on the image DOM
 * @param {String} [options.title] "title" attribute to be used on the image DOM
 * @param {String} [options.style] "style" attribute to be used on the image DOM
 */
function getImageTagAttributes(options) {
	if (!options){
		return '';
	}
	var attributes = '';
	if (options.width){
		attributes += ' width="' + options.width + '"';
	}
	if (options.height){
		attributes += ' height="' + options.height + '"';
	}
	if (options.class){
		attributes += ' class="' + options.class + '"';
	}
	if (options.alt){
		attributes += ' alt="' + options.alt + '"';
	}
	if (options.title){
		attributes += ' title="' + options.title + '"';
	}
	if (options.style){
		attributes += ' style="' + options.style + '"';
	}
	return attributes;
}

// Public methods

/**
 * Sets configuration options used for image upload
 * @param {Object} options Configuration options
 * @param {String} options.apiKey API Key for img-cloud account
 */

module.exports.configure = function (options){
	if (!options){
		throw new Error('Missing configuration options');
	}
	if (!options.apiKey){
		throw new Error('Missing API Key');
	}
	API_KEY = options.apiKey;
};

/**
 * Uploads an image to img-cloud server
 * @param {String} path Path to the image to be uploaded - Required
 * @param {Object} options Options for upload
 * @param {String} [options.folder='default'] Name of the folder the image should be added to
 * @param {String} [options.tags] CSV of tags to be associated to the image
 * @example <caption>Example code for uploading a file </caption>
 * imgCloud.upload('my_file.png', {folder: 'avatar', tags: ['avatar', 'user']});
 * @return {Object} A JSON object that contains the file URL, folder name and tags
 * @example <caption>Example response</caption>
 * {
 *   "url": "http://www.imgcloud.io/ic_564323/4312345676_my_file.png",
 *   "folder": "avatar",
 *   "tags": "avatar, user"
 * }
 */
module.exports.upload = function (path, options, callback){
	var fs = require('fs'),
		request = require('request'),
		config = require('../config');
	var error = validateUpload(path, options);
	if (error){
		if (callback){
			callback(error, null);
		}
		return;
	}
	var data = {
		image: fs.createReadStream(path),
		apiKey: API_KEY
	};
	if (options.folder){
		data.folder = options.folder;
	}
	if (options.tags && options.tags.length){
		data.tags = options.tags;
	}
	request.post({
		url: config.endPointBase + config.endPoints.upload,
		formData: data
	}, function (requestError, httpResponse, result) {
		if (callback) {
			callback(requestError, result);	
		}
	});
};

/**
 * Returns img tag for the transformed image
 * @param {String} path Relative path for the original image file on img-cloud server
 * @param {Object} options Transformation options
 * @param {String} [options.height] Expected height of the transformed image
 * @param {String} [options.width] Expected width of the transformed image
 */
module.exports.transform = function (path, options){
	var error = validateTransform(path, options);
	if (error){
		throw new Error(error);
	}
	var source = getImageTagSource(path, options),
		attributes = getImageTagAttributes(options);
	return '<img src="' + source + '"' + attributes + '>';
};
