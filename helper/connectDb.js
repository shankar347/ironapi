import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true, // explicitly enable TLS
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};


// const connectDB = async () => {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/ironapp');
//     console.log("✅ MongoDB connected successfully");
//   } catch (err) {
//     console.error("❌ MongoDB connection error:", err);
//   }
// };

export default connectDB