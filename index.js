'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

const getFullDimensions = function (key) {
  const match = key.match(/(\d+)x(\d+)\/(.*)/);
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  const originalKey = match[3];
  return {
    width,
    height,
    originalKey
  }
}

const getWidthOnlyDimensions = function (key) {
  const match = key.match(/w(\d+)\/(.*)/)
  const width = parseInt(match[1], 10);
  const height = null;
  const originalKey = match[2];
  return {
    width,
    height,
    originalKey
  }
}

exports.getDimensions = function (query) {
  let settings;
  if (query.match(/w\d+\/.*/)) {
    settings = getWidthOnlyDimensions(query)
  } else if (query.match(/\d+x\d+\/.*/)) {
    settings = getFullDimensions(query)
  } else {
    throw new Error('Unknown query string format')
  }
  return settings;
}

exports.handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  const {
    width,
    height,
    originalKey
  } = exports.getDimensions(key)

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => Sharp(data.Body)
      .resize(width, height)
      .toFormat('png')
      .toBuffer()
    )
    .then(buffer => S3.putObject({
        ACL: 'public-read',
        Body: buffer,
        Bucket: BUCKET,
        ContentType: 'image/png',
        Key: key,
      }).promise()
    )
    .then(() => callback(null, {
        statusCode: '301',
        headers: {'location': `${URL}/${key}`},
        body: '',
      })
    )
    .catch(err => callback(err))
}
