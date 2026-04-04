import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${env.MONGO_URI}/${env.DB_NAME}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;