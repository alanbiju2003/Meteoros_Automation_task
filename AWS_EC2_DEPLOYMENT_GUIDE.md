# 🚀 Step-by-Step AWS EC2 & PostgreSQL Deployment Guide
## Enterprise College Smart Attendance & Live Student Tracking System

This guide walks you through deploying the complete application on an **AWS EC2 Ubuntu 22.04 LTS Instance** with **Docker Compose**, **PostgreSQL + TimescaleDB**, **Prisma Migrations**, **Database Seeding**, and **Nginx / PM2**.

---

## 1. Launch & Configure AWS EC2 Instance

1. Log into **AWS Management Console** $\rightarrow$ Navigate to **EC2 Dashboard**.
2. Click **Launch Instance**:
   - **Name**: `smart-campus-attendance-server`
   - **AMI**: `Ubuntu Server 22.04 LTS (64-bit x86)`
   - **Instance Type**: `t3.medium` (Recommended: 2 vCPUs, 4 GiB RAM)
   - **Key Pair**: Create or select your `.pem` SSH key.
3. **Network & Security Group Rules**:
   - Allow `SSH (Port 22)` from your IP.
   - Allow `HTTP (Port 80)` from Anywhere (`0.0.0.0/0`).
   - Allow `HTTPS (Port 443)` from Anywhere (`0.0.0.0/0`).
   - Allow `Port 3000` (Backend Express API) & `Port 5173` (Frontend Web App).

---

## 2. SSH into EC2 & Install Node.js, Docker, & Git

SSH into your EC2 instance from your terminal:

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

Update packages and install **Node.js 20 LTS**, **Docker**, **Docker Compose**, and **PM2**:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Install PM2 Process Manager globally
sudo npm install -g pm2

# Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## 3. Clone Repository & Setup Environment Variables

Clone your GitHub repository on EC2:

```bash
git clone https://github.com/alanbiju2003/Meteoros_Automation_task.git
cd Meteoros_Automation_task
```

### Backend `.env` File (`backend/.env`):
Create the `backend/.env` configuration file on EC2:

```bash
nano backend/.env
```

Paste the following production configuration:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:postgres@localhost:5440/campus_attendance?schema=public"
JWT_SECRET="smartcampus_super_secret_jwt_key_2026"
CORS_ORIGIN="*"
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 4. Start PostgreSQL + TimescaleDB via Docker Compose

Run Docker Compose to spin up PostgreSQL & TimescaleDB on port `5440`:

```bash
docker-compose up -d
```

Verify that the TimescaleDB container is running cleanly:

```bash
docker-compose ps
```

---

## 5. Execute Prisma Database Migrations & Seed All 50 Students

Navigate into the `backend/` directory and run database setup:

```bash
cd backend

# Install production dependencies
npm install

# Deploy Prisma Database Schema & TimescaleDB Hypertables
npx prisma migrate deploy

# Seed All 50 Students, Admin, Class Schedules, & 14-Day Attendance History
npm run db:seed
```

*(You will see: `Seeding complete! 14 days of multi-day class attendance records generated for 50 students!`)*

---

## 6. Build & Start Backend and Frontend Servers

### Start Backend Service (Express Port 3000):
```bash
# Compile TypeScript to JS
npm run build

# Start Backend using PM2
pm2 start dist/server.js --name "smartcampus-backend"
```

### Build & Start Frontend Service (Client Port 5173):
```bash
cd ../client

# Install frontend dependencies
npm install

# Build static production bundle
npm run build

# Serve Frontend using preview / PM2
pm2 start "npm run preview -- --host 0.0.0.0 --port 5173" --name "smartcampus-client"

# Save PM2 process list across EC2 reboots
pm2 save
pm2 startup
```

---

## 7. Setup Nginx Reverse Proxy (Optional / Recommended)

Install Nginx to route domain traffic directly on Port 80 / 443:

```bash
sudo apt install -y nginx
```

Edit Nginx configuration (`/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

---

## 8. Credentials Summary to Share with CTO via WhatsApp

### 👑 College Super Administrator Access
- **Portal URL**: `http://YOUR_EC2_PUBLIC_IP/login`
- **Email**: `admin@college.edu`
- **Password**: `admin123`

### 🎓 Student Portal Access (50 Accounts Seeded)
- **Portal URL**: `http://YOUR_EC2_PUBLIC_IP/login`
- **Student 1 Email**: `student1@gmail.com` | **Password**: `student001`
- **Student 2 Email**: `student2@gmail.com` | **Password**: `student002`
- **Student 3 Email**: `student3@gmail.com` | **Password**: `student003`
- ... up to **Student 50 Email**: `student50@gmail.com` | **Password**: `student050`
