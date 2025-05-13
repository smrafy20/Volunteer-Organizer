// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import the new DB connection function
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
// Removed: import expenseRoutes from './routes/expense.js'; // Remove this import

dotenv.config();
const app = express();

// Middleware
// Consolidated CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, // Use environment variable
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json()); // For parsing application/json

// Connect to Database
connectDB(); // Call the function to connect to MongoDB


// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes); // projectRoutes now handles nested expense routes too
// Removed: app.use('/api/projects', expenseRoutes); // Remove this line

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});