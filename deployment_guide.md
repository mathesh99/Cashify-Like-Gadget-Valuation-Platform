# Hostinger Deployment Guide for Cashify

Deploying a MERN (Node.js/React) stack application to Hostinger requires a few specific steps depending on your plan.

## 1. Prepare for Production

### Frontend (Vite)
You shouldn't upload your source code directly. Instead, create a production build:
1. Open your terminal in the `frontend` folder.
2. Run: `npm run build`
3. This will create a `dist` folder. This folder contains the static files for your website.

### Backend (Node.js)
Ensure your `server.js` or main entry point uses a dynamic port:
```javascript
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 2. Hostinger Setup (VPS Recommendation)

Hostinger's **VPS** is the best choice for Node.js apps. If you are using **Shared Hosting**, check if your plan has the "Node.js" feature in the hPanel.

### A. Using Hostinger VPS (Recommended)
1. **Connect via SSH**: Use Termius or PuTTY to connect to your VPS IP.
2. **Setup Environment**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   sudo npm install -g pm2
   ```
3. **Upload Files**: Transfer your `backend` folder and the `frontend/dist` folder to the server (you can use Git or FileZilla).
4. **Environment Variables**: Create a `.env` file in your `backend` folder on the server.
   - Set `VITE_API_URL` to your domain (e.g., `https://yourdomain.com/api`).
5. **Run the Backend**:
   ```bash
   cd backend
   npm install
   pm2 start server.js --name "cashify-backend"
   ```

### B. Using Hostinger Node.js Selector (Shared Hosting)
If your plan supports it:
1. Go to **hPanel** > **Node.js**.
2. Create a new Node.js application.
3. Set the **App Root** to your backend folder.
4. Set the **Application URL**.
5. Upload your files via File Manager.
6. Install dependencies using the "npm install" button in hPanel.

## 3. Serving the Frontend
The most reliable way to host on Hostinger (especially on Shared Hosting) is to have your Node.js backend serve the frontend.

### Step 1: Build the Frontend
1. In your `frontend` folder, run: `npm run build`.
2. This creates a `dist` folder inside `frontend`.
3. Copy the `dist` folder into your `backend` folder (so it's at `backend/dist`).

### Step 2: Update `backend/server.js`
Add this code at the very bottom of your `server.js`, just before `app.listen`:

```javascript
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### Step 3: Hostinger Configuration
1. Go to **hPanel** > **Node.js**.
2. Point the **App Root** to your `backend` folder.
3. Use `server.js` as the entry file.
4. Hostinger will automatically provide a port, which your code `process.env.PORT || 3000` already handles!

## 4. Final Checklist
- [x] **Database**: Your `database.db` (SQLite) is in the root of the backend folder. It will stay there.
- [ ] **SSL**: Enable SSL in Hostinger to ensure `https`.
- [ ] **Dependencies**: Run `npm install` in the Hostinger terminal or via the hPanel button.
- [ ] **Environment**: Set `VITE_API_URL` to your domain in the hPanel Environment Variables.

> [!IMPORTANT]
> If you are on a **Shared Hosting** plan, you might need to use the ".htaccess" trick if the Node.js selector is not available. However, most modern Hostinger plans include Node.js support.

> [!TIP]
> For the best performance and easiest management, use **PM2** on a VPS. It ensures your backend restarts automatically if the server crashes.
