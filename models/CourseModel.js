import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please enter course title"],
        minLength:[4,"Title must be at least 4 characters long"],
        maxLength:[80,"Title must be less than 80 characters long"]
    },
    description:{
        type:String,
        required:[true,"Please enter course description"],
        minLength:[20,"Description must be at least 20 characters long"],
        maxLength:[500,"Description must be less than 500 characters long"]
    },
    lectures:[
        {
            title:{
                type:String,
                required:[true,"Please enter lecture title"],
                minLength:[4,"Lecture title must be at least 4 characters long"],
                maxLength:[80,"Lecture Title must be less than 80 characters"]
            },
            description:{
                type:String,
                required:[true,"Please enter lecture description"],
                minLength:[20,"Lecture Description must be at least 20 characters long"],
                minLength:[50,"Lecture Description must be less than 500 characters"]
            },
            video:{
                publicId:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                }
            },
            notes:[
                {
                    title:{
                        type:String,
                        required:[true,"Please enter notes title"],
                        minLength:[4,"Notes title must be at least 4 characters long"],
                    },
                    file:{
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
            ]
        }
    ],
    poster:{
        publicId:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    views:{
        type:Number,
        default:0
    },
    numberOfVideo:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:[true,"Please enter course category"],
    },
    createdBy:{
        // type:mongoose.Schema.Types.ObjectId, // we can normally take name
        // ref:"User",
        type:String,
        required:[true,"Please enter course creator name"]
    }
},{
    timestamps:true
})

export const Course = mongoose.models.Course || mongoose.model("Course",courseSchema)