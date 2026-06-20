# Dorknio

Dorknio is an advanced, client-side web application designed to simplify and streamline open-source intelligence (OSINT) gathering through targeted Google search queries (Google Dorking).

## 🚀 Features

- **Intuitive Dork Builder**: Construct complex search queries visually by specifying search parameters (inurl, intitle, site, etc.) and file types without memorizing syntax.
- **Pre-built Templates**: Quickly select from a library of common reconnaissance scenarios (e.g., directory listings, exposed configuration files, database dumps) tailored to your target domain.
- **Syntax Reference**: Instant access to a comprehensive guide of Google Dork operators and their usage examples.
- **History Tracking**: Automatically saves your generated queries locally so you can easily review, reuse, or copy previous searches.
- **Client-Side Only (No Telemetry)**: The application runs entirely in your browser with zero server-side APIs, ensuring that your targets and queries remain completely private.
- **Professional & Responsive UI**: Designed with a sleek, dark-themed interface, featuring smooth animations and a responsive layout suitable for both desktop and mobile devices.

## 🛠️ Technology Stack

- **React 18** with **TypeScript** for robust component architecture and type safety.
- **Vite** for lightning-fast development server and optimized production builds.
- **Vanilla CSS** with CSS Variables to manage theme colors, animations, and a modern glassmorphic look.
- **Lucide React** for crisp, scalable iconography.

## 🔒 Security Posture

Dorknio has been built with security in mind:
- **No External Dependencies**: Zero reliance on external backend servers or telemetry APIs.
- **Input Sanitization**: All user inputs (domains, search terms) are sanitized client-side to strip HTML tags, prevent cross-site scripting (XSS), and block malicious script protocols (`javascript:`).
- **Length Constraints**: Stringent maximum length limits are enforced on all input fields to mitigate browser performance degradation.
- **Data Privacy**: Search history is kept locally on the user's machine.

## 📦 Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Navigate to the project directory**:
   ```bash
   cd dorknio
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
   *The application will typically run at `http://localhost:5173`.*

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

This will output static files into the `dist` directory, which can be deployed to any static web hosting service (e.g., GitHub Pages, Vercel, Netlify).

## ⚠️ Disclaimer

This tool is intended for authorized security testing, educational purposes, and legal open-source intelligence gathering only. Users are responsible for their actions and should ensure they have permission before conducting reconnaissance on target domains.
