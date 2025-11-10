import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database connected successfully");
        });

        mongoose.connection.on('error', (err) => {
            console.error("Mongoose connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("Mongoose disconnected");
        });

        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority'
        });

    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;