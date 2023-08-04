import mongoose from "mongoose";

const connectDb = () => {
  try {
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("Connection string is giving undefined");
    }

    return mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
