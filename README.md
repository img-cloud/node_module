# img-cloud [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> A node client to easily upload to and retrieve from img-cloud server


## Install

```sh
$ npm install --save img-cloud
```


## Usage

# Configuring your client
```js
var imgCloud = require('img-cloud');

imgCloud.configure({apiKey: <YOUR_API_KEY>});

// Vist http://www.imgcloud.io to find out how to get your API key 
```

# Uploading an image
```js
var imgCloud = require('img-cloud');

imgCloud.configure({apiKey: <YOUR_API_KEY>});

imgCloud.upload(_dirName + '/uploads/my_img.jpg', {
	folder: 'profile',
	tags: 'user, profile'
});

/**
 * The response looks like
 * {
 *   "url": "http://www.imgcloud.io/ic_12345/1234567_my_img.jpg",
 *   "folder": "profile",
 *   "tags": ["user", "profile"]
 * } 
 */
```

# Getting an embeddable image tag
```js
var imgCloud = require('img-cloud');

imgCloud.configure({apiKey: <YOUR_API_KEY>});

imgCloud.transform('ic_12345/1234567_my_img.jpg', {
	height: 150,
	width: 150
});

/**
 * This returns a string for a DOM element
 * <img src="http://www.imgcloud.io/ic_12345/w_150,h_150/1234567_my_img.jpg" width="150" height="150">
 * /
```

## License

MIT © [Liftoff LLC]


[npm-image]: https://badge.fury.io/js/img-cloud.svg
[npm-url]: https://npmjs.org/package/img-cloud
[travis-image]: https://travis-ci.org/img-cloud/img-cloud.svg?branch=master
[travis-url]: https://travis-ci.org/img-cloud/img-cloud
[daviddm-image]: https://david-dm.org/img-cloud/img-cloud.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/img-cloud/img-cloud
