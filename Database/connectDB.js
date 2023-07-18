import mongoose from "mongoose";

const connectDb = () => {
  try {
    // console.log(process.env.DATABASE_URL)
    let connectionString = "mongodb+srv://VanshitaGupta:Vanshita12@cluster0.qhppq1e.mongodb.net/HRMBackend";

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
