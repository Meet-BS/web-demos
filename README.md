# Web Demos

Four different web authentication and UI systems demonstrating various approaches to web security and user experience.

## Projects

### 1. 🔐 Basic Auth (`/basic-auth`)
- **Port**: 3001
- **Demo**: HTTP Basic Authentication
- **Features**: Browser-native auth dialog, simple credentials
- **Credentials**: admin/secret123

### 2. 📝 Form Auth (`/form-auth`)  
- **Port**: 3002
- **Demo**: Custom form-based authentication with sessions
- **Features**: Custom login form, session management, multiple users
- **Credentials**: admin/password123, john/secret456, user@example.com/mypassword

### 3. 🚫 Blocking UI (`/blocking-ui`)
- **Port**: 3003  
- **Demo**: Cookie-based blocking overlay
- **Features**: First-time user blocking UI, cookie persistence
- **Behavior**: Shows overlay until "existingUser" cookie is set

### 4. 🔄 Multi-Page Auth (`/multi-page-auth`)
- **Port**: 3004
- **Demo**: 3-step authentication flow
- **Features**: Multi-step form process, session-based auth
- **Credentials**: user@example.com/password123, john/mypassword, admin/admin123

## Quick Start

### One Command Setup:
```bash
cd web-demos
npm run setup
```

This will install all dependencies and start all servers!

### Manual Setup:
```bash
# Install dependencies for all projects
npm run install-all

# Start all servers
npm start
```

### Access the demos:
- **Basic Auth**: http://localhost:3001
- **Form Auth**: http://localhost:3002  
- **Blocking UI**: http://localhost:3003
- **Multi-Page Auth**: http://localhost:3004

## Features Comparison

| Feature | Basic Auth | Form Auth | Blocking UI | Multi-Page Auth |
|---------|------------|-----------|-------------|-----------------|
| **UI Type** | Browser dialog | Custom form | Blocking overlay | Multi-step forms |
| **Persistence** | Browser cache | Server sessions | Client cookies | Server sessions |
| **User Experience** | Simple, native | Fully customizable | First-time blocking | Step-by-step flow |
| **Security** | HTTP headers | Session-based | Cookie-based | Session + validation |
| **Logout** | Close browser | Server logout | Clear cookie | Session destroy |
| **Styling** | Limited | Full control | Full control | Full control |

## Use Cases

### Basic Auth
- **Best for**: Simple admin panels, development environments, API endpoints
- **Pros**: No setup required, works everywhere
- **Cons**: Limited styling, no logout, credentials in every request

### Form Auth
- **Best for**: User-facing applications, branded experiences
- **Pros**: Full control, proper logout, session management
- **Cons**: More complex setup, requires session storage

### Blocking UI
- **Best for**: First-time user experiences, consent forms, announcements
- **Pros**: Non-intrusive persistence, great for onboarding
- **Cons**: Not for security, can be bypassed by disabling cookies

### Multi-Page Auth
- **Best for**: Complex authentication flows, enhanced security
- **Pros**: User-friendly step-by-step process, better UX for complex forms
- **Cons**: More complex implementation, multiple server routes

## Security Notes

⚠️ **Important**: These are demo implementations. For production use:

1. **Use HTTPS** always
2. **Hash passwords** with bcrypt
3. **Implement rate limiting** 
4. **Use secure session stores** (Redis, database)
5. **Set secure cookie flags**
6. **Implement CSRF protection**
7. **Add input validation**
8. **Use environment variables** for secrets

## Directory Structure

```
web-demos/
├── basic-auth/
│   ├── server.js
│   ├── package.json
│   └── public/
│       ├── index.html
│       └── secure.html
├── form-auth/
│   ├── server.js
│   ├── package.json
│   └── public/
│       ├── index.html
│       ├── login.html
│       └── secure.html
├── blocking-ui/
│   ├── server.js
│   ├── package.json
│   └── public/
│       ├── index.html
│       └── content.html
├── multi-page-auth/
│   ├── server.js
│   ├── package.json
│   └── public/
│       ├── step1.html
│       ├── step2.html
│       └── dashboard.html
├── start-all.js
├── package.json
└── README.md
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Session Management**: express-session
- **Cookie Handling**: cookie-parser
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, Gradients, Animations
- **Process Management**: Node.js child_process for concurrent servers

## License

MIT License - Feel free to use these examples in your projects!
