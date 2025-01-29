import { cookieOptions, USER_TOKEN } from "../constants/constants.js";
import { TryCatch } from "../middlewares/catchAsyncError.js";
import { Contact } from "../models/ContactModel.js";
import { Course } from "../models/CourseModel.js";
import { Request } from "../models/RequestModel.js";
import { Stats } from "../models/StatsModel.js";
import { User } from "../models/UserModel.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { getDataUri } from "../utils/getDataUri.js";
import { deleteFilesFromCloudinary, uploadFilesToCloudinary } from "../utils/helper.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto"

const register = TryCatch(async (req,res,next)=>{


    const{name,email,password} = req.body
    // check by using express-validator

    const file = req.file // getting blob - for avatar name as file
    if(!file){
        return next(new ErrorHandler("Please upload avatar",400))
    }

    // check if user already exist
    let user = await User.findOne({email:email})
    if(user){
        return next(new ErrorHandler("User already exist with this email.",409))
    }

    //  we want uri 
    const avatarUri = getDataUri(file)

    // upload file on cloudinary
    const result = await uploadFilesToCloudinary([avatarUri])
    const avatar = {
        publicId:result[0].publicId,
        url:result[0].url
    }

    // password will be hashed before saving in database -pre save middleware

    // create user
    user = await User.create({
        name,
        email,
        password,
        avatar
    })

    // send response with token
    sendToken(res,user,"Registered Successfully",201)
   
})

const login  = TryCatch(async (req,res,next)=>{

    const {email,password} = req.body
    // check by using express-validator


    // check if user already exist
    const user = await User.findOne({email:email}).select("+password")
    if(!user){
        return next(new ErrorHandler("Invalid email or password.",404))
    }

    // check password match
    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password.",401))
    }

    sendToken(res,user,`Welcome Back ${user.name}`,200)
})

const logout = TryCatch(async (req,res,next)=>{

    res.cookie(
        USER_TOKEN,
        null,
        {
            ...cookieOptions,
            expires:new Date(Date.now())
        }
    )

    res.status(200).json({
        success:true,
        message:"Logout Successfully"
    })

})

const getMyProfile = TryCatch(async (req,res,next)=>{

    const user = await User.findById(req.user._id)

    res.status(200).json({
        success:true,
        user
    })
})

const deleteMyProfile = TryCatch(async(req,res,next)=>{

    const user = await User.findById(req.user._id)

    // Cancel  subscriptions of this user

    // delete avatar from cloudinary
    const publicIds = []
    publicIds.push(user.avatar.publicId)

    const deleteResult = await deleteFilesFromCloudinary(publicIds)

    await User.findByIdAndDelete(user._id)

    res.status(200).
    cookie(
        USER_TOKEN,
        null,
        {
            ...cookieOptions,
            expires:new Date(Date.now())
        }
    ).json({
        success:true,
        user
    })
})

const changePassword = TryCatch(async(req,res,next)=>{

    const {oldPassword,newPassword} = req.body
    // check by using express-validator

    const user = await User.findById(req.user._id).select("+password")

    // check password match
    const isOldPasswordMatched = await user.comparePassword(oldPassword)
    if(!isOldPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect.",401))
    }

    // check old and new password is same or not
    if(oldPassword === newPassword){
        return next(new ErrorHandler("Old password and new password is same.",400))
    }

    user.password = newPassword

    await user.save()

    // sendToken(res,user,"Password Changed Successfully",200)
    res.status(200).json({
        success:true,
        message:"Password Changed Successfully"
    })
})

const updateProfile = TryCatch(async(req,res,next)=>{

    const {name,email} = req.body
    // check by using express-validator

    // find user
    const user = await User.findById(req.user._id)

    if(name)
        user.name = name
    if(email)
        user.email = email

    await user.save()

    res.status(200).json({
        success:true,
        message:"Profile Updated Successfully"
    })
})

const updateProfilePicture = TryCatch(async(req,res,next)=>{

    // find user -  user logged in then only update so no need to check
    const user = await User.findById(req.user._id)

    const file = req.file 

    if(!file)
        return next(new ErrorHandler("Please upload avatar",400))

    // first delete Previous avatar

    const publicIds = []
    publicIds.push(user.avatar.publicId)

    const deleteResult = await deleteFilesFromCloudinary(publicIds)

    //  we want uri
    const avatarUri = getDataUri(file)

    // upload file on cloudinary
    const result = await uploadFilesToCloudinary([avatarUri])
    const avatar = {
        publicId:result[0].publicId,    
        url:result[0].url
    }

    user.avatar = avatar

    await user.save()

    res.status(200).json({
        success:true,
        message:"Profile Picture Updated Successfully"
    })
})

const forgetPassword = TryCatch(async(req,res,next)=>{

    const {email} = req.body
    // check by using express-validator

    const user = await User.findOne({email:email})
    if(!user){
        return next(new ErrorHandler("User not found with this email.",404))
    }

    // get reset password token - this one will be sending to email
    const resetPasswordToken = await user.getResetPasswordToken() // random bytes token

    await user.save({validateBeforeSave:false})

    // send token via email

    const message = `Hello,\n\nYou have requested to reset your password for the CourseBuilder web app.Please use the link below to reset your password:\n\nlink : ${process.env.FRONTEND_URL}/resetpassword/${resetPasswordToken} . \n\nIf you did not request this change, please ignore this message or contact our support team for assistance.\n\nThank you,\nThe CourseBuilder Team` 

    try {
        await sendEmail(
            email,
            `CourseBundler Password Reset Request`,
            message
        )
        res.status(200).json({
            success:true,
            message:`Password Reset Link Sent To ${email} Successfully.`
        })
    } catch (error) {
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined
        await user.save({validateBeforeSave:false})
        return next(new ErrorHandler(error.message,500))
    }

})

// resetpassword/resetPasswordToken="something" - params
const resetPassword = TryCatch(async(req,res,next)=>{

    const {password} = req.body
    const resetPasswordToken = req.params.resetPasswordToken 

    // using same hashing algorithm sha256 as in getResetPasswordToken checking token valid or not

    const hashedToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex")

    // find user -  and also check if token is valid or expires (15 minutes given)

    const user = await User.findOne({
        resetPasswordToken:hashedToken,
        resetPasswordExpire:{
            $gt:Date.now()
        }
    })


    if(!user)
        return next(new ErrorHandler("Invalid or expired reset password token.",400))

    
    user.password = password
    user.resetPasswordToken=undefined
    user.resetPasswordExpire=undefined

    await user.save()
    
    res.status(200).json({
        success:true,
        message:"Password Reset Successfully"
    })
})

const addToPlaylist = TryCatch(async(req,res,next)=>{

    const {courseId} = req.body
    // check by using express-validator

    const user = await User.findById(req.user._id)

    const course = await Course.findById(courseId)

    if(!course)
        return next(new ErrorHandler("Invalid Course Id.",400))

    let alreadyAdded = false

    user.playList.forEach(item => {
        if(item.courseId.toString() === course._id.toString()){
            alreadyAdded = true
            return
        }
    })
    if(alreadyAdded)
        return next(new ErrorHandler("Course already added to playlist.",400))

    user.playList.push({
        courseId:course._id,
        poster:course.poster
    })

    await user.save()

    res.status(200).json({
        success:true,
        message:"Course Added To Playlist Successfully"
    })
})

// removeFromPlaylist?courseId=sdhjsdhsjdhsjd - query
const removeFromPlaylist = TryCatch(async(req,res,next)=>{

    const courseId = req.query.courseId
    // check by using express-validator

    const user = await User.findById(req.user._id)

    const course = await Course.findById(courseId)

    if(!course)
        return next(new ErrorHandler("Invalid Course Id.",400))

    user.playList = user.playList.filter(item => item.courseId.toString() !== course._id.toString())

    await user.save()

    res.status(200).json({
        success:true,
        message:"Course Removed From Playlist Successfully"
    })
})

//   Admin Controllers
const getAllUsers = TryCatch(async(req,res,next)=>{
    const users = await User.find({}).select("-playList")
    res.status(200).json({
        success:true,
        users
    })
})

const updateUserRole = TryCatch(async(req,res,next)=>{

    const userId = req.params.userId
    // check by using express-validator

    const user = await User.findById(userId)    

    if(!user)
        return next(new ErrorHandler("Invalid User Id.",400))

    if(user.role === "admin")
        user.role = "user"
    else
        user.role = "admin"

    await user.save()
    
    res.status(200).json({
        success:true,
        message:"User Role Updated Successfully"
    })
})

const deleteUser = TryCatch(async(req,res,next)=>{

    const userId = req.params.userId
    // check by using express-validator

    const user = await User.findById(userId)

    if(!user)
        return next(new ErrorHandler("Invalid User Id.",400))

    // Also Check some Subscription validity - TODO

    // Cancel  subscriptions of this user

    // Delete his avatar from cloudinary

    const publicIds = []
    publicIds.push(user.avatar.publicId)

    const result = await deleteFilesFromCloudinary(publicIds)

    await User.findByIdAndDelete(user._id)

    res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
    })
})

const getAllContacts = TryCatch(async(req,res,next)=>{
    const contacts = await Contact.find({})
    res.status(200).json({
        success:true,
        contacts
    })
})
const getAllRequests = TryCatch(async(req,res,next)=>{
    const requests = await Request.find({})
    res.status(200).json({
        success:true,
        requests
    })
})



// // Listener continues monitoring
User.watch().on("change",async()=>{

    const stats = await Stats.find({}).sort({
        createdAt:"desc"
    }).limit(1)

    const subscription = await User.find({
     "subscription.status":"active"
    })

    stats[0].users = await User.countDocuments()
    stats[0].subscriptions = subscription.length
    stats[0].createdAt = new Date(Date.now())

    await stats[0].save()

})




export {
    register,
    login,
    logout,
    getMyProfile,
    changePassword,
    updateProfile,
    updateProfilePicture,
    forgetPassword,
    resetPassword,
    addToPlaylist,
    removeFromPlaylist,
    getAllUsers,
    updateUserRole,
    deleteUser,
    deleteMyProfile,
    getAllContacts,
    getAllRequests
}