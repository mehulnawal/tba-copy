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

```bash
 B2B catalog page: /C:/Users/Admin/Desktop/TBA/tba-website - Copy/client/src/pages/B2BCatalog.tsx
  - B2B product Price Breakup (Silver + Gold): /C:/Users/Admin/Desktop/TBA/tba-website - Copy/client/
    src/pages/B2BProductDetails.tsx
    Shared breakup component: /C:/Users/Admin/Desktop/TBA/tba-website - Copy/client/src/components/
    PriceBreakup.tsx

  - B2C catalog page: /C:/Users/Admin/Desktop/TBA/tba-website - Copy/client/src/pages/ProductPage.tsx
  - B2C product Price Breakup (Silver + Gold): /C:/Users/Admin/Desktop/TBA/tba-website - Copy/client/
    src/pages/ProductDetails.tsx
    Shared breakup component: /C:/Users/Admin/Desktop/TBA/tba-website - Copy/client/src/components/
    PriceBreakup.tsx
```