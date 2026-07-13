#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
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
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
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

// Make HTTP request
function makeRequest(method, hostname, path, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Step 1: Push code to GitHub
async function pushToGitHub(env) {
  log.step('Step 1: Pushing code to GitHub');

  try {
    const repoUrl = `https://github.com/${env.GITHUB_USERNAME}/instagram-clone.git`;

    // Check if remote exists
    const { stdout: remotes } = await execAsync('git remote -v');
    if (!remotes.includes('origin')) {
      log.info('Adding remote origin...');
      await execAsync(`git remote add origin ${repoUrl}`);
    }

    log.info('Ensuring main branch...');
    await execAsync('git branch -M main');

    log.info('Pushing to GitHub (this may take a minute)...');
    await execAsync(`git push -u origin main`);

    log.success('Code pushed to GitHub!');
    return true;
  } catch (error) {
    log.error(`Failed to push to GitHub: ${error.message}`);
    log.info('Make sure your GitHub token is valid and has repo permissions.');
    return false;
  }
}

// Step 2: Create PostgreSQL database on Render
async function createRenderDatabase(env) {
  log.step('Step 2: Creating PostgreSQL database on Render');

  try {
    const body = {
      name: 'instagram-postgres',
      databaseName: 'instagramclone',
      region: 'oregon',
      plan: 'free',
      type: 'postgresql',
    };

    const response = await makeRequest(
      'POST',
      'api.render.com',
      '/v1/services',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      body
    );

    if (response.status !== 201) {
      throw new Error(`API returned ${response.status}`);
    }

    const db = response.body;
    log.success(`Database created: ${db.name}`);
    log.info('Waiting for database to be ready (this takes 2-3 minutes)...');

    // Poll until database is ready
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 30) {
      await new Promise((r) => setTimeout(r, 10000)); // Wait 10 seconds
      attempts++;

      const statusResponse = await makeRequest(
        'GET',
        'api.render.com',
        `/v1/services/${db.id}`,
        { Authorization: `Bearer ${env.RENDER_API_KEY}` }
      );

      if (statusResponse.body.status === 'available') {
        ready = true;
        log.success('Database is ready!');
      } else {
        log.info(`Status: ${statusResponse.body.status} (attempt ${attempts}/30)`);
      }
    }

    if (!ready) {
      throw new Error('Database took too long to become available');
    }

    return {
      id: db.id,
      connectionString: db.connectionString,
      host: db.connectionString.split('@')[1].split(':')[0],
      password: db.connectionString.split('//')[1].split(':')[1],
    };
  } catch (error) {
    log.error(`Failed to create database: ${error.message}`);
    return null;
  }
}

// Step 3: Create Redis on Render
async function createRenderRedis(env) {
  log.step('Step 3: Creating Redis cache on Render');

  try {
    const body = {
      name: 'instagram-redis',
      region: 'oregon',
      plan: 'free',
      type: 'redis',
    };

    const response = await makeRequest(
      'POST',
      'api.render.com',
      '/v1/services',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      body
    );

    if (response.status !== 201) {
      throw new Error(`API returned ${response.status}`);
    }

    const redis = response.body;
    log.success(`Redis created: ${redis.name}`);
    log.info('Waiting for Redis to be ready...');

    // Poll until Redis is ready
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 30) {
      await new Promise((r) => setTimeout(r, 10000));
      attempts++;

      const statusResponse = await makeRequest(
        'GET',
        'api.render.com',
        `/v1/services/${redis.id}`,
        { Authorization: `Bearer ${env.RENDER_API_KEY}` }
      );

      if (statusResponse.body.status === 'available') {
        ready = true;
        log.success('Redis is ready!');
      } else {
        log.info(`Status: ${statusResponse.body.status} (attempt ${attempts}/30)`);
      }
    }

    if (!ready) {
      throw new Error('Redis took too long to become available');
    }

    return {
      id: redis.id,
      connectionString: redis.connectionString,
      host: redis.connectionString.split('@')[1].split(':')[0],
      port: redis.connectionString.split(':').pop(),
      password: redis.connectionString.split('//')[1].split(':')[1],
    };
  } catch (error) {
    log.error(`Failed to create Redis: ${error.message}`);
    return null;
  }
}

// Step 4: Deploy backend to Render
async function deployBackendToRender(env, db, redis) {
  log.step('Step 4: Deploying backend to Render');

  try {
    const body = {
      name: 'instagram-backend',
      type: 'web',
      region: 'oregon',
      plan: 'free',
      github: {
        repo: `${env.GITHUB_USERNAME}/instagram-clone`,
        branch: 'main',
      },
      buildCommand: 'cd backend && npm install && npm run build',
      startCommand: 'cd backend && npm start',
      env: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '5000' },
        { key: 'DB_HOST', value: db.host },
        { key: 'DB_PORT', value: '5432' },
        { key: 'DB_USERNAME', value: 'postgres' },
        { key: 'DB_PASSWORD', value: db.password },
        { key: 'DB_NAME', value: 'instagramclone' },
        { key: 'REDIS_HOST', value: redis.host },
        { key: 'REDIS_PORT', value: redis.port },
        { key: 'REDIS_PASSWORD', value: redis.password },
        { key: 'JWT_ACCESS_SECRET', value: env.JWT_SECRET || 'super_secret_key_change_me' },
        { key: 'JWT_REFRESH_SECRET', value: env.JWT_REFRESH_SECRET || 'super_refresh_secret_change_me' },
        { key: 'FRONTEND_URL', value: 'https://placeholder.vercel.app' },
      ],
    };

    const response = await makeRequest(
      'POST',
      'api.render.com',
      '/v1/services',
      { Authorization: `Bearer ${env.RENDER_API_KEY}` },
      body
    );

    if (response.status !== 201) {
      throw new Error(`API returned ${response.status}`);
    }

    const backend = response.body;
    log.success(`Backend service created: ${backend.name}`);
    log.info('Waiting for deployment to complete (this takes 5-10 minutes)...');

    // Poll until deployed
    let deployed = false;
    let attempts = 0;
    while (!deployed && attempts < 60) {
      await new Promise((r) => setTimeout(r, 10000));
      attempts++;

      const statusResponse = await makeRequest(
        'GET',
        'api.render.com',
        `/v1/services/${backend.id}`,
        { Authorization: `Bearer ${env.RENDER_API_KEY}` }
      );

      if (statusResponse.body.status === 'available') {
        deployed = true;
        log.success('Backend deployed!');
      } else {
        log.info(`Status: ${statusResponse.body.status} (attempt ${attempts}/60)`);
      }
    }

    if (!deployed) {
      throw new Error('Backend deployment took too long');
    }

    return {
      id: backend.id,
      url: backend.url,
    };
  } catch (error) {
    log.error(`Failed to deploy backend: ${error.message}`);
    return null;
  }
}

// Step 5: Run database migrations
async function runMigrations(backendUrl) {
  log.step('Step 5: Running database migrations');

  try {
    log.info('Calling migration endpoint...');
    const response = await makeRequest(
      'POST',
      new URL(backendUrl).hostname,
      '/api/v1/migrations',
      {},
      {}
    );

    if (response.status === 200) {
      log.success('Migrations completed!');
      return true;
    } else {
      throw new Error(`Migration returned ${response.status}`);
    }
  } catch (error) {
    log.warn(`Could not verify migrations via API: ${error.message}`);
    log.info('You may need to run migrations manually on Render.');
    return false;
  }
}

// Step 6: Deploy frontend to Vercel
async function deployFrontendToVercel(env, backendUrl) {
  log.step('Step 6: Deploying frontend to Vercel');

  try {
    log.info('Installing Vercel CLI...');
    await execAsync('npm install -g vercel');

    log.info('Deploying to Vercel...');
    await execAsync(
      `cd frontend && vercel --token=${env.VERCEL_TOKEN} --confirm --prod --env VITE_API_URL=${backendUrl}/api/v1 --env VITE_SOCKET_URL=${backendUrl}`
    );

    log.success('Frontend deployed to Vercel!');
    return true;
  } catch (error) {
    log.error(`Failed to deploy frontend: ${error.message}`);
    log.info('You may need to deploy manually on vercel.com');
    return false;
  }
}

// Main deployment flow
async function main() {
  console.log(`\n${colors.cyan}=== Instagram Clone Deployment ===${colors.reset}\n`);

  const env = loadEnv();
  validateEnv(env);

  log.info('Starting automated deployment...\n');

  // Step 1: Push to GitHub
  const githubPushed = await pushToGitHub(env);
  if (!githubPushed) {
    log.error('Deployment failed at GitHub push step.');
    process.exit(1);
  }

  // Step 2: Create database
  const db = await createRenderDatabase(env);
  if (!db) {
    log.error('Deployment failed at database creation.');
    process.exit(1);
  }

  // Step 3: Create Redis
  const redis = await createRenderRedis(env);
  if (!redis) {
    log.error('Deployment failed at Redis creation.');
    process.exit(1);
  }

  // Step 4: Deploy backend
  const backend = await deployBackendToRender(env, db, redis);
  if (!backend) {
    log.error('Deployment failed at backend deployment.');
    process.exit(1);
  }

  // Step 5: Run migrations
  await runMigrations(backend.url);

  // Step 6: Deploy frontend
  const frontendDeployed = await deployFrontendToVercel(env, backend.url);
  if (!frontendDeployed) {
    log.warn('Frontend deployment needs manual completion.');
  }

  // Summary
  log.step('Deployment Complete! 🎉');
  log.success(`Backend: ${backend.url}`);
  log.success('Frontend: Check your Vercel dashboard');
  log.info('Next steps:');
  log.info('1. Verify services are running');
  log.info('2. Test signup and login');
  log.info('3. Set up UptimeRobot to keep services awake');
}

main().catch((error) => {
  log.error(`Deployment failed: ${error.message}`);
  process.exit(1);
});
