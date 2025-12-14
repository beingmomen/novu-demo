require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const usersRoutes = require('./routes/users');
const vacationRequestsRoutes = require('./routes/vacationRequests');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/vacation-requests', vacationRequestsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Novu Demo API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
