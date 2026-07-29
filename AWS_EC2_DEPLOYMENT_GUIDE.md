# 🔒 How to Enable HTML5 Geolocation & Camera Access on AWS EC2

Chrome, Safari, and Edge treat HTML5 `navigator.geolocation` and `navigator.getBattery()` as **Secure Context APIs**, requiring either `https://` or `localhost`.

---

## ⚡ Method 1: Chrome Flag Bypass (Instant — 30 Seconds, No Server Changes)

Use this method to test real HTML5 GPS location on your laptop or phone without setting up SSL certificates:

1. Open Chrome and navigate to:
   ```text
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
2. In the text field for **"Insecure origins treated as secure"**, paste:
   ```text
   http://13.203.158.91:5173
   ```
3. Change the dropdown from *Disabled* to **Enabled**.
4. Click **Relaunch** at the bottom right of Chrome.
5. Visit `http://13.203.158.91:5173` — Chrome now grants **Allow Location Access** permissions!

---

## 🛡️ Method 2: Setup HTTPS with Self-Signed SSL + Nginx on EC2

To serve the app over HTTPS (`https://13.203.158.91`) on EC2:

Run these commands in your EC2 terminal:

```bash
# 1. Install Nginx and OpenSSL
sudo dnf install -y nginx openssl

# 2. Generate a Self-Signed SSL Certificate
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=13.203.158.91"

# 3. Create Nginx HTTPS Configuration
sudo cat << 'EOF' > /etc/nginx/conf.d/smartcampus.conf
server {
    listen 443 ssl;
    server_name 13.203.158.91;

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;

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
EOF

# 4. Restart Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
```

Now visit **`https://13.203.158.91`** in your browser, click **Advanced $\rightarrow$ Proceed to 13.203.158.91**, and full HTML5 Geolocation API access is unlocked!
