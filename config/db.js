const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error(
        "❌ FATAL ERROR: MONGO_URI environment variable is not set!",
      );
      console.error("Please add MONGO_URI to your environment variables.");
      console.error(
        "Example: mongodb+srv://username:password@cluster.mongodb.net/dbname",
      );
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    console.error(
      "Make sure your MONGO_URI is correct and MongoDB is accessible.",
    );
    process.exit(1);
  }
};

module.exports = connectDB;
