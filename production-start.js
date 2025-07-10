#!/usr/bin/env node

/**
 * Production Deployment Script for Render
 * This script demonstrates how the app behaves in production mode
 */

const { spawn } = require('child_process');

console.log('🚀 Starting in Production Mode...\n');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '10000'; // Render's default port

console.log('Environment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- PORT: ${process.env.PORT}`);
console.log('');

// Start the application
const child = spawn('node', ['start-all.js'], {
    stdio: 'inherit',
    env: process.env
});

child.on('close', (code) => {
    console.log(`\nProduction server exited with code ${code}`);
    process.exit(code);
});

child.on('error', (err) => {
    console.error(`Production server error: ${err.message}`);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Gracefully shutting down production server...');
    child.kill('SIGTERM');
});

process.on('SIGTERM', () => {
    child.kill('SIGTERM');
});
