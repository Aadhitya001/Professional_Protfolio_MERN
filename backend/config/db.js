import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useJsonDb = false;
  } catch (error) {
    console.log(`MongoDB connection failed: ${error.message}`);
    console.log('--- FALLING BACK TO LOCAL JSON DATABASE ---');
    global.useJsonDb = true;
  }
};

export default connectDB;
