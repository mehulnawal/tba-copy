## ssh root@200.141.1.125

## Backend (server) Update

```bash
cd /var/www/tba-jewellery/server

git pull origin main

npm install

pm2 restart tba-backend
```

## Frontend (client) Update

```bash
cd /var/www/tba-jewellery/client

git pull origin main

npm install

npm run build

pm2 restart tba-backend
```
(agar client ka apna alag PM2 process nahi hai — pm2 list me sirf `tba-backend` dikha, koi frontend process nahi. Matlab frontend Nginx se static serve ho raha hai. Us case me `pm2 restart` ki zaroorat nahi, sirf build kaafi hai — Nginx naya build automatically serve karega)

## Backend .env Update

```bash
cd /var/www/tba-jewellery/server

nano .env
# edit, Ctrl+O save, Enter, Ctrl+X exit

pm2 restart tba-backend
```

## Frontend .env Update

```bash
cd /var/www/tba-jewellery/client

nano .env
# edit, save-exit

npm run build
```

## Sanity Check

```bash
pm2 list
pm2 logs tba-backend --lines 50
```

**Ek confirm kar do** — client ka build output kahan serve ho raha hai Nginx se (`/var/www/tba-jewellery/client/dist` ya `build` folder)? Agar Nginx config ka path check karna ho:

```bash
cat /etc/nginx/sites-available/*.conf | grep -A 3 "root"
```

Ye chala ke bata do, taaki main confirm kar sakoon ki `npm run build` ke baad Nginx sahi jagah se serve kar raha hai ya nahi.