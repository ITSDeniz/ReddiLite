const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const app = express();
const mongoURI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Check for required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("ERROR: .env data is missing");
    process.exit(1); 
}

// Database Connection
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Atlas! 🚀"))
    .catch(err => console.error("MongoDB Connection Error: ", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
