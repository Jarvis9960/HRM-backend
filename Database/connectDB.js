import mongoose from "mongoose";

const connectDb = () => {
  try {
    let connectionString = "mongodb+srv://ShubhamChaturvedi:9555047172@mongodbwithshubham.z3dowao.mongodb.net/HRMshubham";

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
