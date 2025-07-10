# Multi-Page Authentication System

A simple, elegant multi-page authentication system built with Express.js and session management.

## Features

- **Step 1**: Username/Email input with validation
- **Step 2**: Password input with show/hide toggle
- **Step 3**: Secured dashboard area
- Session-based authentication
- Responsive design
- Error handling and user feedback
- Auto-logout warning
- Beautiful gradient UI

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **For development (with auto-restart):**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Demo Accounts

Use these pre-configured accounts to test the system:

- **Email**: `user@example.com` | **Password**: `password123`
- **Username**: `john` | **Password**: `mypassword`
- **Username**: `admin` | **Password**: `admin123`

## How It Works

### Authentication Flow

1. **Step 1**: User enters username or email (no validation required)
2. **Step 2**: User enters password (validated against stored users)
3. **Step 3**: User is redirected to secure dashboard area

### Session Management

- Uses Express sessions with secure configuration
- Session expires after 24 hours
- Users are redirected to login if session is invalid
- Automatic session cleanup on logout

### Security Features

- Session-based authentication (no JWT tokens for simplicity)
- Password validation against user store
- Protected routes with middleware
- Secure session configuration
- CSRF protection ready (can be added)

## File Structure

```
multiPageAuth/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── public/               # Static files
    ├── step1.html        # Username input page
    ├── step2.html        # Password input page
    └── dashboard.html    # Secured dashboard
```

## API Endpoints

- `GET /` - Step 1: Username input page
- `POST /step1` - Process username submission
- `GET /step2` - Step 2: Password input page
- `POST /step2` - Process login attempt
- `GET /dashboard` - Secured dashboard (requires authentication)
- `POST /logout` - Destroy session and logout
- `GET /api/user` - Get current user info (API endpoint)

## Customization

### Adding New Users

Edit the `users` object in `server.js`:

```javascript
const users = {
    'your-username': 'your-password',
    'email@domain.com': 'secure-password'
};
```

### Database Integration

Replace the in-memory `users` object with your preferred database:

```javascript
// Example with MongoDB/Mongoose
const user = await User.findOne({ username: username });
if (user && await bcrypt.compare(password, user.passwordHash)) {
    // Authentication successful
}
```

### Styling

Modify the CSS in each HTML file to match your brand:

- Colors: Update the gradient backgrounds and accent colors
- Fonts: Change the font-family in the CSS
- Layout: Modify the container widths and spacing

## Production Considerations

1. **Environment Variables**: Move sensitive data to environment variables
2. **HTTPS**: Enable HTTPS and set `cookie.secure = true`
3. **Database**: Replace in-memory user store with a real database
4. **Password Hashing**: Use bcrypt for password hashing
5. **Rate Limiting**: Add rate limiting to prevent brute force attacks
6. **CSRF Protection**: Add CSRF tokens for form submissions
7. **Session Store**: Use Redis or database for session storage

## Technologies Used

- **Backend**: Node.js, Express.js
- **Session Management**: express-session
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, Gradients

## License

MIT License - feel free to use this in your projects!
