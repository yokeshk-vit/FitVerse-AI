
const mongoose = require("mongoose");

/*
========================================
FITVERSE AI — MONGODB CONNECTION
========================================
*/

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is missing from the .env file"
      );
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoURI, {
  dbName: "fitverse_ai",
  serverSelectionTimeoutMS: 10000
});

    console.log("");
    console.log("=================================");
    console.log("     MONGODB CONNECTION READY    ");
    console.log("=================================");
    console.log("MongoDB Atlas connected!");
    console.log(
      `Database: ${mongoose.connection.name}`
    );
    console.log("=================================");
    console.log("");

    return mongoose.connection;

  } catch (error) {
    console.error("");
    console.error("MongoDB Connection Error");

    // Print only a recognized error category.
    // Never print the connection string or password.
    const message = String(error.message || "");

    if (
      error.name === "MongoServerSelectionError"
    ) {
      console.error(
        "Type: Server selection / network error"
      );
      console.error(
        "Check Atlas Network Access, internet connection, and cluster hostname."
      );

    } else if (
      error.code === 18 ||
      /authentication failed|bad auth/i.test(message)
    ) {
      console.error(
        "Type: Authentication failed"
      );
      console.error(
        "Check your Atlas database username and password."
      );

    } else if (
      /querySrv|ENOTFOUND|EAI_AGAIN/i.test(message)
    ) {
      console.error(
        "Type: DNS / hostname error"
      );
      console.error(
        "Check your cluster hostname and DNS connection."
      );

    } else if (
      /invalid scheme|invalid connection string|URI malformed/i.test(message)
    ) {
      console.error(
        "Type: Invalid MongoDB connection string"
      );
      console.error(
        "Check the format of MONGODB_URI in .env."
      );

    } else if (!process.env.MONGODB_URI) {
      console.error(
        "Type: Missing environment variable"
      );

    } else {
      console.error(
        `Type: ${error.name || "Unknown error"}`
      );
      console.error(
        "Check MongoDB Atlas connection configuration."
      );
    }

    throw new Error(
      "MongoDB Atlas connection failed"
    );
  }
}

module.exports = connectDB;
