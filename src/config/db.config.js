const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = async () => {
    // Validate environment variable
    if (!process.env.URL_DB) {
        console.error("Error: Database connection URL (URL_DB) is not defined in environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.URL_DB);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Exit process with failure
    }
};