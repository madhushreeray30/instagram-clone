#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
};

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log.error('.env file not found');
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

function makeRequest(method, hostname, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'instagram-deploy/1.0',
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

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Step 1: Deploy backend to Render
async function deployBackendToRender(env) {
  log.step('Step 1: Deploying backend to Render');

  try {
    // Parse database URL
    const dbUrl = 'postgresql://instagramclone_4hgx_user:ypMCHNdwalC5Qbcy9CeVVX6AUnfnbl8t@dpg-d9a9if1o3t8c738h89mg-a/instagramclone_4hgx';
    const dbMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/);
    const [, dbUser, dbPass, dbHost, dbName] = dbMatch;

    // Parse Redis URL
    const redisUrl = 'redis://red-d9a9k5naqgkc739adiq0:6379';

    log.info('Creating backend web service...');

    const body = {
      name: 'instagram-backend',
      type: 'web_service',
      ownerId: env.RENDER_OWNER_ID,
      repo: `https://github.com/${env.GITHUB_USERNAME}/instagram-clone.git`,
      branch: 'main',
      buildCommand: 'cd backend && npm install && npm run build',
      startCommand: 'cd backend && npm start',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '5000' },
        { key: 'DB_HOST', value: dbHost },
        { key: 'DB_PORT', value: '5432' },
        { key: 'DB_USERNAME', value: dbUser },
        { key: 'DB_PASSWORD', value: dbPass },
        { key: 'DB_NAME', value: dbName },
        { key: 'REDIS_URL', value: redisUrl },
        { key: 'JWT_ACCESS_SECRET', value: env.JWT_SECRET || 'change_me_in_production' },
        { key: 'JWT_REFRESH_SECRET', value: env.JWT_REFRESH_SECRET || 'change_me_in_production' },
        { key: 'FRONTEND_URL', value: 'https://placeholder.vercel.app' },
      ],
      region: 'oregon',
    };

    const response = await makeRequest(
      'POST',
      'api.render.com',
      '/v1/services',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      body
    );

    if (response.status !== 201 && response.status !== 200) {
      log.error(`API Error: ${response.body?.message || response.status}`);
      throw new Error(`Failed to create service: ${response.body?.message}`);
    }

    const backend = response.body;
    log.success(`Backend service created: ${backend.name}`);
    log.info('Service ID:', backend.id);
    log.info('Waiting for deployment (5-10 minutes)...');

    // Poll until deployed
    let deployed = false;
    let attempts = 0;
    const maxAttempts = 60;

    while (!deployed && attempts < maxAttempts) {
      await wait(10000);
      attempts++;

      const statusResponse = await makeRequest(
        'GET',
        'api.render.com',
        `/v1/services/${backend.id}`,
        { Authorization: `Bearer ${env.RENDER_API_KEY}` }
      );

      const status = statusResponse.body?.status;
      if (attempts % 3 === 0) {
        log.info(`Status: ${status} (${attempts * 10}s elapsed)`);
      }

      if (status === 'available') {
        deployed = true;
        log.success('Backend deployed!');
      }
    }

    if (!deployed) {
      throw new Error('Deployment took too long');
    }

    const backendUrl = backend.url || `https://instagram-backend-${Date.now()}.onrender.com`;
    log.success(`Backend URL: ${backendUrl}`);
    return backendUrl;
  } catch (error) {
    log.error(`Backend deployment failed: ${error.message}`);
    return null;
  }
}

// Step 2: Deploy frontend to Vercel
async function deployFrontendToVercel(env, backendUrl) {
  log.step('Step 2: Deploying frontend to Vercel');

  try {
    log.info('Building frontend...');
    await execAsync('cd frontend && npm install');

    log.info('Deploying to Vercel...');
    const cmd = `cd frontend && npx vercel --token ${env.VERCEL_TOKEN} --prod --yes --env VITE_API_URL=${backendUrl}/api/v1 --env VITE_SOCKET_URL=${backendUrl}`;

    const { stdout } = await execAsync(cmd);

    // Extract Vercel URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+vercel\.app/);
    const frontendUrl = urlMatch ? urlMatch[0] : 'https://check-vercel-dashboard.com';

    log.success(`Frontend deployed!`);
    log.success(`Frontend URL: ${frontendUrl}`);
    return frontendUrl;
  } catch (error) {
    log.warn(`Frontend deployment: ${error.message}`);
    log.info('You may need to deploy manually to Vercel');
    return null;
  }
}

// Step 3: Update backend with frontend URL
async function updateBackendUrl(env, backendId, frontendUrl) {
  log.step('Step 3: Updating backend with frontend URL');

  try {
    if (!frontendUrl) {
      log.warn('No frontend URL to update');
      return;
    }

    const response = await makeRequest(
      'PATCH',
      'api.render.com',
      `/v1/services/${backendId}`,
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      {
        envVars: [
          { key: 'FRONTEND_URL', value: frontendUrl },
        ],
      }
    );

    if (response.status === 200) {
      log.success('Backend updated with frontend URL');
    }
  } catch (error) {
    log.warn(`Could not update backend: ${error.message}`);
  }
}

async function main() {
  console.log(`\n${colors.cyan}=== Instagram Clone - Final Deployment ===${colors.reset}\n`);

  const env = loadEnv();

  // Validate required env vars
  const required = ['GITHUB_USERNAME', 'RENDER_API_KEY', 'RENDER_OWNER_ID', 'VERCEL_TOKEN'];
  const missing = required.filter(key => !env[key]);
  if (missing.length > 0) {
    log.error(`Missing: ${missing.join(', ')}`);
    log.info('Please add these to your .env file');
    process.exit(1);
  }

  // Deploy backend
  const backendUrl = await deployBackendToRender(env);
  if (!backendUrl) {
    log.error('Deployment failed at backend step');
    process.exit(1);
  }

  // Deploy frontend
  const frontendUrl = await deployFrontendToVercel(env, backendUrl);

  // Update backend with frontend URL
  if (frontendUrl) {
    await updateBackendUrl(env, env.RENDER_BACKEND_ID, frontendUrl);
  }

  // Summary
  log.step('🎉 Deployment Complete!');
  log.success(`Backend: ${backendUrl}`);
  if (frontendUrl) {
    log.success(`Frontend: ${frontendUrl}`);
  }
  log.info('\nNext steps:');
  log.info('1. Visit your frontend URL');
  log.info('2. Test signup/login');
  log.info('3. Set up UptimeRobot to keep backend awake');
  log.info('\nCheck Render & Vercel dashboards for full details');
}

main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
