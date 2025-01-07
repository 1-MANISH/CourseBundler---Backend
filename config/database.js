import mongoose from "mongoose";

export const connectDB = async (MONGO_DB_URI) => {
    try {
        const connectionResult = await mongoose.connect(MONGO_DB_URI,{dbName:"CourseBundler"});
        console.log(`MongoDB Connected 👍 : ${connectionResult.connection.host}`);

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}