import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Ensure .env variables are loaded

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); // Using MONGODB_URI
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }
}
export default connectDB; 