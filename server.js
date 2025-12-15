const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
// Simple configurable port (no dynamic domain rewriting)
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

// Sitemap auth modes
// Supported: both | root-only | children-only | none
// Maps to scenarios:
//  both           => root auth, children auth
//  root-only      => root auth, children open
//  children-only  => root open, children auth
//  none (default) => root open, children open
const SITEMAP_AUTH_MODE = (process.env.SITEMAP_AUTH_MODE || 'none').toLowerCase();
const VALID_SITEMAP_MODES = new Set(['both','root-only','children-only','none']);
if (!VALID_SITEMAP_MODES.has(SITEMAP_AUTH_MODE)) {
    console.warn(`[sitemaps] Invalid SITEMAP_AUTH_MODE='${SITEMAP_AUTH_MODE}' defaulting to 'none'`);
}

function decodeBasicAuth(header) {
    try {
        const b64 = header.split(' ')[1];
        const raw = Buffer.from(b64, 'base64').toString('utf8');
        const sep = raw.indexOf(':');
        if (sep === -1) return [];
        return [raw.slice(0, sep), raw.slice(sep + 1)];
    } catch { return []; }
}

function sitemapNeedsAuth(pathname) {
    const isRoot = pathname === '/sitemap-index.xml';
    const isChild = pathname.startsWith('/sitemaps/');
    switch (SITEMAP_AUTH_MODE) {
        case 'both': return isRoot || isChild;
        case 'root-only': return isRoot;
        case 'children-only': return isChild;
        case 'none':
        default: return false;
    }
}

function sitemapAuthConditional(req, res, next) {
    if (sitemapNeedsAuth(req.path)) {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Sitemaps"');
            return res.status(401).send('Authentication required');
        }
        const [u, p] = decodeBasicAuth(auth);
        if (!u || !p || !users[u] || users[u] !== p) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Sitemaps"');
            return res.status(401).send('Invalid credentials');
        }
    }
    return next();
}

app.use(sitemapAuthConditional);
console.log(`[sitemaps] Auth mode active: ${SITEMAP_AUTH_MODE}`);

// ============================================================================
// Multi-scenario sitemap demo (all four auth patterns at once)
// Base paths:
//  /sitemap-scenarios/both/sitemap-index.xml            (root & children auth)
//  /sitemap-scenarios/root-only/sitemap-index.xml       (root auth, children open)
//  /sitemap-scenarios/children-only/sitemap-index.xml   (root open, children auth)
//  /sitemap-scenarios/none/sitemap-index.xml            (root & children open)
// Child group endpoints:
//  /sitemap-scenarios/<mode>/<group>.xml  where <group> in pages | auth-core | auth-flows
// Auth rules applied per mode individually, independent from global SITEMAP_AUTH_MODE.
// ============================================================================

const SCENARIO_GROUPS = {
    'pages': [ '/', '/blocking-ui', '/slow', '/iframe-demo.html' ],
    'auth-core': [ '/basic-auth/', '/form-auth', '/simple-password-auth', '/multi-page-auth' ],
    'auth-flows': [ '/form-auth/login', '/simple-password-auth/login', '/multi-page-auth/dashboard', '/multi-page-auth/step2' ]
};
const SCENARIO_MODES = ['both','root-only','children-only','none'];

function scenarioNeedsAuth(mode, isRoot, isChild) {
    switch(mode){
        case 'both': return isRoot || isChild;
        case 'root-only': return isRoot;
        case 'children-only': return isChild;
        case 'none': default: return false;
    }
}

function buildScenarioIndex(baseUrl, mode) {
    // List all groups for this mode
    const items = Object.keys(SCENARIO_GROUPS).map(g=>`  <sitemap>\n    <loc>${baseUrl}/sitemap-scenarios/${mode}/${g}.xml</loc>\n  </sitemap>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

function buildScenarioGroup(baseUrl, group) {
    const paths = SCENARIO_GROUPS[group] || [];
    const items = paths.map(p=>`  <sitemap><loc>${baseUrl}${p}</loc></sitemap>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

function getReqBase(req){
    const proto = req.headers['x-forwarded-proto']?.split(',')[0].trim() || req.protocol || 'http';
    return `${proto}://${req.get('host')}`;
}

function enforceScenarioAuth(req, res, mode, isRoot, isChild){
    if(!scenarioNeedsAuth(mode, isRoot, isChild)) return true;
    const auth = req.headers.authorization;
    if(!auth || !auth.startsWith('Basic ')){
        res.setHeader('WWW-Authenticate', 'Basic realm="Sitemaps Scenario"');
        res.status(401).send('Authentication required');
        return false;
    }
    const b64 = auth.split(' ')[1];
    try {
        const raw = Buffer.from(b64,'base64').toString('utf8');
        const idx = raw.indexOf(':');
        if(idx === -1) throw new Error();
        const user = raw.slice(0,idx); const pass = raw.slice(idx+1);
        if(!users[user] || users[user] !== pass) throw new Error();
        return true;
    } catch {
        res.setHeader('WWW-Authenticate', 'Basic realm="Sitemaps Scenario"');
        res.status(401).send('Invalid credentials');
        return false;
    }
}

// Scenario root indexes
app.get('/sitemap-scenarios/:mode/sitemap-index.xml', (req,res)=>{
    const { mode } = req.params;
    if(!SCENARIO_MODES.includes(mode)) return res.status(404).send('Invalid mode');
    if(!enforceScenarioAuth(req,res,mode,true,false)) return;
    const xml = buildScenarioIndex(getReqBase(req), mode);
    res.type('application/xml').send(xml);
});

// Scenario child groups
app.get('/sitemap-scenarios/:mode/:group.xml', (req,res)=>{
    const { mode, group } = req.params;
    if(!SCENARIO_MODES.includes(mode)) return res.status(404).send('Invalid mode');
    if(!SCENARIO_GROUPS[group]) return res.status(404).send('Invalid group');
    if(!enforceScenarioAuth(req,res,mode,false,true)) return;
    const xml = buildScenarioGroup(getReqBase(req), group);
    res.type('application/xml').send(xml);
});

console.log('[sitemaps] Multi-scenario endpoints mounted at /sitemap-scenarios');

// PROTECTED PDF ENDPOINTS (Behind Auth)
// Basic Auth protected PDF
app.get('/pdfs/behind_auth/basic_auth.pdf', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).send('Authentication required');
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    if (users[username] && users[username] === password) {
        return res.sendFile(path.join(__dirname, 'pdfs/behind_auth/basic_auth.pdf'));
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).send('Invalid credentials');
});

// Form Auth protected PDF
app.get('/pdfs/behind_auth/form_auth.pdf', (req, res) => {
    if (req.session && req.session.formAuthenticated) {
        return res.sendFile(path.join(__dirname, 'pdfs/behind_auth/form_auth.pdf'));
    }
    return res.status(401).send('Login required');
});

// Multi-page Auth protected PDF
app.get('/pdfs/behind_auth/multipage_auth.pdf', (req, res) => {
    if (req.session && req.session.multiPageAuthenticated) {
        return res.sendFile(path.join(__dirname, 'pdfs/behind_auth/multipage_auth.pdf'));
    }
    return res.status(401).send('Login required');
});

// Simple Password Auth protected PDF
app.get('/pdfs/behind_auth/simplepass_auth.pdf', (req, res) => {
    if (req.session && req.session.simplePasswordAuthenticated) {
        return res.sendFile(path.join(__dirname, 'pdfs/behind_auth/simplepass_auth.pdf'));
    }
    return res.status(401).send('Login required');
});

// Block all other direct static access to /pdfs/behind_auth/*
app.get('/pdfs/behind_auth/*', (req, res) => {
    return res.status(403).send('Forbidden');
});

// Serve static files (after protected PDF routes)
app.use(express.static('.'));
app.use(express.static('public'));

// (Removed dynamic sitemap generation; using static XML files instead)

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
        // Show secure page with logged-in user and PDF link
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Basic Auth Secure</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                <div class="container" style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2>✅ Authenticated!</h2>
                    <p>Welcome, <b>${username}</b>!</p>
                    <p><a href="/pdfs/behind_auth/basic_auth.pdf" target="_blank" style="color:#1976D2;font-weight:bold;">Download your protected PDF</a></p>
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

// New secure pages behind form auth
app.get('/form-auth/secure-1', requireFormAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/form-auth-secure-1.html'));
});
app.get('/form-auth/secure-2', requireFormAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/form-auth-secure-2.html'));
});
app.get('/form-auth/secure-3', requireFormAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/form-auth-secure-3.html'));
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

// =============================================================================
// Dynamic PDF Generation for /pdfs/docN.pdf
// =============================================================================
const PDF_TEMPLATE = (docNum) => `
%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello from Document ${docNum}!) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000111 00000 n \n0000000192 00000 n \n0000000282 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n362\n%%EOF\n`;

app.get('/pdfs/doc:docNum.pdf', (req, res) => {
    const docNum = parseInt(req.params.docNum, 10);
    if (isNaN(docNum) || docNum < 1 || docNum > 100) {
        return res.status(404).send('PDF not found');
    }
    const pdfContent = PDF_TEMPLATE(docNum);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfContent));
});


app.listen(PORT, () => {
    console.log(`Web Demos unified server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
