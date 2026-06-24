# MERN Stack Professional Portfolio

A premium, modern, and interactive professional portfolio website built using the MERN stack (MongoDB, Express, React, Node.js) with a stunning glassmorphism design.

## Features

- **React Frontend (powered by Vite)**: Ultra-fast loading, modular design, and clean scroll indicators.
- **Responsive Layout**: Designed to look exceptional on mobile, tablet, and desktop viewports.
- **Glassmorphic Theme**: Dark/light theme support using CSS custom variables with frosted glass elements and floating background glow containers.
- **Dynamic Projects Section**: Category filter controls, animated project grids, and modal popups showing project details.
- **MERN API Backend**: Custom endpoints using Node.js & Express.js connected to MongoDB.
- **Interactive Admin Dashboard**:
  - Secure JWT authentication login.
  - CRUD operations to add, modify, or delete portfolio projects, skills, and experience items.
  - Profile metadata management (change name, headline, location, and social links).
  - Built-in contact inbox to view, read, and delete emails sent through the portfolio page contact form.

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB running locally on port `27017`

### Installation & Run

1. **Open PowerShell/CMD in the project directory.**
2. **Install all dependencies** (for root, backend, and frontend):
   ```bash
   npm run install-all
   ```
3. **Seed the database** (this clears the database and populates it with default profile details, tech skills, experiences, and projects):
   ```bash
   npm run seed
   ```
4. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   This will run both the backend server (on port `5000`) and the Vite React development server (on port `3000`) concurrently.
5. **View Portfolio**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Portal Details

- **Admin Login Page**: [http://localhost:3000/login](http://localhost:3000/login)
- **Default Credentials**:
  - **Username**: `admin`
  - **Password**: `adminpassword123`

> [!WARNING]
> It is highly recommended to change the password or username in the database or via a direct database query before exposing this application in production.
