# Yami Restaurant Management System 🍽️

A full-stack web application for managing restaurant operations, built with React and Node.js.

## Overview

A role-based platform serving three user types — customers, employees, and admins — each with a dedicated interface and workflow.

## Features

**Customer**
- Browse menu and place orders
- Track order status in real time
- Payment flow

**Employee**
- View and manage pending / active orders
- Order history and personal dashboard

**Admin**
- Dashboard with analytics
- Full menu management (CRUD)
- Employee management — create, deactivate, reactivate
- Order oversight and assignment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Recharts, jsPDF, Vite |
| Backend | Node.js, Express 5 |
| Database | MySQL |
| Auth | JWT (httpOnly cookies), bcrypt |
| Security | Helmet, CORS, CSRF protection, rate limiting |

## Architecture

- **Client** — SPA with protected routes per role (`customer` / `employee` / `admin`)
- **Server** — RESTful API with layered architecture: routes → controllers → services
- **Database** — Relational schema with migrations (`/server/migrations`)

## Getting Started

### Prerequisites
- Node.js
- MySQL

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

Create a `.env` file in `/server` based on `.env.example`:

```
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in `/client` based on `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

### Run

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### Seed Demo Data (optional)

```bash
cd server && node seed_demo.js
```
