const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static('public'));

// Basic Auth credentials
const USERNAME = 'admin';
const PASSWORD = 'secret123';

// Basic Auth middleware
const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Required</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 400px;
                    }
                    .lock-icon {
                        font-size: 4rem;
                        color: #667eea;
                        margin-bottom: 1rem;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 1rem;
                    }
                    p {
                        color: #666;
                        margin-bottom: 1.5rem;
                    }
                    .credentials {
                        background: #f8f9fa;
                        padding: 1rem;
                        border-radius: 5px;
                        margin: 1rem 0;
                        border-left: 4px solid #667eea;
                    }
                    .btn {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 5px;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="lock-icon">🔐</div>
                    <h1>Authentication Required</h1>
                    <p>This area requires basic authentication. Your browser should show a login dialog.</p>
                    <div class="credentials">
                        <strong>Demo Credentials:</strong><br>
                        Username: admin<br>
                        Password: secret123
                    </div>
                    <button class="btn" onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `);
    }
    
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    if (username === USERNAME && password === PASSWORD) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Failed</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    }
                    .container {
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 400px;
                    }
                    .error-icon {
                        font-size: 4rem;
                        color: #dc3545;
                        margin-bottom: 1rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error-icon">❌</div>
                    <h1>Authentication Failed</h1>
                    <p>Invalid credentials. Please try again.</p>
                    <button class="btn" onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `);
    }
};

// Routes
app.get('/', basicAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'secure.html'));
});

app.get('/secure', basicAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'secure.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'basic-auth',
        environment: process.env.NODE_ENV || 'development',
        port: PORT 
    });
});

// Logout endpoint - sends 401 to clear browser credentials
app.post('/logout', (req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).send('Logged out. Please refresh to login again.');
});

app.get('/clear-auth', (req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Authentication Cleared</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                }
                .container {
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                }
                .btn {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 5px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    margin: 0.5rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔄 Authentication Cleared</h1>
                <p>Your credentials have been cleared. Click below to authenticate again.</p>
                <a href="/secure" class="btn">Login Again</a>
                <a href="/" class="btn">Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`Basic Auth server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Demo credentials: admin / secret123');
});
