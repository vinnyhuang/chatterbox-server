const fs = require('fs');
const path = require('path');

const SERVER_ROOT_PATH = '../client/client/';
const DEFAULT_INDEX_PAGE = 'index.html';
const DEFAULT_CONTENT_TYPE = 'text/json';
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css'
};

const requestHandler = function(request, response) {
  console.log(`Serving request type ${request.method} for url ${request.url}`);

  if (request.method === 'GET') {
    handleGET(request, response);
  } else if (request.method === 'POST') {
    handlePOST(request, response);
  } else if (request.method === 'OPTIONS') {
    handleOPTIONS(request, response);
  }
};

const handleGET = function(request, response) {
  const pathObject = path.parse(request.url);
  const absolutePath = path.join(
      __dirname,
      SERVER_ROOT_PATH,
      pathObject.dir === '/' ? DEFAULT_INDEX_PAGE : request.url
  );
  const extension = path.extname(absolutePath);

  fs.readFile(absolutePath, 'utf-8', function(error, data) {
    let statusCode, responseData;
    const headers = Object.assign({}, defaultCorsHeaders);

    if (!error) {
      statusCode = 200;
      headers['Content-Type'] = extension in CONTENT_TYPES ? CONTENT_TYPES[extension] : DEFAULT_CONTENT_TYPE;
      responseData = data;
    } else {
      statusCode = 404;
      responseData = 'Resource not found yo';
    }
    response.writeHead(statusCode, headers);
    response.end(responseData);
  });
};

const handlePOST = function(request, response) {
  const pathObject = path.parse(request.url);
  const absolutePath = path.join(
      __dirname,
      SERVER_ROOT_PATH,
      pathObject.dir === '/' ? DEFAULT_INDEX_PAGE : request.url
  );
  const extension = path.extname(absolutePath);

  const headers = Object.assign({}, defaultCorsHeaders);
  const statusCode = 201;
  headers['Content-Type'] = 'text/json';

  fs.readFile(absolutePath, 'utf-8', function(error, data) {
    if (error) { throw error; }

    const messages = JSON.parse(data).results;

    let responseJSONstring = '';
    request.on('data', chunk => responseJSONstring += chunk.toString());
    request.on('end', function() {
      messages.push(JSON.parse(responseJSONstring));
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify('yo we got that shit'));

      fs.writeFile(absolutePath, JSON.stringify({results: messages}), 'utf-8', function(error) {
        if (error) { throw error; }
        console.log('Sync complete');
      });
    });
  });


};

const handleOPTIONS = function(request, response) {
  const statusCode = 200;
  response.writeHead(statusCode, defaultCorsHeaders);
  response.end();
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
const defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

exports.requestHandler = requestHandler;
