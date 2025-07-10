# Web Demos - Authentication & UI Showcase

A comprehensive collection of web authentication and UI demos featuring Basic Auth, Form-based Auth, Cookie Blocking UI, and Multi-Page Authentication flows.

## 🌟 Live Demo

Visit the live deployment: [Web Demos on Render](https://your-app-name.onrender.com)

## 🏗️ Architecture

This project contains 5 Express.js servers:
- **Landing Page** (Port 3000): Central hub with navigation and status monitoring
- **Basic Auth Demo** (Port 3001): HTTP Basic Authentication with browser popup
- **Form Auth Demo** (Port 3002): Session-based form authentication
- **Cookie Blocking UI** (Port 3003): Cookie-based access control demo
- **Multi-Page Auth** (Port 3004): Multi-step authentication workflow

## 🚀 Local Development

### Prerequisites
- Node.js 16+ and npm

### Quick Start
```bash
# Clone and navigate to project
git clone <your-repo-url>
cd web-demos

# Install dependencies for all demos
npm run install-all

# Start all servers in parallel
npm start
```

Visit http://localhost:3000 to access the landing page with links to all demos.

### Individual Demo Development
```bash
# Start a single demo
npm run start:basic    # Basic Auth Demo
npm run start:form     # Form Auth Demo
npm run start:blocking # Cookie Blocking UI
npm run start:multipage # Multi-Page Auth
```

## 🌐 Deployment on Render

### Option 1: Single Service Deployment (Recommended)
Deploy all demos as one service with multiple ports:

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Build Command:** `npm run install-all`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
4. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Render will override this)
5. **Deploy**

### Option 2: Multiple Service Deployment
Deploy each demo as a separate Render service:

#### Landing Page Service
- **Build Command:** `npm install`
- **Start Command:** `npm run start:landing`
- **Root Directory:** `/`

#### Basic Auth Service
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `/basic-auth`

#### Form Auth Service
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `/form-auth`

#### Cookie Blocking Service
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `/blocking-ui`

#### Multi-Page Auth Service
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `/multi-page-auth`

### Environment Configuration

The application automatically detects the Render environment and configures ports accordingly:

- **Local Development:** Uses ports 3000-3004
- **Render Deployment:** Uses the PORT environment variable provided by Render

### Health Checks

All servers include `/health` endpoints for monitoring:
- Landing Page: `GET /health`
- Individual Demos: `GET /health`

## 📁 Project Structure

```
web-demos/
├── package.json              # Root dependencies and scripts
├── start-all.js             # Multi-server startup script
├── landing-server.js        # Landing page server
├── index.html              # Landing page UI
├── render.yaml             # Render deployment config
├── basic-auth/             # Basic Auth Demo
│   ├── server.js
│   ├── package.json
│   └── public/
├── form-auth/              # Form Auth Demo
│   ├── server.js
│   ├── package.json
│   └── public/
├── blocking-ui/            # Cookie Blocking Demo
│   ├── server.js
│   ├── package.json
│   └── public/
└── multi-page-auth/        # Multi-Page Auth Demo
    ├── server.js
    ├── package.json
    └── public/
```

## 🔧 Available Scripts

- `npm start` - Start all servers in parallel
- `npm run install-all` - Install dependencies for all demos
- `npm run setup` - Full setup and start
- `npm run start:landing` - Start only landing page
- `npm run start:basic` - Start Basic Auth demo
- `npm run start:form` - Start Form Auth demo
- `npm run start:blocking` - Start Cookie Blocking demo
- `npm run start:multipage` - Start Multi-Page Auth demo

## 🎯 Demo Features

### Basic Auth Demo
- HTTP Basic Authentication
- Browser popup login
- Credentials: `admin` / `secret123`
- Logout and redo functionality

### Form Auth Demo
- Session-based authentication
- Custom login form
- Credentials: `admin` / `password123`
- Session management

### Cookie Blocking UI Demo
- Cookie-based access control
- Interactive UI for managing access
- Real-time status updates

### Multi-Page Auth Demo
- 3-step authentication workflow
- Progressive access levels
- Step-by-step validation

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js
- **Session Management:** express-session
- **Cookie Parsing:** cookie-parser
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Deployment:** Render

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/your-username/web-demos/issues).

---

⭐ **Star this repository if you find it helpful!**  
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
