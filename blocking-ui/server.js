const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3003;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.redirect('/content');
});

app.get('/content', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'content.html'));
});

app.post('/set-cookie', (req, res) => {
    // Set the existingUser cookie for 7 days
    res.cookie('existingUser', 'true', {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: false, // Allow JavaScript access
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax'
    });
    
    res.json({ success: true, message: 'Cookie set successfully' });
});

app.post('/clear-cookie', (req, res) => {
    res.clearCookie('existingUser');
    res.json({ success: true, message: 'Cookie cleared successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'blocking-ui' });
});

// API to check cookie status
app.get('/api/cookie-status', (req, res) => {
    const existingUser = req.cookies && req.cookies.existingUser;
    res.json({ 
        hasExistingUserCookie: !!existingUser,
        cookieValue: existingUser || null
    });
});

app.listen(PORT, () => {
    console.log(`Blocking UI server running at http://localhost:${PORT}`);
    console.log('This demo shows a blocking UI that appears when a cookie is not set');
});
