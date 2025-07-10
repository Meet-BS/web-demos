const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Main landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Web Demos Landing Page',
        environment: process.env.NODE_ENV || 'development',
        port: PORT 
    });
});

// Simple demo info pages for production
app.get('/basic-auth', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Basic Auth Demo Info</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2>🔐 Basic Auth Demo</h2>
            <p>This demo would show HTTP Basic Authentication with browser popup.</p>
            <p><strong>Credentials:</strong> admin / secret123</p>
            <p><em>In production mode, individual demo servers are not available.</em></p>
            <p>For the full experience, run locally with: <code>npm start</code></p>
            <p><a href="/" style="color: #007bff;">← Back to Landing Page</a></p>
        </body>
        </html>
    `);
});

app.get('/form-auth', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Form Auth Demo Info</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2>📝 Form Auth Demo</h2>
            <p>This demo would show custom login forms with session management.</p>
            <p><strong>Demo Accounts:</strong> admin/password123, john/secret456</p>
            <p><em>In production mode, individual demo servers are not available.</em></p>
            <p>For the full experience, run locally with: <code>npm start</code></p>
            <p><a href="/" style="color: #007bff;">← Back to Landing Page</a></p>
        </body>
        </html>
    `);
});

app.get('/blocking-ui', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Blocking UI Demo Info</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2>🚫 Blocking UI Demo</h2>
            <p>This demo would show a cookie-based blocking overlay for first-time users.</p>
            <p><em>In production mode, individual demo servers are not available.</em></p>
            <p>For the full experience, run locally with: <code>npm start</code></p>
            <p><a href="/" style="color: #007bff;">← Back to Landing Page</a></p>
        </body>
        </html>
    `);
});

app.get('/multi-page-auth', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Multi-Page Auth Demo Info</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2>🔄 Multi-Page Auth Demo</h2>
            <p>This demo would show a 3-step authentication flow.</p>
            <p><strong>Demo Accounts:</strong> user@example.com/password123, admin/admin123</p>
            <p><em>In production mode, individual demo servers are not available.</em></p>
            <p>For the full experience, run locally with: <code>npm start</code></p>
            <p><a href="/" style="color: #007bff;">← Back to Landing Page</a></p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Web Demos Landing Page running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
