// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer( (req, res) => {

    // Get the URL and parese it 
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the HTTP Method
    const method = req.method.toLowerCase();

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
            'method' : method,
            'payload' : buffer
        }

        // Route the request to handler specified in the router
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
        
        // Check if the data payload is JSON parsable
        try {
            const name = data.payload ? JSON.parse(data.payload).name : '';    
            const msgEnd = typeof(name) == 'string' && name ? ', ' + name + '!' : '!';
            callback(200, {'msg' : 'Hello there' + msgEnd});
        }
        catch(err) {
            callback(200, {'msg' : 'No hello for you', 'problem' : 'Need JSON or nothing'});
        }

    } else {
        callback(200, {'msg' : 'No hello for you', 'problem' : 'Only respond to POST requests'});
    }
}

// Not found handler
handlers.notFound = (data, callback) => {
    // Callback a http status code, and payload object    
    callback(404, {'msg' : 'No hello for you', 'problem' : 'Try going to /hello'});
}

// Define a request router
const router = {
    'hello' : handlers.hello
}
