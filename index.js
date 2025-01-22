require("dotenv").config(); // Load environment variables
const app = require("./src/app"); // Import the main app
const { connectDB } = require("./src/config/db.config"); // Import database connection

const PORT = process.env.PORT || 5000; // Set the server port

// Connect to the database
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
