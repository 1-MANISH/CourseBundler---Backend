import express from 'express'
import dotenv from "dotenv";
import { ErrorMiddleware } from './middlewares/Error.js';
import cookieParser from 'cookie-parser';

// creating app
const app  = express()

// configuration
dotenv.config({
    path:"./config/config.env"
})

// using  middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser()) // for req.cookies

// import routes
import courseRoutes from "./routes/courseRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import otherRoutes from "./routes/otherRoutes.js"

// routes
app.use("/api/v1/course",courseRoutes)
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1",otherRoutes)


app.get("/",(req,res)=>{
    res.send(`
        <h1> Server is running.
        Click to visit frontend
        <a href=${process.env.FRONTEND_URL}>CourseBundler</a>
        </h1>`)
})

// Error middleware
app.use(ErrorMiddleware)


export default app