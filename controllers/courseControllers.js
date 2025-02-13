import { TryCatch } from "../middlewares/catchAsyncError.js"
import {Course} from "../models/CourseModel.js"
import { User } from "../models/UserModel.js"
import { ErrorHandler } from "../utils/errorHandler.js"
import { getDataUri } from "../utils/getDataUri.js"
import { deleteFilesFromCloudinary, uploadFilesToCloudinary } from "../utils/helper.js"
import { Stats } from "../models/StatsModel.js"

// api/v1/course/all
const getAllCourses = TryCatch(async (req,res,next)=>{

    const keyword = req.query.keyword || ""
    const category = req.query.category || ""

    const courses = await Course.find({
        title:{
            $regex:keyword,
            $options:"i"
        },
        category:{
            $regex:category,
            $options:"i"
        }
    })
    .select("-lectures")
    res.status(200).json({
        success:true,
        courses
    })
})

// api/v1/course/courser_Id
const getCourseLectures = TryCatch(async (req,res,next)=>{

    const courseId = req.params.courseId

    const course = await Course.findById(courseId)

    if(!course)
        return next(new ErrorHandler("Invalid Course Id Or Course Not Found.",400))

    // if someone accessing this course lectures so increase views

    course.views += 1
    await course.save()

    res.status(200).json({
        success:true,
        lectures:course.lectures
    })

})

// api/v1/course/create
const createCourse = TryCatch(async (req,res,next)=>{
    
    const {title,description,category,createdBy} = req.body
    // check by using express-validator

    const file = req.file // getting blob of poster - as name file only - as we user multer so we can get file

    if(!file){
        return next(new ErrorHandler("Please upload poster",400))
    }

    //  we want uri 
    const posterUri = getDataUri(file)

    // upload on cloudinary
    const result = await uploadFilesToCloudinary([posterUri])
    const poster = {
        publicId:result[0].publicId,
        url:result[0].url
    }

    // now create course

    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster
    })

    res.status(201).json({
        success:true,
        message:"Course created successfully. You can add lectures now."
    })


})

// api/v1/course/course_Id -params
const addLecture = TryCatch(async (req,res,next)=>{

    const{title,description} = req.body
    // check by using express-validator

    const courseId = req.params.courseId
    const course = await Course.findById(courseId)

    // course is valid or not
    if(!course)
        return next(new ErrorHandler("Invalid Course Id Or Course Not Found.",400))


    // getting files-for video only one we want
    const videoFile = req.files.video && req.files.video[0] // as video taking  - name in frontend should be file - avatar/lecture video file
    const notesFiles = req.files.notes || [] // as notes taking - name as files in frontend 

    if(!videoFile){
        return next(new ErrorHandler("Please upload a video for lecture.",400))
    }

    if(notesFiles.length > 5){
        return next(new ErrorHandler("You can upload at most 5 notes pdf's .",400))
    }

    // getting file content to upload modified it into base file

    const videoUri = getDataUri(videoFile)
    const notesUris = []
    notesFiles?.forEach((note)=>{
        notesUris.push(getDataUri(note))
    })

    // upload file on cloudinary (video + notes)

    const result1 = await uploadFilesToCloudinary([videoUri])
    const result2 = await uploadFilesToCloudinary(notesUris)

    const video = {
        publicId:result1[0].publicId,
        url:result1[0].url
    }

    const notes = result2.map((item,index)=>{
        return {
            file:item,
            title:notesFiles[index].originalname
        }
    })


    course.lectures.push({
        title,
        description,
        video,
        notes
    })

    // increase numberOfVideo
    course.numberOfVideo  =  course.lectures.length

    // save course
    await course.save()

    res.status(201).json({
        success:true,
        message:"Lecture added successfully."
    })
})

// api/v1/course/course_Id -params
const deleteCourse = TryCatch(async (req,res,next)=>{

    const courseId = req.params.courseId

    const course = await Course.findById(courseId)
    if(!course) 
        return next(new ErrorHandler("Invalid Course Id Or Course Not Found.",400))

    // Get All PublicId and destroy it from cloudinary
    // poster + lectures(video + notes)

    const publicIds = []
    publicIds.push(course.poster.publicId)
    course.lectures.forEach((lecture)=>{
        publicIds.push(lecture.video.publicId)
        lecture.notes.forEach((note)=>{
            publicIds.push(note.file.publicId)
        })
    })

    // delete all resource upload from cloudinary
    const result = await deleteFilesFromCloudinary(publicIds)

    // also delete course to all user playList who added this course

    // Validity of subscribed users - TODO

    const allUsers = await User.find({})
    allUsers.forEach(async(user)=>{
        user.playList = user.playList.filter((item)=>{
            return item.courseId.toString() !== course._id.toString()
        })
        await user.save()
    })

    // delete course
    await Course.findByIdAndDelete(course._id)

    res.status(200).json({
        success:true,
        message:"Course Deleted Successfully."
    })
})

// api/v1/course/courseId=course_Id&lectureId=lecture_Id - query
const deleteLecture = TryCatch(async (req,res,next)=>{

    const courseId = req.params.courseId
    const lectureId = req.query.lectureId

    const course = await Course.findById(courseId)

    if(!course) 
        return next(new ErrorHandler("Invalid Course Id Or Course Not Found.",400))

    const lecture = course.lectures.find((item)=>{
        return item._id.toString() === lectureId.toString()
    })


    if(!lecture) 
        return next(new ErrorHandler("Invalid Lecture Id Or Lecture Not Found.",400))

    // Get All PublicId and destroy it from cloudinary

    const publicIds = []
    publicIds.push(lecture.video.publicId)
    lecture.notes.forEach((note)=>{
        publicIds.push(note.file.publicId)
    })


    const result = await deleteFilesFromCloudinary(publicIds)

    // delete lecture
    course.lectures = course.lectures.filter((item)=>{
        return item._id.toString() !== lecture._id.toString()
    })

    // decrease numberOfVideo
    course.numberOfVideo = course.lectures.length

    // save
    await course.save()

    res.status(200).json({
        success:true,
        message:"Lecture Deleted Successfully."
    })

})


// Watcher

Course.watch().on("change",async (data)=>{

    const stats = await Stats.find({}).sort({
        createdAt:"desc"
    }).limit(1)

    const courses = await Course.find({})
    let totalViews = 0

    for(let i = 0 ; i < courses.length ; i++){
        totalViews += courses[i].views
    }

    stats[0].views = totalViews
    stats[0].createdAt = new Date(Date.now())

    await stats[0].save()

})


export {
    getAllCourses,
    getCourseLectures,
    createCourse,
    deleteCourse,
    addLecture,
    deleteLecture
}