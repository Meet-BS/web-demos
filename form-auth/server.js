const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'form-auth-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));

// Demo users
const users = {
    'admin': 'password123',
    'user@example.com': 'mypassword',
    'john': 'secret456',
    'jane.doe@email.com': 'jane123'
};

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    } else {
        return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
};

// Routes
app.get('/', (req, res) => {
    // If already authenticated, go to secure page
    if (req.session && req.session.authenticated) {
        return res.redirect('/secure');
    }
    // Otherwise, redirect to login
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session && req.session.authenticated) {
        const redirect = req.query.redirect || '/secure';
        return res.redirect(redirect);
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.redirect('/login?error=Please enter both username and password');
    }
    
    if (users[username] && users[username] === password) {
        req.session.authenticated = true;
        req.session.username = username;
        
        const redirect = req.query.redirect || '/secure';
        res.redirect(redirect);
    } else {
        res.redirect('/login?error=Invalid username or password');
    }
});

app.get('/secure', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'secure.html'));
});

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
        service: 'form-auth',
        environment: process.env.NODE_ENV || 'development',
        port: PORT 
    });
});

// API endpoint to get user info
app.get('/api/user', requireAuth, (req, res) => {
    res.json({ 
        username: req.session.username,
        authenticated: true 
    });
});

app.listen(PORT, () => {
    console.log(`Form Auth server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Demo users:');
    Object.keys(users).forEach(username => {
        console.log(`- ${username} / ${users[username]}`);
    });
});
