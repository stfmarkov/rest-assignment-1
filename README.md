# rest-assignment-1

POST requests to localhost:3000/hello should return:
- If there is a json object with "name" property - Personalized hello message
- If there is no data - General hello message
- If there is no JSON data - A none hello message and information about the problem

None POST requests to localhost:3000/hello should return:
- A none hello message and information about the problem

Any request to localhost:3000/noHelloPath should return:
- A none hello message and information about the problem
