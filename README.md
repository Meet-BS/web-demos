# Web Demos – Unified Authentication & UI Showcase

A comprehensive collection of web authentication and UI demos featuring Basic Auth, Form-based Auth, Cookie Blocking UI, and Multi-Page Authentication flows – all running on a single Express.js server.

## 🌟 Live Demo

Visit the live deployment: [Web Demos on Render](https://your-app-name.onrender.com)

## 🏗️ Architecture

- **Single Express.js server** (`server.js`)
- All authentication demos are served from one process and one `public/` directory
- Easy to run locally or deploy as a single service

## 🚀 Local Development

### Prerequisites
- Node.js 16+ and npm

### Quick Start
```bash
# Clone and navigate to project
cd web-demos
npm install
npm start
```

Visit http://localhost:3000 to access the landing page with links to all demos.

## 📁 Project Structure

```
web-demos/
├── package.json
├── package-lock.json
├── server.js
├── index.html
├── public/
│   ├── basic-auth-secure.html
│   ├── blocking-ui-content.html
│   ├── form-auth-login.html
│   ├── form-auth-secure.html
│   ├── multi-page-dashboard.html
│   ├── multi-page-step1.html
│   ├── multi-page-step2.html
│   └── multi-page-step3.html
├── health-check.js
├── README.md
└── DEPLOYMENT.md
```

## 🔧 Available Scripts

- `npm start` – Start the unified server

## 🎯 Demo Features

### Basic Auth Demo
- HTTP Basic Authentication (browser popup)
- Demo credentials: `admin` / `admin`, `test@meet.com` / `Meet@123`, etc.

### Form Auth Demo
- Session-based authentication
- Custom login form
- Demo credentials: `admin` / `admin`, `test@meet.com` / `Meet@123`, etc.

### Cookie Blocking UI Demo
- Cookie-based access control
- Interactive UI for managing access

### Multi-Page Auth Demo
- 2-step authentication workflow
- Progressive access levels
- Demo credentials: `admin@example.com` / `password123`, `user@demo.com` / `testpass`, etc.

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
