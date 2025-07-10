#!/usr/bin/env node

/**
 * Health Check Script
 * Tests all server endpoints to ensure they're running correctly
 */

const http = require('http');

const servers = [
    { name: 'Landing Page', port: 3000, path: '/health' },
    { name: 'Basic Auth', port: 3001, path: '/health' },
    { name: 'Form Auth', port: 3002, path: '/health' },
    { name: 'Cookie Blocking UI', port: 3003, path: '/health' },
    { name: 'Multi-Page Auth', port: 3004, path: '/health' }
];

async function checkHealth(server) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: server.port,
            path: server.path,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        ...server,
                        status: res.statusCode === 200 ? '✅ OK' : '❌ ERROR',
                        statusCode: res.statusCode,
                        response: response
                    });
                } catch (e) {
                    resolve({
                        ...server,
                        status: '❌ INVALID RESPONSE',
                        statusCode: res.statusCode,
                        response: data
                    });
                }
            });
        });

        req.on('error', (err) => {
            resolve({
                ...server,
                status: '❌ OFFLINE',
                error: err.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                ...server,
                status: '❌ TIMEOUT',
                error: 'Request timeout'
            });
        });

        req.end();
    });
}

async function runHealthChecks() {
    console.log('🏥 Web Demos Health Check\n');
    console.log('Checking all server endpoints...\n');

    const results = await Promise.all(servers.map(checkHealth));

    console.log('📊 Health Check Results:');
    console.log('='.repeat(50));

    results.forEach(result => {
        console.log(`${result.status} ${result.name.padEnd(20)} (Port ${result.port})`);
        if (result.response && typeof result.response === 'object') {
            console.log(`   Service: ${result.response.service || 'unknown'}`);
            console.log(`   Environment: ${result.response.environment || 'unknown'}`);
        }
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
        console.log('');
    });

    const allHealthy = results.every(r => r.status === '✅ OK');
    
    console.log('='.repeat(50));
    if (allHealthy) {
        console.log('🎉 All services are healthy!');
        process.exit(0);
    } else {
        console.log('⚠️  Some services are not responding correctly.');
        console.log('   Make sure all servers are running with: npm start');
        process.exit(1);
    }
}

runHealthChecks().catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
});
