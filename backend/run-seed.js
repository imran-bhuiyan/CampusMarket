#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Run ts-node with proper configuration
const tsNode = spawn('node', [
  '--require', 'ts-node/register',
  '--require', 'tsconfig-paths/register',
  path.join(__dirname, 'src/seed.ts')
], {
  cwd: __dirname,
  stdio: 'inherit',
  timeout: 60000
});

tsNode.on('error', (err) => {
  console.error('Error running seed:', err);
  process.exit(1);
});

tsNode.on('exit', (code) => {
  process.exit(code);
});
