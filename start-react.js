const { spawn } = require('child_process');
const path = require('path');

console.log('Starting React development server...');

const webDir = path.join(__dirname, 'web');
console.log('Web directory:', webDir);

// Set environment variables
process.env.BROWSER = 'none';
process.env.PORT = '3000';

const child = spawn('npm', ['start'], {
  cwd: webDir,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start React app:', error);
});

child.on('close', (code) => {
  console.log(`React app process exited with code ${code}`);
});

console.log('React development server starting...');
console.log('It will be available at http://localhost:3000');
console.log('Press Ctrl+C to stop the server');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down React development server...');
  child.kill();
  process.exit();
});
