const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
// Trust reverse proxy headers (needed for correct host/proto behind load balancers/CDNs)
app.set('trust proxy', true);
// Allow overriding the port via environment variable; default 3001
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session configuration
const sessionConfig = {
    secret: 'web-demos-production-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
};

// Use SQLite session store in production to avoid MemoryStore warning
if (isProduction) {
    const SQLiteStore = require('connect-sqlite3')(session);
    sessionConfig.store = new SQLiteStore({
        db: 'sessions.db',
        concurrentDB: true
    });
}

app.use(session(sessionConfig));

// Serve static files
app.use(express.static('.'));
app.use(express.static('public'));

// ============================================================================
// Dynamic Sitemap & Robots Generation
// Set SITEMAP_BASE_URL env var (e.g. https://demo.example) to override host
// NOTE: User requested <sitemapindex>/<sitemap> for individual pages (non-standard)
// ============================================================================
function getBaseUrl(req) {
    const candidates = [
        process.env.SITEMAP_BASE_URL,
        process.env.VERCEL_URL,
        process.env.RENDER_EXTERNAL_URL,
        process.env.DEPLOY_URL
    ].filter(Boolean);

    let fromEnv = candidates.find(Boolean);
    if (fromEnv) {
        fromEnv = fromEnv.replace('{PORT}', PORT).replace(/\/$/, '');
        if (!/^https?:\/\//i.test(fromEnv)) {
            // Assume https for platform-provided hostnames
            fromEnv = 'https://' + fromEnv;
        }
        return fromEnv;
    }

    const protoHeader = req.headers['x-forwarded-proto'];
    const proto = (protoHeader ? protoHeader.split(',')[0].trim() : (req.protocol || 'http'));
    let host = (req.headers['x-forwarded-host'] || req.get('host') || '').split(',')[0].trim();

    // Append port only if not default and not already present
    if (host && !host.includes(':')) {
        const portNum = Number(PORT);
        const needPort = (proto === 'http' && portNum !== 80) || (proto === 'https' && portNum !== 443);
        if (needPort) host = `${host}:${portNum}`;
    }

    // Fallback warning if still localhost in a supposed prod env
    if (isProduction && /localhost/i.test(host)) {
        console.warn('[sitemap] WARNING: resolved host is localhost in production. Set SITEMAP_BASE_URL to fix.');
    }
    return `${proto}://${host}`;
}

// Lightweight debug endpoint (can be removed later)
app.get('/debug/sitemap-base', (req, res) => {
    res.json({ baseUrl: getBaseUrl(req), host: req.get('host'), xfHost: req.headers['x-forwarded-host'], xfProto: req.headers['x-forwarded-proto'] });
});

// Define logical sitemap groupings (each array holds page paths)
const sitemapGroups = {
    'sitemap-pages': [
        '/',
        '/blocking-ui',
        '/slow',
        '/iframe-demo.html'
    ],
    'sitemap-auth-core': [
        '/basic-auth/',
        '/form-auth',
        '/simple-password-auth',
        '/multi-page-auth'
    ],
    'sitemap-auth-flows': [
        '/form-auth/login',
        '/simple-password-auth/login',
        '/multi-page-auth/dashboard',
        '/multi-page-auth/step2'
    ]
};

const sitemapGroupNames = Object.keys(sitemapGroups);

function buildPageSitemapXML(baseUrl, paths) {
    // Non-standard per user instruction: use <sitemapindex>/<sitemap> for pages
    const items = paths.map(p => `  <sitemap><loc>${baseUrl}${p}</loc></sitemap>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

function buildMasterIndexXML(baseUrl) {
    const items = sitemapGroupNames.map(name => `  <sitemap>\n    <loc>${baseUrl}/sitemaps/${name}.xml</loc>\n  </sitemap>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

// Master sitemap index
app.get('/sitemap-index.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    console.log('[sitemap] master index request host=%s baseUrl=%s', req.get('host'), baseUrl);
    res.type('application/xml').send(buildMasterIndexXML(baseUrl));
});

// Individual group sitemaps
app.get('/sitemaps/:name.xml', (req, res) => {
    const { name } = req.params;
    if (!sitemapGroups[name]) return res.status(404).send('Not Found');
    const baseUrl = getBaseUrl(req);
    console.log('[sitemap] group=%s host=%s baseUrl=%s', name, req.get('host'), baseUrl);
    res.type('application/xml').send(buildPageSitemapXML(baseUrl, sitemapGroups[name]));
});

// Dynamic robots referencing master index
app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('text/plain').send(`User-agent: *\nDisallow:\n\nSitemap: ${baseUrl}/sitemap-index.xml\n`);
});

// Demo users for embedded demos
const users = {
    'admin': 'admin',
    'test@meet.com': 'Meet@123',
    'meetUser#': 'meetPass',
    'Meet': '(^ O^)',
    'user@example.com': 'mypassword',
    'john': 'secret456',
    'jane.doe@email.com': 'jane123'
};

// Multi-page auth demo users
const multiPageUsers = {
    'admin': 'admin',
    'test@meet.com': 'Meet@123',
    'meetUser#': 'meetPass',
    'Meet': '(^ O^)',
    'admin@example.com': 'password123',
    'user@demo.com': 'testpass',
    'john.doe@email.com': 'secret456'
};

// =============================================================================
// BASIC AUTH DEMO - Embedded Implementation
// =============================================================================

app.get('/basic-auth', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Required</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h2 { color: #333; margin-bottom: 20px; }
                    p { color: #666; margin: 10px 0; }
                    .back-link { margin-top: 20px; }
                    .back-link a { color: #007bff; text-decoration: none; }
                    .demo-credentials { background:#e3f2fd;padding:16px 20px;border-radius:8px;margin:20px 0; text-align:left; }
                    .demo-credentials ul { list-style:disc inside; margin:0; padding:0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🔐 Authentication Required</h2>
                    <p>Please enter your credentials:</p>
                    <div class="demo-credentials">
                      <h3>Demo Credentials</h3>
                      <ul>
                        <li><b>admin</b> / admin</li>
                        <li><b>test@meet.com</b> / Meet@123</li>
                        <li><b>meetUser#</b> / meetPass</li>
                        <li><b>Meet</b> / (^ O^)</li>
                      </ul>
                    </div>
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
    if (users[username] && users[username] === password) {
        // Show secure page with logged-in user
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Basic Auth Secure</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                <div class="container" style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2>✅ Authenticated!</h2>
                    <p>Welcome, <b>${username}</b>!</p>
                    <form method="post" action="/basic-auth/logout">
                        <button type="submit" style="margin-top:20px;padding:10px 20px;border-radius:5px;background:#ff6b6b;color:white;border:none;font-weight:bold;cursor:pointer;">Logout</button>
                    </form>
                    <div class="back-link" style="margin-top:20px;">
                        <a href="/">← Back to Landing Page</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Invalid Credentials</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h2 { color: #333; margin-bottom: 20px; }
                p { color: #666; margin: 10px 0; }
                .back-link { margin-top: 20px; }
                .back-link a { color: #007bff; text-decoration: none; }
                .demo-credentials { background:#e3f2fd;padding:16px 20px;border-radius:8px;margin:20px 0; text-align:left; }
                .demo-credentials ul { list-style:disc inside; margin:0; padding:0; }
            </style>
            </head>
            <body>
                <div class="container">
                    <h2>❌ Invalid Credentials</h2>
                    <p>Please try again with one of the following:</p>
                    <div class="demo-credentials">
                      <h3>Demo Credentials</h3>
                      <ul>
                        <li><b>admin</b> / admin</li>
                        <li><b>test@meet.com</b> / Meet@123</li>
                        <li><b>meetUser#</b> / meetPass</li>
                        <li><b>Meet</b> / (^ O^)</li>
                      </ul>
                    </div>
                    <div class="back-link">
                        <a href="/">← Back to Landing Page</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
});

app.post('/basic-auth/logout', (req, res) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Logged Out</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>👋 Logged Out Successfully</h2>
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
    res.sendFile(path.join(__dirname, 'public/form-auth-login.html'));
});

app.post('/form-auth/login', (req, res) => {
    const { username, password } = req.body;
    // Only check if the pair matches, no validation on content
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
    res.sendFile(path.join(__dirname, 'public/form-auth-secure.html'));
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
    res.sendFile(path.join(__dirname, 'public/blocking-ui-content.html'));
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
    res.sendFile(path.join(__dirname, 'public/multi-page-step1.html'));
});

app.post('/multi-page-auth/step1', (req, res) => {
    const { email } = req.body;
    // No validation on email content
    req.session.multiPageStep = 1;
    req.session.multiPageEmail = email;
    res.redirect('/multi-page-auth/step2');
});

app.get('/multi-page-auth/step2', (req, res) => {
    if (!req.session.multiPageStep || req.session.multiPageStep < 1) {
        return res.redirect('/multi-page-auth');
    }
    res.sendFile(path.join(__dirname, 'public/multi-page-step2.html'));
});

app.post('/multi-page-auth/step2', (req, res) => {
    const { password } = req.body;
    // No validation on password content
    const email = req.session.multiPageEmail;
    if (multiPageUsers[email] && multiPageUsers[email] === password) {
        req.session.multiPageStep = 2;
        req.session.multiPagePassword = password;
        req.session.multiPageAuthenticated = true;
        req.session.multiPageUsername = email;
        return res.redirect('/multi-page-auth/dashboard');
    } else {
        return res.redirect('/multi-page-auth/step2?error=Invalid email or password');
    }
});

app.get('/multi-page-auth/dashboard', (req, res) => {
    if (!req.session.multiPageAuthenticated) {
        return res.redirect('/multi-page-auth');
    }
    res.sendFile(path.join(__dirname, 'public/multi-page-dashboard.html'));
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

// =============================================================================
// SIMPLE PASSWORD AUTH DEMO - Password Only (No Username)
// =============================================================================

const simplePasswords = [
    'admin',
    'Meet@123',
    'meetPass',
    '(^ O^)' // include the special password
];

const requireSimplePasswordAuth = (req, res, next) => {
    if (req.session && req.session.simplePasswordAuthenticated) {
        return next();
    } else {
        return res.redirect('/simple-password-auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
};

app.get('/simple-password-auth', (req, res) => {
    if (req.session && req.session.simplePasswordAuthenticated) {
        return res.redirect('/simple-password-auth/secure');
    }
    res.redirect('/simple-password-auth/login');
});

app.get('/simple-password-auth/login', (req, res) => {
    if (req.session && req.session.simplePasswordAuthenticated) {
        const redirect = req.query.redirect || '/simple-password-auth/secure';
        return res.redirect(redirect);
    }
    res.sendFile(path.join(__dirname, 'public/simple-password-login.html'));
});

app.post('/simple-password-auth/login', (req, res) => {
    const { password } = req.body;
    if (simplePasswords.includes(password)) {
        req.session.simplePasswordAuthenticated = true;
        req.session.simplePassword = password;
        const redirect = req.query.redirect || '/simple-password-auth/secure';
        res.redirect(redirect);
    } else {
        res.redirect('/simple-password-auth/login?error=Invalid password');
    }
});

app.get('/simple-password-auth/secure', requireSimplePasswordAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/simple-password-secure.html'));
});

app.post('/simple-password-auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/simple-password-auth');
    });
});

app.get('/simple-password-auth/api/password', requireSimplePasswordAuth, (req, res) => {
    res.json({ password: req.session.simplePassword });
});

app.get('/simple-password-auth/health', (req, res) => {
    res.json({ status: 'ok', service: 'simple-password-auth', port: PORT });
});

// Route to simulate a slow-loading page
app.get('/slow', (req, res) => {
    const delay = parseInt(req.query.delay) || 30000; // Default delay is 30 seconds
    setTimeout(() => {
        res.send(`<h1>Slow Page Loaded with delay ${delay} milliseconds</h1>`);
    }, delay);
});

app.listen(PORT, () => {
    console.log(`Web Demos unified server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Available demos:');
    console.log('  - Basic Auth: /basic-auth');
    console.log('  - Form Auth: /form-auth');
    console.log('  - Cookie Blocking UI: /blocking-ui');
    console.log('  - Multi-Page Auth: /multi-page-auth');
});

module.exports = app;
