import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run a command
function runCommand(command, args, name) {
  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: true }
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`[${name}] ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.error(`[${name}] ${line}`);
    });
  });

  proc.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return proc;
}

// Start the API server
console.log('Starting API server...');
const apiServer = runCommand('node', ['--import=tsx', 'api/index.js'], 'API');

// Start the client
console.log('Starting client...');
const client = runCommand('npm', ['run', 'client'], 'CLIENT');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  apiServer.kill();
  client.kill();
  process.exit(0);
});
