const express = require("express");
const routes = require("./routes/index.routes"); // Import the main routes file
const cookieParser = require("cookie-parser");
const session = require('express-session');
const cors = require("cors");
const passport = require('passport');
const path = require('path');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',  // your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
};

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cookieParser());
app.use(cors(corsOptions));

// not working now 
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        sameSite: 'none', // Adjust for cross-origin navigation (important for OAuth flows)
    },
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes

// Serve static files from the 'profile_pics' directory
app.use('/profile_pics', express.static(path.join(__dirname, 'public', 'profile_pics')));

app.use("/api/v1", routes); // Mount routes at /api/v1

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
