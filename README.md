# FixFirst - Device Repair Marketplace

A full-stack platform connecting customers with verified repair vendors. Customers submit repair requests with AI-powered troubleshooting, vendors bid with quotations, and bookings are managed seamlessly.

## Features

### For Customers
- 🔧 Submit repair requests with device images
- 🤖 AI-powered troubleshooting chatbot
- 💰 Compare vendor quotations
- 📅 Book and track repairs
- ⭐ Rate and review vendors
- 📊 Repair history dashboard

### For Vendors
- 📋 Browse available repair requests
- 💵 Submit competitive quotations
- 📆 Manage bookings and schedules
- 🏆 Build reputation with ratings
- 💼 Professional profile management
- 🔔 Real-time notifications

### For Admins
- 👥 Manage users and vendors
- 🛠️ Oversee repair requests
- 📝 Handle complaints
- 📈 View platform analytics

## Tech Stack

### Backend
- **Node.js** + **Express** - RESTful API
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time notifications
- **Cloudinary** - Image uploads
- **OpenAI API** - AI troubleshooting (with mock mode)

### Frontend
- **React 19** + **Vite** - Fast development
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **Lucide React** - Icons
- **Context API** - State management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- OpenAI API key (optional - works in demo mode without it)

### 1. Clone and Install

```bash
cd FixFirst

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables

Create `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/fixfirst
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fixfirst

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI (optional - runs in DEMO_MODE without it)
OPENAI_API_KEY=your-openai-api-key
# Or leave empty for demo mode:
# OPENAI_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client URL
CLIENT_URL=http://localhost:5173
```

Create `client/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Database (Optional)

Populate the database with sample users, vendors, and requests:

```bash
cd server
node utils/seed.js
```

**Demo Accounts Created:**
- **Customer**: customer@fixfirst.com / password123
- **Vendor**: vendor@fixfirst.com / password123
- **Admin**: admin@fixfirst.com / admin123

### 4. Run the Application

**Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Frontend:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

### 5. Access the App

Open `http://localhost:5173` in your browser.

## Project Structure

```
FixFirst/
├── server/
│   ├── config/         # Database connection
│   ├── models/         # Mongoose schemas
│   ├── controllers/    # Route handlers
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, upload, error handling
│   ├── services/       # OpenAI, Cloudinary
│   ├── utils/          # Seed, helpers
│   └── server.js       # Entry point
│
└── client/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── context/    # Auth, Notifications
    │   ├── pages/      # Route components
    │   │   ├── auth/
    │   │   ├── customer/
    │   │   ├── vendor/
    │   │   └── admin/
    │   ├── services/   # API calls
    │   └── App.jsx     # Main app with routing
    └── index.html
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Repair Requests
- `POST /api/repair-requests` - Create request
- `GET /api/repair-requests` - List requests
- `GET /api/repair-requests/:id` - Get details
- `PUT /api/repair-requests/:id` - Update status

### Quotations
- `POST /api/quotations` - Submit quotation
- `GET /api/quotations/request/:id` - Get for request
- `POST /api/quotations/:id/accept` - Accept quotation

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get details
- `PUT /api/bookings/:id/status` - Update status

### Vendors
- `POST /api/vendors/profile` - Create/update profile
- `GET /api/vendors` - Search vendors
- `POST /api/vendors/:id/rate` - Rate vendor

### AI Troubleshooting
- `POST /api/ai/troubleshoot` - Get AI suggestions

### Admin
- `GET /api/admin/stats` - Platform stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/status` - Ban/activate user

## Features in Detail

### AI Troubleshooting
The platform includes an AI chatbot that helps customers troubleshoot issues before submitting repair requests. It runs in **demo mode** by default (no OpenAI key needed). Add your OpenAI API key to enable real AI responses.

### Real-time Notifications
Uses Socket.io for instant notifications when:
- Vendors submit quotations
- Customers accept/reject quotes
- Booking status changes
- New repair requests match vendor profile

### Image Uploads
Cloudinary integration for:
- Device images (multiple per repair request)
- User profile avatars
- Vendor profile images

### Role-based Access
- **Customer**: Submit requests, compare quotes, book repairs
- **Vendor**: Browse requests, submit quotes, manage bookings
- **Admin**: Oversee platform, manage users, handle complaints

## Development

### Build for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

### Code Style
- ESLint configured for React
- Consistent Tailwind utility classes
- Async/await for all API calls

## Troubleshooting

**MongoDB Connection Error:**
- Check MONGO_URI in `.env`
- Ensure MongoDB is running locally, or use MongoDB Atlas

**Cloudinary Upload Failed:**
- Verify Cloudinary credentials in `.env`
- Check file size limits (max 10MB)

**Socket.io Not Connecting:**
- Ensure CLIENT_URL in server `.env` matches frontend URL
- Check CORS settings in `server.js`

**AI Troubleshoot Not Working:**
- App runs in demo mode without OpenAI key
- Add OPENAI_API_KEY for real AI responses

## License

MIT

## Support

For issues or questions, contact support@fixfirst.com
