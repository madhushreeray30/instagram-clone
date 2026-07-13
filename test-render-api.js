#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const apiKey = env.RENDER_API_KEY;
const ownerID = 'tea-d8f9p28g4nts738naq50'; // From previous run

function makeRequest(method, hostname, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'test-render-api/1.0',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            body: parsed,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: null,
            rawBody: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('Testing Render API endpoints...\n');

  const endpoints = [
    // Try different paths for databases
    { method: 'GET', path: '/v1/databases', desc: 'List databases' },
    { method: 'GET', path: '/v1/postgresql', desc: 'Get PostgreSQL info' },
    { method: 'POST', path: '/v1/databases', body: { name: 'test' }, desc: 'Create via /databases' },
    { method: 'POST', path: '/v1/postgresql', body: { name: 'test' }, desc: 'Create via /postgresql' },

    // Try creating as a service with different types
    {
      method: 'POST',
      path: '/v1/services',
      body: {
        name: 'test-db',
        ownerID: ownerID,
        type: 'database',
      },
      desc: 'Service type: database',
    },
    {
      method: 'POST',
      path: '/v1/services',
      body: {
        name: 'test-db',
        ownerID: ownerID,
        type: 'postgresql',
      },
      desc: 'Service type: postgresql',
    },
    {
      method: 'POST',
      path: '/v1/services',
      body: {
        name: 'test-db',
        ownerID: ownerID,
        type: 'postgres',
      },
      desc: 'Service type: postgres',
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n[TEST] ${endpoint.desc}`);
      console.log(`${endpoint.method} ${endpoint.path}`);

      const response = await makeRequest(
        endpoint.method,
        'api.render.com',
        endpoint.path,
        { Authorization: `Bearer ${apiKey}` },
        endpoint.body
      );

      console.log(`Status: ${response.status}`);
      if (response.body) {
        console.log(`Response: ${JSON.stringify(response.body).substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

testEndpoints().catch(console.error);
