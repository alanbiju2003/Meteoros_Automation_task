# 🚀 AWS EC2 Setup Guide for Amazon Linux 2023 (`ec2-user` / `dnf`) & Ubuntu (`apt`)

Since your EC2 instance is **Amazon Linux 2023** (indicated by `ec2-user@ip-...` and `sudo: apt: command not found`), use the `dnf` commands below!

---

## 1. Amazon Linux 2023 Setup Commands (Copy & Paste All)

Copy and paste these commands directly into your `ec2-user` terminal:

```bash
# 1. Update system packages
sudo dnf update -y

# 2. Install Node.js 20 LTS, Git, and C++ Compiler tools
sudo dnf install -y nodejs git gcc-c++ make

# 3. Install Docker & Docker Compose Plugin
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo mkdir -p /usr/libexec/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose

# 4. Install PM2 Process Manager
sudo npm install -g pm2

# 5. Clone Repository
git clone https://github.com/alanbiju2003/Meteoros_Automation_task.git
cd Meteoros_Automation_task

# 6. Apply Docker Group Permissions
newgrp docker
```

---

## 2. Start Database Container & Seed All 50 Students

Now run Docker Compose and database seeding:

```bash
# 1. Start PostgreSQL + TimescaleDB Container on Port 5440
docker compose up -d

# 2. Create backend/.env file
cat << 'EOF' > backend/.env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:postgres@localhost:5440/campus_attendance?schema=public"
JWT_SECRET="smartcampus_super_secret_jwt_key_2026"
CORS_ORIGIN="*"
EOF

# 3. Install Backend Dependencies, Deploy Migration, & Seed Data
cd backend
npm install
npx prisma migrate deploy
npm run db:seed
```

*(Output will confirm: `Seeding complete! 14 days of multi-day class attendance records generated for 50 students!`)*

---

## 3. Build & Launch Backend and Frontend Apps

```bash
# 1. Build and Start Backend (Port 3000)
npm run build
pm2 start dist/server.js --name "smartcampus-backend"

# 2. Build and Start Frontend (Port 5173)
cd ../client
npm install
npm run build
pm2 start "npm run preview -- --host 0.0.0.0 --port 5173" --name "smartcampus-client"

# 3. Save PM2 across system reboots
pm2 save
pm2 startup
```

---

## 4. EC2 Access URLs & WhatsApp Credentials for CTO

Replace `YOUR_EC2_PUBLIC_IP` with your EC2 instance's Public IPv4 address:

- **Admin Login**: `http://YOUR_EC2_PUBLIC_IP:5173/login`
  - Email: `admin@college.edu`
  - Password: `admin123`

- **Student Login (50 Accounts Seeded)**: `http://YOUR_EC2_PUBLIC_IP:5173/login`
  - Student 1: `student1@gmail.com` / `student001`
  - Student 2: `student2@gmail.com` / `student002`
  - Student 3: `student3@gmail.com` / `student003`
  - ... up to Student 50: `student50@gmail.com` / `student050`
