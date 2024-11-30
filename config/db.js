const mongoose = require('mongoose');
require('dotenv').config();

// URL
//  const MONGO_URI = process.env.MONGODB_LOCAL_URL; // For local server
const MONGO_URI = process.env.MONGODB_ATLAS_URL;

// Set up MongoDB connection
mongoose.connect(MONGO_URI);

// Get the default connection 
// Mongoose maintains a default connections object representing the MongoDB connection
const db = mongoose.connection;

// Default event listeners for database connection
db.on('connected', () => {
    console.log("Connected to MongoDB server");
});

db.on('disconnected', () => {
    console.log("Disconnected from MongoDB server");
});

db.on('error', (err) => {
    console.log("Encountered an error: " + err);
});

// Export module
module.exports = db;
