import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending","reported"]
    }
},{
    timestamps:true
})

export const Request = mongoose.models.Request || mongoose.model("Request",requestSchema)
