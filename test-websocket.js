import { WebSocket } from 'ws';

// Create a WebSocket connection
const ws = new WebSocket('ws://localhost:3001/ws');

// Connection opened
ws.on('open', function() {
  console.log('WebSocket connection established successfully!');
  
  // Send a test message
  ws.send(JSON.stringify({ type: 'test', message: 'Hello Server!' }));
  
  // Close the connection after 5 seconds
  setTimeout(() => {
    console.log('Closing connection...');
    ws.close();
    process.exit(0);
  }, 5000);
});

// Listen for messages
ws.on('message', function(data) {
  console.log('Message from server:', data.toString());
});

// Handle errors
ws.on('error', function(error) {
  console.error('WebSocket error:', error);
});

// Connection closed
ws.on('close', function() {
  console.log('Connection closed');
});

console.log('Attempting to connect to WebSocket server at ws://localhost:3001/ws...');
