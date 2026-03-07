# FitLedger - Gym Management SaaS

A modern, full-stack gym management system built with the MERN stack. FitLedger helps gym owners manage members, track payments, and monitor business growth with beautiful analytics.

## 🏋️ Features

### Core Features
- **Multi-tenant Architecture**: Each gym has isolated data using gymId
- **Member Management**: Add, edit, delete members with automatic expiry tracking
- **Payment Tracking**: Monitor revenue with multiple payment methods
- **Analytics Dashboard**: Beautiful charts showing member growth and revenue trends
- **Modern UI**: Responsive design built with TailwindCSS

### Authentication
- Gym owner registration with gym creation
- JWT-based authentication
- Secure data isolation per gym

### Dashboard
- Real-time statistics (Total Members, Active Members, Expiring Soon, Revenue)
- Member growth charts
- Revenue trend analysis
- Recent members table

### Member Management
- Complete member profiles
- Automatic expiry date calculation
- Status tracking (Active/Expired)
- Search and filter functionality
- Pagination for large datasets

### Payment Management
- Multiple payment types (Cash, UPI, Card)
- Revenue analytics by payment type
- Payment history tracking
- Revenue summary cards

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure

```
fitledger/
├── server/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   └── package.json
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitledger
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fitledger
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the application**
   
   For development (both frontend and backend):
   ```bash
   # From root directory
   npm run dev
   ```
   
   Or start individually:
   ```bash
   # Backend (from server directory)
   npm run dev
   
   # Frontend (from client directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📊 Database Schema

### Collections

#### Gyms
```javascript
{
  gymName: String,
  ownerName: String,
  email: String,
  phone: String,
  address: String,
  createdAt: Date
}
```

#### Users
```javascript
{
  gymId: ObjectId (ref: 'Gym'),
  name: String,
  email: String,
  password: String (hashed),
  role: String, // 'owner' | 'staff'
  createdAt: Date
}
```

#### Members
```javascript
{
  gymId: ObjectId (ref: 'Gym'),
  name: String,
  phone: String,
  email: String,
  joiningDate: Date,
  planDuration: Number, // in months
  expiryDate: Date,
  status: String, // 'active' | 'expired'
  createdAt: Date
}
```

#### Payments
```javascript
{
  gymId: ObjectId (ref: 'Gym'),
  memberId: ObjectId (ref: 'Member'),
  amount: Number,
  paymentType: String, // 'cash' | 'upi' | 'card'
  paymentDate: Date,
  description: String,
  createdAt: Date
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new gym
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Members
- `GET /api/members` - Get all members (with pagination, search, filters)
- `POST /api/members` - Add new member
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Payments
- `GET /api/payments` - Get all payments (with pagination, search, filters)
- `POST /api/payments` - Add new payment
- `GET /api/payments/revenue` - Get revenue summary
- `GET /api/payments/:id` - Get payment by ID

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/member-growth` - Get member growth data
- `GET /api/dashboard/revenue` - Get revenue chart data
- `GET /api/dashboard/recent-members` - Get recent members

## 🎨 UI Features

### Design System
- Modern, clean interface with TailwindCSS
- Responsive design for all screen sizes
- Consistent color scheme and spacing
- Smooth animations and transitions

### Components
- Reusable UI components (buttons, inputs, cards)
- Modal dialogs for forms
- Data tables with pagination
- Interactive charts with Recharts
- Sidebar navigation with user profile

### Pages
- **Landing Page**: Marketing page with hero, features, FAQ
- **Authentication**: Login and registration forms
- **Dashboard**: Analytics and overview
- **Members**: Member management with CRUD operations
- **Payments**: Payment tracking and revenue analytics

## 🔧 Development

### Scripts
```bash
# Development
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend for production
npm start           # Start production server
```

### Code Style
- ES6+ JavaScript features
- Functional React components with hooks
- RESTful API design
- Consistent error handling
- Input validation and sanitization

## 🚀 Deployment

### Environment Variables
Make sure to set these environment variables in production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
```

### Build Process
```bash
# Build frontend
cd client
npm run build

# The build output will be in client/dist
# You can serve this with any static file server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## 🎯 Future Enhancements

- [ ] Email notifications for expiring memberships
- [ ] SMS integration for member alerts
- [ ] Advanced reporting and export features
- [ ] Mobile app (React Native)
- [ ] Integration with payment gateways
- [ ] Class scheduling system
- [ ] Trainer management
- [ ] Inventory management
- [ ] Multi-gym support for single owner
- [ ] Subscription plans and billing
