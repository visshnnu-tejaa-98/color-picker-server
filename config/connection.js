import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const url = await process.env.MONGO_CONNECTION_URL;
    const options = {
      connectTimeoutMS: 30000, // 30 seconds
      useUnifiedTopology: true,
      useNewUrlParser: true,
    };
    const conn = await mongoose.connect(
      "mongodb+srv://visshnnutejaa:7leaclWnf81yXXBA@cluster0.76r8ofa.mongodb.net/UI-color-picker",
      options
    );
    console.log(`Mongodb Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
