// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Instantiate the server
const server = http.createServer( (req, res) => {

    // Get the URL and parese it 
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as and obj
    const queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload if there is any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found use the 'not found' handler
        const chosenHandler = typeof(router[trimedPath]) !== 'undefined' ? router[trimedPath] : handlers.notFound;

        // Construct a data object to sand to the handler        
        const data = {
            'trimedPath' : trimedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        }

        // Route the request to handler specified n the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by handler, or default to 200 
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to string  
            const payloadString = JSON.stringify(payload);

            // Send responce 
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString)            
        });
    }); 
} );

const port = 3000;
// Start the http server
server.listen(port, () => {
    console.log( 'The server is listening to ' + port )
});

// Define handlers
const handlers = {};

// Hello handler
handlers.hello = (data, callback) => {
    // Only post requests receive the "Hello" message 
    if(data.method == 'post') {
        const name = data.payload ? JSON.parse(data.payload).name : '';    
        const msgEnd = typeof(name) == 'string' && name ? ', ' + name + '!' : '!';
        callback(200, {'msg' : 'Hello there' + msgEnd});
    } else {
        callback(200, {'msg' : 'No hello for you'});
    }
}

// Not found handler
handlers.notFound = (data, callback) => {
    // Callback a http status code, and payload object    
    callback(404, {'msg' : 'No hello for you'});
}

// Define a request router
const router = {
    'hello' : handlers.hello
}
