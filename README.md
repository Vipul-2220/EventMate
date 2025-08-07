# EventMate - Event Management Platform

A full-stack event management application with role-based authentication, built with React, Node.js, Express, and MongoDB.

## Features

### Authentication & Authorization
- ✅ User registration and login with password hashing
- ✅ JWT-based authentication
- ✅ Role-based access control (User vs Admin)
- ✅ Protected routes and middleware
- ✅ Password strength validation

### Event Management
- ✅ Create, read, update, delete events (Admin only)
- ✅ View events list (All users)
- ✅ Event registration/unregistration
- ✅ Event filtering and search
- ✅ Featured events

### User Management
- ✅ User profiles
- ✅ Event registration tracking
- ✅ Dashboard for users and admins

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- React 18
- Material-UI (MUI)
- React Router for navigation
- Axios for API communication
- Context API for state management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/eventmate
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Setup Database:**
   ```bash
   npm run setup
   ```
   This will create:
   - Admin user: `admin@eventmate.com` / `admin123`
   - Sample user: `user@eventmate.com` / `user123`
   - Sample events for testing

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   App will run on `http://localhost:3000`

## Testing the Authentication

### Test Users
- **Admin User:**
  - Email: `admin@eventmate.com`
  - Password: `admin123`
  - Role: Admin (can create events)

- **Regular User:**
  - Email: `user@eventmate.com`
  - Password: `user123`
  - Role: User (can only view events)

### Testing Steps

1. **Access the application:**
   - Open `http://localhost:3000`
   - You should see the landing page with navigation

2. **Test Registration:**
   - Click "Sign Up" in the navbar
   - Fill out the registration form
   - Verify password strength requirements
   - Submit and check if user is created

3. **Test Login:**
   - Click "Login" in the navbar
   - Use the test credentials above
   - Verify successful authentication

4. **Test Role-Based Access:**
   - **As Admin:** Should see "Create Event" button and access to admin features
   - **As User:** Should only see event listings and basic features

5. **Test Protected Routes:**
   - Try accessing `/create-event` as a regular user (should redirect)
   - Try accessing `/dashboard` without authentication (should redirect to login)

### Test Authentication Page
Visit `http://localhost:3000/test-auth` for a quick authentication test interface.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get single event (public)
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin/organizer only)
- `DELETE /api/events/:id` - Delete event (admin/organizer only)
- `POST /api/events/:id/register` - Register for event (authenticated users)
- `DELETE /api/events/:id/register` - Unregister from event (authenticated users)

## Role-Based Features

### Admin Users
- ✅ Create new events
- ✅ Edit any event
- ✅ Delete any event
- ✅ View all events
- ✅ Access admin dashboard

### Regular Users
- ✅ View events list
- ✅ Register/unregister for events
- ✅ View event details
- ✅ Access user dashboard
- ❌ Cannot create/edit/delete events

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Role-based middleware
- Input validation
- CORS configuration

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Authentication Issues:**
   - Clear browser localStorage
   - Check JWT_SECRET in .env
   - Verify API endpoints are accessible

3. **CORS Errors:**
   - Ensure CORS_ORIGIN is set correctly
   - Check if frontend and backend ports match

4. **Port Conflicts:**
   - Change PORT in .env if 5000 is occupied
   - Update proxy in frontend package.json if needed

## Development

### Adding New Features
1. Create API endpoints in `backend/routes/`
2. Add middleware for authentication/authorization
3. Create React components in `frontend/src/`
4. Update routing in `App.js`
5. Test with different user roles

### Database Schema
- **Users:** name, email, password (hashed), role, events, registeredEvents
- **Events:** title, description, date, location, organizer, capacity, etc.

## License

This project is for educational purposes. Feel free to use and modify as needed.
