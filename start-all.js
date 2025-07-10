#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting all web demo servers...\n');

// Check if we're in a production environment (like Render)
const isProduction = process.env.NODE_ENV === 'production';
const basePort = parseInt(process.env.PORT) || 3000;

// Server configurations
const servers = [
    {
        name: 'Landing Page',
        port: isProduction ? basePort : 3000,
        dir: '.',
        script: 'landing-server.js',
        color: '\x1b[33m', // Yellow
        env: { PORT: isProduction ? basePort : 3000 }
    },
    {
        name: 'Basic Auth',
        port: isProduction ? basePort + 1 : 3001,
        dir: 'basic-auth',
        script: 'server.js',
        color: '\x1b[32m', // Green
        env: { PORT: isProduction ? basePort + 1 : 3001 }
    },
    {
        name: 'Form Auth',
        port: isProduction ? basePort + 2 : 3002,
        dir: 'form-auth',
        script: 'server.js',
        color: '\x1b[34m', // Blue
        env: { PORT: isProduction ? basePort + 2 : 3002 }
    },
    {
        name: 'Cookie Blocking UI',
        port: isProduction ? basePort + 3 : 3003,
        dir: 'blocking-ui',
        script: 'server.js',
        color: '\x1b[35m', // Magenta
        env: { PORT: isProduction ? basePort + 3 : 3003 }
    },
    {
        name: 'Multi-Page Auth',
        port: isProduction ? basePort + 4 : 3004,
        dir: 'multi-page-auth',
        script: 'server.js',
        color: '\x1b[36m', // Cyan
        env: { PORT: isProduction ? basePort + 4 : 3004 }
    }
];

const processes = [];

// In production (Render), only start the landing page server
// Render can only expose one port per service
if (isProduction) {
    console.log('🌐 Production mode detected - starting landing page server only');
    console.log('For full multi-server deployment, use separate Render services');
    
    const landingServer = servers[0];
    const serverPath = path.join(__dirname, landingServer.dir);
    
    console.log(`${landingServer.color}[${landingServer.name}]\x1b[0m Starting on port ${landingServer.port}...`);
    
    const child = spawn('node', [landingServer.script || 'server.js'], {
        cwd: serverPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...landingServer.env }
    });
    
    processes.push(child);
    
    child.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`${landingServer.color}[${landingServer.name}]\x1b[0m ${output}`);
        }
    });
    
    child.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`${landingServer.color}[${landingServer.name} ERROR]\x1b[0m ${output}`);
        }
    });
    
    child.on('close', (code) => {
        console.log(`${landingServer.color}[${landingServer.name}]\x1b[0m Process exited with code ${code}`);
    });
    
    child.on('error', (err) => {
        console.error(`${landingServer.color}[${landingServer.name} ERROR]\x1b[0m Failed to start: ${err.message}`);
    });
} else {
    // Local development - start all servers
    servers.forEach((server, index) => {
        const serverPath = path.join(__dirname, server.dir);
        
        console.log(`${server.color}[${server.name}]\x1b[0m Starting on port ${server.port}...`);
        
        const child = spawn('node', [server.script || 'server.js'], {
            cwd: serverPath,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, ...server.env }
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
}

// Display dashboard after a short delay
setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    if (isProduction) {
        console.log('🎉 Landing page server started successfully!');
        console.log('='.repeat(60));
        console.log('');
        console.log('📋 WEB DEMOS DASHBOARD (Production Mode):');
        console.log('');
        console.log(`🔗 Landing Page: http://localhost:${basePort}`);
        console.log('');
        console.log('📖 Note: In production, only the landing page is served.');
        console.log('   Individual demos are embedded in the landing page.');
        console.log('   For separate demo services, deploy each folder as individual Render services.');
    } else {
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
    }
    console.log('');
    console.log('💡 Press Ctrl+C to stop all servers');
    console.log('='.repeat(60));
}, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all servers...');
    
    processes.forEach((child, index) => {
        const serverName = isProduction ? 'Landing Page' : servers[index]?.name || 'Server';
        console.log(`Stopping ${serverName}...`);
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
