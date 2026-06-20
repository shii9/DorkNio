<div align="center">
  <img src="https://raw.githubusercontent.com/shii9/DorkNio/main/public/favicon.svg" alt="DorkNio Logo" width="120" />
  <h1>DorkNio</h1>
  
  <p><strong>Advanced Open-Source Intelligence (OSINT) Gathering Made Simple</strong></p>

  <p>
    <a href="https://shii9.github.io/DorkNio/"><strong>View Live Application »</strong></a>
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB">
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="Vite" src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge">
  </p>
</div>

<br />

An advanced, client-side Open-Source Intelligence (OSINT) tool that simplifies complex Google Dorking queries for rapid reconnaissance and security research. Build your queries visually and securely, entirely within your browser.

---

## 📑 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Security & Privacy](#-security--privacy)
- [Deployment](#-deployment)
- [Disclaimer](#-disclaimer)

---

## 🔍 About The Project

Google Dorking is a powerful technique for uncovering hidden information on the web, but manually memorizing and typing out complex operators (`inurl:`, `site:`, `ext:`, etc.) is tedious and error-prone. 

**DorkNio** solves this by providing a highly visual, sleek interface to construct these queries dynamically. Whether you are a penetration tester looking for exposed `.env` files, or an OSINT researcher mapping out a target's infrastructure, DorkNio provides curated templates and a comprehensive builder to accelerate your workflow.

## 🚀 Key Features

* **Visual Query Builder:** Construct complex search queries visually by toggling search engines (Google/Bing), parameters, and file types. No syntax memorization required.
* **Reconnaissance Templates:** Rapidly access a curated library of attack vectors—such as directory listings, exposed configuration files, database dumps, and sensitive documents—tailored instantly to your target domain.
* **Interactive Syntax Guide:** A built-in reference tab providing a comprehensive dictionary of Google Dork operators, their meanings, and practical examples.
* **Persistent Local History:** Automatically tracks and saves your generated queries locally so you can review, copy, or rerun previous searches effortlessly.
* **Magnetic & Premium UI:** Designed with a hacker-friendly dark mode, subtle glassmorphic depth, dynamic cursors, and silky-smooth CSS animations.

## 💻 Technology Stack

DorkNio is built for speed and maintainability using a modern web stack:

* **Framework:** [React 18](https://reactjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/) for robust type-safety
* **Bundler:** [Vite](https://vitejs.dev/) for lightning-fast HMR and optimized production builds
* **Styling:** Vanilla CSS with custom property systems (Zero external CSS frameworks used)
* **Icons:** [Lucide React](https://lucide.dev/)

## 🛡️ Security & Privacy

We treat your data and security as a first-class citizen:

* **100% Client-Side:** The application runs entirely in the browser. There are no backend APIs, no telemetry, and no tracking. Your target domains and searches never leave your machine.
* **Strict Input Sanitization:** All user inputs (domains, search terms) are actively sanitized to strip HTML tags, prevent XSS attacks, and block malicious script execution (`javascript:`).
* **Browser Performance:** Hard limits and length constraints are enforced on input fields to prevent browser memory degradation from massive strings.

---

## 🌐 Deployment

DorkNio is configured for seamless deployment to GitHub Pages.

To build and deploy the application from your local machine:
```sh
npm run deploy
```
This script will build an optimized production bundle and push it to the `gh-pages` branch. Ensure your GitHub repository settings are configured to host Pages from the `gh-pages` branch.

---

## ⚖️ Disclaimer

**DorkNio is built for authorized security testing, educational purposes, and legal open-source intelligence gathering only.**

The developers of DorkNio do not condone, encourage, nor take responsibility for any unauthorized access, misuse, or illegal activities conducted with this tool. Users are solely responsible for their actions and must ensure they have explicit, documented permission before conducting reconnaissance on any domains, networks, or infrastructure.

---

<div align="center">
  <i>Built with precision for the cybersecurity community.</i>
</div>
