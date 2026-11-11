# Quick Start Guide

## First Time Setup

### 1. Install Dependencies (Already Done! ✓)
```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure Environment Variables

**Create `server/.env`** with these settings:

```env
PORT=5000
NODE_ENV=development

# MongoDB - Choose ONE:
# Option A: Local MongoDB
MONGO_URI=mongodb://localhost:27017/fixfirst

# Option B: MongoDB Atlas (recommended)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fixfirst

JWT_SECRET=fixfirst-secret-key-change-in-production

# OpenAI - Leave empty for DEMO MODE (works without API key)
OPENAI_API_KEY=

# Cloudinary - Get free account at cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

CLIENT_URL=http://localhost:5173
```

### 3. Seed Database with Demo Data

```bash
cd server
node utils/seed.js
```

This creates:
- **Customer account**: customer@fixfirst.com / password123
- **Vendor account**: vendor@fixfirst.com / password123
- **Admin account**: admin@fixfirst.com / admin123
- Sample repair requests and data

---

## Running the App

### Terminal 1 - Backend
```bash
cd server
npm run dev
```
✅ Server running at http://localhost:5000

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
✅ Client running at http://localhost:5173

### Open Browser
Navigate to: **http://localhost:5173**

---

## Test the App

### As Customer:
1. Login: customer@fixfirst.com / password123
2. Create a repair request
3. Upload device images
4. Try AI troubleshooting
5. View and accept quotations
6. Track booking status

### As Vendor:
1. Login: vendor@fixfirst.com / password123
2. Complete vendor profile setup
3. Browse available repair requests
4. Submit quotations
5. Manage bookings

### As Admin:
1. Login: admin@fixfirst.com / admin123
2. View platform statistics
3. Manage users and vendors
4. Monitor repair requests
5. Handle complaints

---

## Common Issues

### "Cannot connect to MongoDB"
- Install MongoDB locally OR use MongoDB Atlas (free tier)
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
- Copy connection string to `MONGO_URI` in `.env`

### "Cloudinary upload failed"
- Sign up at https://cloudinary.com (free tier)
- Get credentials from Dashboard → Settings → Access Keys
- Add to `.env`

### "AI troubleshooting not working"
- App works in DEMO MODE without OpenAI key
- For real AI: Get key from https://platform.openai.com/api-keys
- Add to `OPENAI_API_KEY` in `.env`

### Port already in use
- Change `PORT=5000` in server/.env to another port (e.g., 5001)
- Update `VITE_API_URL` in client/.env to match

---

## Project Status: ✅ COMPLETE

All features implemented:
- ✅ Full authentication system (JWT)
- ✅ Customer repair request flow
- ✅ Vendor quotation system
- ✅ Booking management
- ✅ AI troubleshooting chatbot (demo mode)
- ✅ Image uploads (Cloudinary)
- ✅ Real-time notifications (Socket.io)
- ✅ Admin panel
- ✅ Rating and review system
- ✅ Role-based access control
- ✅ Responsive design (Tailwind CSS)

Ready to launch! 🚀
