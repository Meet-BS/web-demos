const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

// Main landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Web Demos Landing Page' });
});

app.listen(PORT, () => {
    console.log(`Web Demos Landing Page running at http://localhost:${PORT}`);
});

module.exports = app;
