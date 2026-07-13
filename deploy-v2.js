#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.yellow}[DEBUG]${colors.reset} ${msg}`),
};

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log.error('.env file not found. Please create .env with required variables.');
    process.exit(1);
  }

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

  return env;
}

// Validate required environment variables
function validateEnv(env) {
  const required = [
    'GITHUB_USERNAME',
    'GITHUB_TOKEN',
    'RENDER_API_KEY',
    'VERCEL_TOKEN',
    'DB_PASSWORD',
  ];

  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    log.error(`Missing environment variables: ${missing.join(', ')}`);
    log.info('Please update your .env file with these values.');
    process.exit(1);
  }
}

// Make HTTP/HTTPS request with better error handling
function makeRequest(method, hostname, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const protocol = hostname.includes('localhost') ? http : https;

    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'instagram-deploy-script/1.0',
        ...headers,
      },
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
            parseError: e.message,
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

// Wait with timeout
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get Render account info
async function getRenderAccountInfo(env) {
  log.step('Getting Render account information');

  try {
    const response = await makeRequest(
      'GET',
      'api.render.com',
      '/v1/owners',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` }
    );

    log.debug(`Owners response status: ${response.status}`);
    log.debug(`Owners response body: ${JSON.stringify(response.body, null, 2)}`);

    if (response.status !== 200) {
      const errorMsg = response.body?.message || 'Unknown error';
      throw new Error(`Failed to get owners: ${errorMsg}`);
    }

    // Extract owner ID from the response
    let ownerID = null;

    if (Array.isArray(response.body) && response.body.length > 0) {
      // Try nested owner object
      ownerID = response.body[0].owner?.id;
    }

    if (!ownerID) {
      throw new Error(`Could not extract owner ID from response: ${JSON.stringify(response.body)}`);
    }

    log.success(`Found Render account ID: ${ownerID}`);
    return ownerID;
  } catch (error) {
    log.error(`Failed to get Render account info: ${error.message}`);
    return null;
  }
}

// Step 1: Push code to GitHub
async function pushToGitHub(env) {
  log.step('Step 1: Pushing code to GitHub');

  try {
    const repoUrl = `https://github.com/${env.GITHUB_USERNAME}/instagram-clone.git`;

    // Check git status
    try {
      await execAsync('git status');
    } catch {
      log.error('Not a git repository');
      return false;
    }

    log.info('Adding remote...');
    try {
      await execAsync(`git remote add origin ${repoUrl}`);
    } catch {
      log.info('Remote already exists, skipping add');
    }

    log.info('Setting main branch...');
    await execAsync('git branch -M main');

    log.info('Pushing to GitHub...');
    await execAsync(`git push -u origin main`);

    log.success('Code pushed to GitHub!');
    return true;
  } catch (error) {
    log.error(`Failed to push to GitHub: ${error.message}`);
    return false;
  }
}

// Step 2: Create PostgreSQL database on Render
async function createRenderDatabase(env, ownerID) {
  log.step('Step 2: Creating PostgreSQL database on Render');

  try {
    log.info('Sending request to Render API...');

    const body = {
      name: 'instagram-postgres',
      databaseName: 'instagramclone',
      region: 'oregon',
      plan: 'free',
      type: 'pgsql',
      ownerID: ownerID,
    };

    log.debug(`Request body: ${JSON.stringify(body, null, 2)}`);

    const response = await makeRequest(
      'POST',
      'api.render.com',
      '/v1/services',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      body
    );

    log.debug(`Response status: ${response.status}`);
    log.debug(`Response body: ${response.rawBody.substring(0, 500)}`);

    if (response.status !== 201 && response.status !== 200) {
      const errorMsg = response.body?.message || response.body?.error || 'Unknown error';
      throw new Error(`API returned ${response.status}: ${errorMsg}`);
    }

    const db = response.body;
    if (!db || !db.id) {
      throw new Error('No service ID in response');
    }

    log.success(`Database created: ${db.name}`);
    log.info('Waiting for database to be ready (2-3 minutes)...');

    // Poll until database is ready
    let ready = false;
    let attempts = 0;
    const maxAttempts = 36; // 6 minutes at 10 second intervals

    while (!ready && attempts < maxAttempts) {
      await wait(10000);
      attempts++;

      const statusResponse = await makeRequest(
        'GET',
        'api.render.com',
        `/v1/services/${db.id}`,
        { Authorization: `Bearer ${env.RENDER_API_KEY}` }
      );

      const status = statusResponse.body?.status;
      log.info(`Status: ${status} (attempt ${attempts}/${maxAttempts})`);

      if (status === 'available') {
        ready = true;
        log.success('Database is ready!');
      }
    }

    if (!ready) {
      throw new Error('Database took too long to become available');
    }

    // Extract connection details
    const connStr = db.connectionString || '';
    const host = connStr.split('@')[1]?.split(':')[0] || db.host || '';
    const password = connStr.split('//')[1]?.split(':')[1] || '';

    log.info(`Database host: ${host}`);

    return {
      id: db.id,
      connectionString: connStr,
      host: host,
      password: password,
    };
  } catch (error) {
    log.error(`Failed to create database: ${error.message}`);
    return null;
  }
}

// Step 3: Create Redis on Render
async function createRenderRedis(env, ownerID) {
  log.step('Step 3: Creating Redis cache on Render');

  try {
    const body = {
      name: 'instagram-redis',
      region: 'oregon',
      plan: 'free',
      type: 'redis',
      ownerID: ownerID,
    };

    const response = await makeRequest(
      'POST',
      'api.render.com',
      '/v1/services',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      body
    );

    if (response.status !== 201 && response.status !== 200) {
      const errorMsg = response.body?.message || response.body?.error || 'Unknown error';
      throw new Error(`API returned ${response.status}: ${errorMsg}`);
    }

    const redis = response.body;
    if (!redis || !redis.id) {
      throw new Error('No service ID in response');
    }

    log.success(`Redis created: ${redis.name}`);
    log.info('Waiting for Redis to be ready (2-3 minutes)...');

    // Poll until Redis is ready
    let ready = false;
    let attempts = 0;
    const maxAttempts = 36;

    while (!ready && attempts < maxAttempts) {
      await wait(10000);
      attempts++;

      const statusResponse = await makeRequest(
        'GET',
        'api.render.com',
        `/v1/services/${redis.id}`,
        { Authorization: `Bearer ${env.RENDER_API_KEY}` }
      );

      const status = statusResponse.body?.status;
      log.info(`Status: ${status} (attempt ${attempts}/${maxAttempts})`);

      if (status === 'available') {
        ready = true;
        log.success('Redis is ready!');
      }
    }

    if (!ready) {
      throw new Error('Redis took too long to become available');
    }

    const connStr = redis.connectionString || '';
    const host = connStr.split('@')[1]?.split(':')[0] || redis.host || '';
    const port = connStr.split(':').pop()?.split('/')[0] || '6379';
    const password = connStr.split('//')[1]?.split(':')[1] || '';

    return {
      id: redis.id,
      connectionString: connStr,
      host: host,
      port: port,
      password: password,
    };
  } catch (error) {
    log.error(`Failed to create Redis: ${error.message}`);
    return null;
  }
}

// Main deployment flow
async function main() {
  console.log(`\n${colors.cyan}=== Instagram Clone Deployment ===${colors.reset}\n`);

  const env = loadEnv();
  validateEnv(env);

  log.info('Starting automated deployment...\n');

  // Get Render account ID first
  const ownerID = await getRenderAccountInfo(env);
  if (!ownerID) {
    log.error('Failed to get Render account information.');
    process.exit(1);
  }

  // Step 1: Push to GitHub
  const githubPushed = await pushToGitHub(env);
  if (!githubPushed) {
    log.error('Deployment failed at GitHub push step.');
    process.exit(1);
  }

  // Step 2: Create database
  const db = await createRenderDatabase(env, ownerID);
  if (!db) {
    log.error('Deployment failed at database creation.');
    log.info('Try checking your Render API key at https://dashboard.render.com');
    process.exit(1);
  }

  // Step 3: Create Redis
  const redis = await createRenderRedis(env, ownerID);
  if (!redis) {
    log.error('Deployment failed at Redis creation.');
    process.exit(1);
  }

  log.step('Next Steps');
  log.success('Database and Redis created successfully!');
  log.info('Database connection string:', db.connectionString);
  log.info('Redis connection string:', redis.connectionString);
  log.warn('For now, complete remaining steps manually at https://dashboard.render.com');
  log.info('\nStep 4: Deploy backend to Render');
  log.info('Step 5: Deploy frontend to Vercel');
  log.info('See DEPLOYMENT_SETUP.md for detailed instructions');
}

main().catch((error) => {
  log.error(`Deployment failed: ${error.message}`);
  process.exit(1);
});
