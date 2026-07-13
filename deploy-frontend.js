#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
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

async function deployFrontend() {
  console.log(`\n${colors.cyan}=== Instagram Clone Frontend Deployment ===${colors.reset}\n`);

  const env = loadEnv();

  if (!env.VERCEL_TOKEN) {
    log.error('VERCEL_TOKEN not found in .env');
    process.exit(1);
  }

  const backendUrl = 'https://instagram-backend-ddar.onrender.com';

  try {
    log.step('Step 1: Installing dependencies');
    await execAsync('cd frontend && npm install');
    log.success('Dependencies installed');

    log.step('Step 2: Building frontend');
    await execAsync('cd frontend && npm run build');
    log.success('Build completed');

    log.step('Step 3: Deploying to Vercel');
    log.info('This may take 2-3 minutes...');

    const deployCmd = `cd frontend && npx vercel --token ${env.VERCEL_TOKEN} --prod --yes --env VITE_API_URL=${backendUrl}/api/v1 --env VITE_SOCKET_URL=${backendUrl}`;

    const { stdout } = await execAsync(deployCmd);

    // Try to extract the URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+vercel\.app/);
    const frontendUrl = urlMatch ? urlMatch[0] : 'https://vercel.com/dashboard';

    log.success('Frontend deployed!');
    log.success(`Frontend URL: ${frontendUrl}`);

    log.step('🎉 Deployment Complete!');
    log.info(`Backend: ${backendUrl}`);
    log.info(`Frontend: ${frontendUrl}`);
    log.info('\nNext steps:');
    log.info('1. Visit your frontend URL');
    log.info('2. Test signup and login');
    log.info('3. Enjoy your Instagram clone!');
  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    log.info('Make sure you have:');
    log.info('- Valid VERCEL_TOKEN in .env');
    log.info('- Frontend dependencies installed');
    process.exit(1);
  }
}

deployFrontend();
