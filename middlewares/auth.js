import { USER_TOKEN } from "../constants/constants.js"
import { ErrorHandler } from "../utils/ErrorHandler.js"
import jwt from "jsonwebtoken"
import { TryCatch } from "./catchAsyncError.js"
import { User } from "../models/UserModel.js"

// check if user is logged in
const isAuthenticated = TryCatch(async (req,res,next) => {
    
    // get token from cookies
    const token = req.cookies[USER_TOKEN]

    if(!token)
        return next(new ErrorHandler("Please log in to access this resource",401))

    // verify and if token is valid - invalid then it will throw error
    const decodedData = jwt.verify(
        token,
        process.env.JWT_SECRET
    )

    const user = await User.findById(decodedData._id)
    if(!user)
        return next(new ErrorHandler("User not found",404))

    // setting user in req
    req.user = user

    next()
})

// for admin
const authorizeRoles = (...roles) =>  {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`You are (${"as " + req.user.role}) not allowed to access this resource`,403))
        }
        next()
    }
}

// for subscriber
const authorizeSubscribers = (req,res,next) => {
    
    if(req.user.subscription.status !== "active" && req.user.role !== "admin"){
        return next(new ErrorHandler("Please buy a subscription to access this resource",403))
    }
    next()
}

export {
    isAuthenticated,
    authorizeRoles,
    authorizeSubscribers
}