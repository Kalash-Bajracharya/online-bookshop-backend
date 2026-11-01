import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log("db connected successfully ........");
  } catch (error) {
    console.log("db connection failed", error);
  }
};