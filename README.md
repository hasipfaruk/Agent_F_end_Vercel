# Hyper Design Intelligence

A platform for digital twins with WebSocket communication.

## Running Locally with WebSocket Support

This application now uses WebSockets for real-time communication between the client and server. To run the application locally with WebSocket support:

```bash
# Install dependencies
npm install

# Start the application with WebSocket support
npm run start:websocket
```

This will start both the server (with WebSocket support) and the client. The application will be available at http://localhost:3001.

## WebSocket Implementation

The WebSocket implementation provides real-time updates for:
- Agent status changes
- Agent metrics updates

The WebSocket server is available at `ws://localhost:3001/ws` when running locally.

## Deploying to AWS EC2

To deploy the application to AWS EC2:

1. Build the application for EC2 deployment:
   ```bash
   npm run build:ec2
   ```

2. Copy the build files to your EC2 instance:
   ```bash
   scp -r dist ec2-user@your-ec2-instance:/path/to/app
   ```

3. SSH into your EC2 instance:
   ```bash
   ssh ec2-user@your-ec2-instance
   ```

4. Install Node.js and dependencies:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install dependencies
   cd /path/to/app
   npm install --production
   ```

5. Start the server:
   ```bash
   npm run start:ec2
   ```

6. (Optional) Set up a process manager like PM2 to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start npm --name "hyper-design" -- run start:ec2
   pm2 save
   pm2 startup
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=your_database_url

# ElevenLabs API (for voice synthesis)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# For EC2 deployment
PORT=3000
NODE_ENV=production
```

## API Endpoints

- `/api/health` - Health check endpoint
- `/api/agents` - Get all agents
- `/api/agents/:id/status` - Update agent status
- `/api/agents/:id/metrics` - Update agent metrics
- `/api/voice/voices` - Get available voices
- `/api/voice/synthesize` - Synthesize speech

## WebSocket Protocol

The WebSocket server accepts and sends messages in the following format:

```json
{
  "type": "message_type",
  "data": {}
}
```

### Message Types

- `agents_update` - Server sends this message when agents are updated
- `update_status` - Client sends this message to update an agent's status
- `update_metrics` - Client sends this message to update an agent's metrics

## Troubleshooting

If you encounter any issues with WebSocket connections:

1. Check that your firewall allows WebSocket connections (port 3000 by default)
2. Ensure that your EC2 security group allows inbound traffic on port 3000
3. Check the server logs for any connection errors
4. Verify that your client is connecting to the correct WebSocket URL
