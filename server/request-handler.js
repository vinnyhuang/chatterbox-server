const fs = require('fs');
const path = require('path');

const SERVER_ROOT_PATH = '../client/client/';
const ROOT_DEFAULT_FILE = 'index.html';
const DEFAULT_CONTENT_TYPE = 'text/json';
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css'
};

const messages = [];

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
    pathObject.dir === '/' ? ROOT_DEFAULT_FILE : request.url
  );
  const extension = path.extname(absolutePath);

  fs.exists(absolutePath, function(exists) {
    if (exists) {
      fs.readFile(absolutePath, 'utf-8', (error, data) => {
        if (error) { throw error; }
        
        const statusCode = 200;
        const headers = Object.assign({}, defaultCorsHeaders);
        headers['Content-Type'] = extension in CONTENT_TYPES ? CONTENT_TYPES[extension] : DEFAULT_CONTENT_TYPE;

        response.writeHead(statusCode, headers);
        response.end(data);
      });
    } else {
      const statusCode = 404;
      const headers = defaultCorsHeaders;
      const responseData = 'Resource not found yo';

      response.writeHead(statusCode, headers);
      response.end(responseData);
    }
  });
};

const handlePOST = function(request, response) {
  const headers = Object.assign({}, defaultCorsHeaders);
  const statusCode = 201;
  headers['Content-Type'] = 'text/json';

  let responseJSONstring = '';
  request.on('data', chunk => responseJSONstring += chunk.toString());
  request.on('end', () => {
    messages.push(JSON.parse(responseJSONstring));
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify('yo we got that shit'));
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
