import mongoose from "mongoose";

const connectDb = () => {
  try {
    // console.log(process.env.DATABASE_URL)
    let connectionString = "mongodb+srv://ShubhamChaturvedi:9555047172@mongodbwithshubham.z3dowao.mongodb.net/fluid3infotech";

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
