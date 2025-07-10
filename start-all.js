#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting all web demo servers...\n');

// Server configurations
const servers = [
    {
        name: 'Landing Page',
        port: 3000,
        dir: '.',
        script: 'landing-server.js',
        color: '\x1b[33m' // Yellow
    },
    {
        name: 'Basic Auth',
        port: 3001,
        dir: 'basic-auth',
        script: 'server.js',
        color: '\x1b[32m' // Green
    },
    {
        name: 'Form Auth',
        port: 3002,
        dir: 'form-auth',
        script: 'server.js',
        color: '\x1b[34m' // Blue
    },
    {
        name: 'Cookie Blocking UI',
        port: 3003,
        dir: 'blocking-ui',
        script: 'server.js',
        color: '\x1b[35m' // Magenta
    },
    {
        name: 'Multi-Page Auth',
        port: 3004,
        dir: 'multi-page-auth',
        script: 'server.js',
        color: '\x1b[36m' // Cyan
    }
];

const processes = [];

// Start each server
servers.forEach((server, index) => {
    const serverPath = path.join(__dirname, server.dir);
    
    console.log(`${server.color}[${server.name}]\x1b[0m Starting on port ${server.port}...`);
    
    const child = spawn('node', [server.script || 'server.js'], {
        cwd: serverPath,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    processes.push(child);
    
    child.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`${server.color}[${server.name}]\x1b[0m ${output}`);
        }
    });
    
    child.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`${server.color}[${server.name} ERROR]\x1b[0m ${output}`);
        }
    });
    
    child.on('close', (code) => {
        console.log(`${server.color}[${server.name}]\x1b[0m Process exited with code ${code}`);
    });
    
    child.on('error', (err) => {
        console.error(`${server.color}[${server.name} ERROR]\x1b[0m Failed to start: ${err.message}`);
    });
});

// Display dashboard after a short delay
setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All servers started successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 WEB DEMOS DASHBOARD:');
    console.log('');
    
    servers.forEach((server) => {
        console.log(`${server.color}🔗 ${server.name.padEnd(20)}\x1b[0m http://localhost:${server.port}`);
    });
    
    console.log('');
    console.log('🌟 START HERE: http://localhost:3000 (Landing Page)');
    console.log('');
    console.log('📖 Quick Guide:');
    console.log('   • Landing Page: Overview of all demos');
    console.log('   • Basic Auth: Browser popup login (admin/secret123)');
    console.log('   • Form Auth: Username/password form (admin/password123)');
    console.log('   • Cookie Blocking: Cookie-based access control');
    console.log('   • Multi-Page Auth: 3-step authentication flow');
    console.log('');
    console.log('💡 Press Ctrl+C to stop all servers');
    console.log('='.repeat(60));
}, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all servers...');
    
    processes.forEach((child, index) => {
        console.log(`Stopping ${servers[index].name}...`);
        child.kill('SIGTERM');
    });
    
    setTimeout(() => {
        console.log('✅ All servers stopped. Goodbye!');
        process.exit(0);
    }, 1000);
});

process.on('SIGTERM', () => {
    processes.forEach(child => child.kill('SIGTERM'));
    process.exit(0);
});
