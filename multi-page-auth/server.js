const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Simple user store (in production, use a database)
const users = {
    'user@example.com': 'password123',
    'john': 'mypassword#',
    'admin': 'admin123'
};

// Routes

// Step 1: Username/Email page
app.get('/', (req, res) => {
    // If already authenticated, go to dashboard
    if (req.session && req.session.authenticated) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'step1.html'));
});

// Handle username submission
app.post('/step1', (req, res) => {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
        return res.redirect('/?error=Please enter a username');
    }
    
    // Store username in session
    req.session.username = username.trim();
    res.redirect('/step2');
});

// Step 2: Password page
app.get('/step2', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'step2.html'));
});

// Handle password submission
app.post('/step2', (req, res) => {
    const { password } = req.body;
    const username = req.session.username;
    
    if (!username) {
        return res.redirect('/');
    }
    
    if (!password || password.trim() === '') {
        return res.redirect('/step2?error=Please enter a password');
    }
    
    // Check credentials
    if (users[username] && users[username] === password) {
        req.session.authenticated = true;
        res.redirect('/dashboard');
    } else {
        res.redirect('/step2?error=Invalid credentials');
    }
});

// Step 3: Secured dashboard
app.get('/dashboard', (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'multi-page-auth',
        environment: process.env.NODE_ENV || 'development',
        port: PORT 
    });
});

// API endpoint to get username for dashboard
app.get('/api/user', (req, res) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ username: req.session.username });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Sample users:');
    console.log('- user@example.com / password123');
    console.log('- john / mypassword#');
    console.log('- admin / admin123');
});