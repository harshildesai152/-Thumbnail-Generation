# Thumbnail Design Project

This repository contains the source code for the Thumbnail Design application, featuring a Next.js frontend and a Node.js backend.

## 🛠 Project Structure

- **root/**: Frontend application (Next.js)
- **backend/**: Backend application (Node.js/Express)

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for running the backend services)

---

## 🚀 Getting Started

### 1. Backend Setup (Docker)

The backend runs in a Docker container along with MongoDB and Redis.

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create an `.env` file** (Optional for Docker, but good practice):
    The `docker-compose.yml` comes pre-configured with development values. If you want to customize them, create a `.env` file in the `backend` directory:

    ```env
    PORT=3003
    MONGODB_URI=mongodb://mongo:27017/thumbnail-db
    REDIS_HOST=redis
    REDIS_PORT=6379
    JWT_SECRET=your_secret_key
    FRONTEND_URL=http://localhost:3000
    ```

3.  **Start the services:**
    ```bash
    docker-compose up --build
    ```
    - The backend API will be available at `http://localhost:3003`.
    - MongoDB runs on port `27017`.
    - Redis runs on port `6379`.

### 2. Frontend Setup (Local)

The frontend is a Next.js application running locally.

1.  **Navigate to the root directory:**

    ```bash
    cd ..
    # or cd "e:\Tumbnail Design"
    ```

2.  **Create an `.env.local` file:**
    Create a file named `.env.local` in the root directory with the following content:

    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    - The frontend will be available at `http://localhost:3000`.

---

## 🛑 Stopping the Services

- **Backend:** Press `Ctrl+C` in the terminal running Docker, or run `docker-compose down` in the `backend` directory.
- **Frontend:** Press `Ctrl+C` in the terminal running `npm run dev`.

## ✨ Troubleshooting

- **Port Conflicts:** Ensure ports `3003`, `27017`, and `6379` are free before starting Docker. stop any local instances of Mongo, Redis, or Node servers.
- **Connection Issues:** If the frontend can't connect to the backend, ensure `NEXT_PUBLIC_BACKEND_URL` matches the Docker backend port (default 3003).
