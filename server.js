const http = require('http');
const app = require('./app');
    // look for PORT environment variable,
    // else look for CLI argument,
    // else use hard coded value for port 8080
const port =  process.env.PORT || process.argv[2] || 5000;

const server = http.createServer(app);

server.listen(port, ()=> {console.log('Server started...')});