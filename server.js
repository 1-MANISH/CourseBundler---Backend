import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary"
import RazorPay from "razorpay"
import nodeCron from "node-cron"
import { Stats } from "./models/StatsModel.js";


// some env and other variables
const PORT = process.env.PORT || 6000
const MONGO_DB_URI = process.env.MONGO_DB_URI

// configure cloudinary
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

// creating instance of razorpay
export const instance = new RazorPay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_API_SECRET
})

// cron job -  1st of every month
nodeCron.schedule("0 0 0 1 * *",async ()=>{
    try {
        await Stats.create({})
    } catch (error) {
       console.log(error); 
    }
})


// database connection
connectDB(MONGO_DB_URI)


// starting server
app.listen(PORT, () => {
    console.log(`Server is running on port 👊 : ${PORT}`);
})