// Quick test script to capture error details
require('./server.js');

// Give it a moment to start
setTimeout(async () => {
  const http = require('http');
  
  const req = http.get('http://localhost:3000/products', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
    });
  });
  
  req.on('error', (err) => {
    console.error('Request error:', err);
  });
}, 2000);
