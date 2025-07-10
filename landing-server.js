const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: 'web-demos-production-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));

// Serve static files
app.use(express.static('.'));
app.use('/basic-auth', express.static('basic-auth/public'));
app.use('/form-auth', express.static('form-auth/public'));
app.use('/blocking-ui', express.static('blocking-ui/public'));
app.use('/multi-page-auth', express.static('multi-page-auth/public'));

// Demo users for embedded demos
const users = {
    'admin': 'password123',
    'user@example.com': 'mypassword',
    'john': 'secret456',
    'jane.doe@email.com': 'jane123'
};

const multiPageUsers = {
    'user@example.com': 'password123',
    'john': 'mypassword#',
    'admin': 'admin123'
};

// Basic Auth credentials
const BASIC_USERNAME = 'admin';
const BASIC_PASSWORD = 'secret123';

// Main landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Web Demos Landing Page with Embedded Demos',
        environment: process.env.NODE_ENV || 'development',
        port: PORT 
    });
});

// =============================================================================
// BASIC AUTH DEMO - Embedded Implementation
// =============================================================================

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
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .container { max-width: 500px; margin: 0 auto; background: #f5f5f5; padding: 30px; border-radius: 10px; }
                    .back-link { margin-top: 20px; }
                    a { color: #007bff; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🔐 Authentication Required</h2>
                    <p>Please enter your credentials:</p>
                    <p><strong>Username:</strong> admin<br><strong>Password:</strong> secret123</p>
                    <div class="back-link">
                        <a href="/">← Back to Landing Page</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
    
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    if (username === BASIC_USERNAME && password === BASIC_PASSWORD) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Invalid Credentials</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>❌ Invalid Credentials</h2>
                <p>Please try again with: admin / secret123</p>
                <a href="/">← Back to Landing Page</a>
            </body>
            </html>
        `);
    }
};

app.get('/basic-auth', (req, res) => {
    res.redirect('/basic-auth/');
});

app.get('/basic-auth/', basicAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'basic-auth/public/secure.html'));
});

app.post('/basic-auth/logout', (req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Logged Out</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>� Logged Out Successfully</h2>
            <p>You have been logged out. Refresh the page to login again.</p>
            <a href="/basic-auth">← Try Again</a> | <a href="/">← Back to Landing Page</a>
        </body>
        </html>
    `);
});

app.get('/basic-auth/health', (req, res) => {
    res.json({ status: 'ok', service: 'basic-auth-embedded', port: PORT });
});

// =============================================================================
// FORM AUTH DEMO - Embedded Implementation  
// =============================================================================

const requireFormAuth = (req, res, next) => {
    if (req.session && req.session.formAuthenticated) {
        return next();
    } else {
        return res.redirect('/form-auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
};

app.get('/form-auth', (req, res) => {
    if (req.session && req.session.formAuthenticated) {
        return res.redirect('/form-auth/secure');
    }
    res.redirect('/form-auth/login');
});

app.get('/form-auth/login', (req, res) => {
    if (req.session && req.session.formAuthenticated) {
        const redirect = req.query.redirect || '/form-auth/secure';
        return res.redirect(redirect);
    }
    res.sendFile(path.join(__dirname, 'form-auth/public/login.html'));
});

app.post('/form-auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.redirect('/form-auth/login?error=Please enter both username and password');
    }
    
    if (users[username] && users[username] === password) {
        req.session.formAuthenticated = true;
        req.session.formUsername = username;
        
        const redirect = req.query.redirect || '/form-auth/secure';
        res.redirect(redirect);
    } else {
        res.redirect('/form-auth/login?error=Invalid username or password');
    }
});

app.get('/form-auth/secure', requireFormAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'form-auth/public/secure.html'));
});

app.post('/form-auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/form-auth');
    });
});

app.get('/form-auth/api/user', requireFormAuth, (req, res) => {
    res.json({ 
        username: req.session.formUsername,
        authenticated: true 
    });
});

app.get('/form-auth/health', (req, res) => {
    res.json({ status: 'ok', service: 'form-auth-embedded', port: PORT });
});

// =============================================================================
// BLOCKING UI DEMO - Embedded Implementation
// =============================================================================

app.get('/blocking-ui', (req, res) => {
    res.sendFile(path.join(__dirname, 'blocking-ui/public/content.html'));
});

app.post('/blocking-ui/set-cookie', (req, res) => {
    res.cookie('existingUser', 'true', { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: false 
    });
    res.json({ success: true, message: 'Cookie set successfully!' });
});

app.post('/blocking-ui/clear-cookie', (req, res) => {
    res.clearCookie('existingUser');
    res.json({ success: true, message: 'Cookie cleared successfully!' });
});

app.get('/blocking-ui/api/cookie-status', (req, res) => {
    const existingUser = req.cookies && req.cookies.existingUser;
    res.json({ 
        hasExistingUserCookie: !!existingUser,
        cookieValue: existingUser || null
    });
});

app.get('/blocking-ui/health', (req, res) => {
    res.json({ status: 'ok', service: 'blocking-ui-embedded', port: PORT });
});

// =============================================================================
// MULTI-PAGE AUTH DEMO - Embedded Implementation
// =============================================================================

app.get('/multi-page-auth', (req, res) => {
    if (req.session && req.session.multiPageAuthenticated) {
        return res.redirect('/multi-page-auth/dashboard');
    }
    res.sendFile(path.join(__dirname, 'multi-page-auth/public/step1.html'));
});

app.post('/multi-page-auth/step1', (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.redirect('/multi-page-auth?error=Please enter a valid email address');
    }
    
    req.session.multiPageStep = 1;
    req.session.multiPageEmail = email;
    res.redirect('/multi-page-auth/step2');
});

app.get('/multi-page-auth/step2', (req, res) => {
    if (!req.session.multiPageStep || req.session.multiPageStep < 1) {
        return res.redirect('/multi-page-auth');
    }
    res.sendFile(path.join(__dirname, 'multi-page-auth/public/step2.html'));
});

app.post('/multi-page-auth/step2', (req, res) => {
    const { password, confirmPassword } = req.body;
    
    if (!password || !confirmPassword) {
        return res.redirect('/multi-page-auth/step2?error=Please fill in all fields');
    }
    
    if (password !== confirmPassword) {
        return res.redirect('/multi-page-auth/step2?error=Passwords do not match');
    }
    
    if (password.length < 6) {
        return res.redirect('/multi-page-auth/step2?error=Password must be at least 6 characters');
    }
    
    // Check if user exists
    const email = req.session.multiPageEmail;
    if (multiPageUsers[email] && multiPageUsers[email] === password) {
        req.session.multiPageStep = 2;
        req.session.multiPagePassword = password;
        res.redirect('/multi-page-auth/step3');
    } else {
        res.redirect('/multi-page-auth/step2?error=Invalid email or password');
    }
});

app.get('/multi-page-auth/step3', (req, res) => {
    if (!req.session.multiPageStep || req.session.multiPageStep < 2) {
        return res.redirect('/multi-page-auth');
    }
    res.sendFile(path.join(__dirname, 'multi-page-auth/public/step3.html'));
});

app.post('/multi-page-auth/complete', (req, res) => {
    const { terms } = req.body;
    
    if (!terms) {
        return res.redirect('/multi-page-auth/step3?error=Please accept the terms and conditions');
    }
    
    req.session.multiPageAuthenticated = true;
    req.session.multiPageUsername = req.session.multiPageEmail;
    res.redirect('/multi-page-auth/dashboard');
});

app.get('/multi-page-auth/dashboard', (req, res) => {
    if (!req.session.multiPageAuthenticated) {
        return res.redirect('/multi-page-auth');
    }
    res.sendFile(path.join(__dirname, 'multi-page-auth/public/dashboard.html'));
});

app.post('/multi-page-auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/multi-page-auth');
    });
});

app.get('/multi-page-auth/api/user', (req, res) => {
    if (!req.session.multiPageAuthenticated) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ username: req.session.multiPageUsername });
});

app.get('/multi-page-auth/health', (req, res) => {
    res.json({ status: 'ok', service: 'multi-page-auth-embedded', port: PORT });
});

app.listen(PORT, () => {
    console.log(`Web Demos Landing Page running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
