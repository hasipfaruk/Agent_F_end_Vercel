import { WebSocket } from 'ws';

const ws = new WebSocket('wss://agent-backend-typescript.onrender.com/ws');

ws.on('open', function () {
  console.log('✅ WebSocket connection established with Render!');
  ws.send(JSON.stringify({ type: 'test', message: 'Hello Render Server!' }));

  setTimeout(() => {
    console.log('🔌 Closing WebSocket connection...');
    ws.close();
    process.exit(0);
  }, 5000);
});

ws.on('message', function (data) {
  console.log('📨 Message from Render server:', data.toString());
});

ws.on('error', function (error) {
  console.error('❌ WebSocket error:', error);
});

ws.on('close', function () {
  console.log('🔒 Connection closed');
});

console.log('🌐 Attempting to connect to WebSocket server at wss://agent-backend-typescript.onrender.com/ws...');
