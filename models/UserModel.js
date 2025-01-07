import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto"


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"Password must be at least 8 characters long"],
        select:false
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    subscription:{
        id:{
            type:String,   
        },
        status:{
            type:String,  
        }
    },
    avatar:{
        publicId:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    playList:[
        {
            courseId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course",
                required:true
            },
            poster:{
                publicId:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                }
            }
        }
    ],
    resetPasswordToken:String,
    resetPasswordExpire:String
},{
    timestamps:true
}
)


// user function

// pre save method to hash password
userSchema.pre("save",async function (next) {

    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password,10)
})

// method to get jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign(
        {_id:this._id},
        process.env.JWT_SECRET,
        {
            expiresIn:"15d"
        }
    )
}

// method to compare password - hash one
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password,this.password)
}

// get reset password token
userSchema.methods.getResetPasswordToken = async function () {
    // generate token
    const resetToken  = crypto.randomBytes(20).toString("hex")

    // hash and set to resetPasswordToken
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    this.resetPasswordToken = hashedToken
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15 minutes
    
    return resetToken
}


export const User = mongoose.models.User || mongoose.model("User",userSchema)