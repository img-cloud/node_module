'use strict';

var config = require('../config');

var API_KEY;

// Private functions

/**
 * Validates input for upload method
 * @param {String} path Path to the image to be uploaded
 * @param {Object} options Options for upload
 * @param {String} [options.tags] CSV of tags to be associated to the image
 * @return {String|undefined} Error message if validation fails; undefined otherwise.
 */

function validateUpload(paths, options) {
	if (!paths){
		return '"paths" is required';
	}
	if (!(paths instanceof Array)){
		return 'Invalid format for "paths"';
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
 * Converts border color to format accepted by image cloud.
 * @params {String} borderColor
 * @return {String} borderColor
 */ 
function getImageBdrColor(borderColor){
	var color;
	if (borderColor){
    if (borderColor.substring(0, 1) === '#'){
      color = borderColor.replace('#', '');
    }else if (borderColor.substring(0, 3) === 'rgb'){  
      color = borderColor.replace(/,/g, '-');
      if (borderColor.substring(0, 4) === 'rgba'){
        var colorParams = color.split('-'),
					opacity = parseInt(parseFloat(colorParams.pop()) * 100);
        colorParams.push(opacity.toString() + ')');
        color = colorParams.join('-');
      }
    }else {
      color = borderColor;
    }  
  }else {
		return null;
  }
  return color;
}
/**
 * Validates input for transform method
 * @param {String} path Path to originial image on img-cloud server
 * @param {Object} options Transformation options
 * @return {String|undefined} Error message if validation fails; undefined otherwise.
 */
function validateTransform(path, options){
	if (!path){
		return '"path" is required';
	}
	if (options){
		if (typeof options.height !== 'undefined' && (options.height === null || options.height === 'undefined')){
			return 'Invalid value for height. Must be a number';
		}
		if (typeof options.width !== 'undefined' && (options.width === null || options.width === 'undefined')){
			return 'Invalid value for width. Must be a number';
		}
		if (typeof options.borderWidth !== 'undefined' && (options.borderWidth === null || options.borderWidth === 'undefined')){
			return 'Invalid value for borderWidth. Must be a Number';
		}
		if (typeof options.blur !== 'undefined' && (options.blur === null || options.blur === 'undefined')){
			return 'Invalid type for blur. Must be a number';
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
		fileName = tokens[1],
		bucketName = tokens[0],
		transformationCsvTokens = [];
	if (options){
		var borderColor = getImageBdrColor(options.borderColor);
		if (options.width){
			transformationCsvTokens.push('w_' + options.width);
		}
		if (options.height){
			transformationCsvTokens.push('h_' + options.height);
		}
		if (typeof options.crop !== 'undefined'){
			transformationCsvTokens.push('crop');
		}
		if (typeof options.scale !== 'undefined'){
			transformationCsvTokens.push('scale');
		}
		if (typeof options.grayscale !== 'undefined'){
			transformationCsvTokens.push('grayscale');
		}
		if (borderColor || options.borderWidth){
			var borderString = 'bdr_';
			if (options.borderWidth){
				borderString += options.borderWidth;
			}
			borderString += '-';
			if (borderColor){
				borderString += borderColor;
			}
			transformationCsvTokens.push(borderString);
		}
		if (options.blur){
			transformationCsvTokens.push('blur_' + options.blur);
		}
		if (options.sepia){
			transformationCsvTokens.push('sepia');
		}
		if (options.format){
			fileName = fileName.substring(0, fileName.lastIndexOf('.') + 1) + options.format;
		}
	}
	return [
		config.endPointBase,
		bucketName, 
		transformationCsvTokens.join(), 
		fileName
	].join('/');
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
module.exports.upload = function (paths, options, callback){
	var fs = require('fs'),
		request = require('request');
	var error = validateUpload(paths, options);
	if (error){
		if (callback){
			callback(error, null);
		}
		return;
	}
	var data = {
		images: paths.map(fs.createReadStream),
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

module.exports.delete = function (path, callback){
	var request = require('request');

	request.del({
		url: path + '?apiKey=' + API_KEY
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
 * @param {Number} [options.height] Expected height of the transformed image
 * @param {Number} [options.width] Expected width of the transformed image
 * @param {Boolean} [options.crop] Set to true if image needs to be cropped. Works in conjunction with options.width,
 *  options.height.
 * @param {Boolean} [options.scale] Set to true if image needs to be scaled. Works in conjunction with options.width and
 *  options.height
 * @param {Boolean} [options.grayscale] Set to true if the image needs to be transformed to a grayscale image
 * @param {String} [options.borderColor] Color of the border to be applied to the image
 * @param {Number} [options.borderWidth] Width of the border to be applied to the image
 * @param {Number} [options.blur] Blur value to be applied to the image
 * @param {Boolean} [options.sepia] Set to true if the image needs to be transformed to sepia
 * @param {String} [options.format] Target format for the image after transformation
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
