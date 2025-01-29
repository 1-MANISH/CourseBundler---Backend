import { TryCatch } from "../middlewares/catchAsyncError.js";
import { Request } from "../models/RequestModel.js";
import {Contact} from "../models/ContactModel.js"
import { sendEmail } from "../utils/sendEmail.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { Stats } from "../models/StatsModel.js";

const contact = TryCatch(async (req,res,next)=>{

    const {name,email,message} = req.body
    // check by using express-validator

    // option-1 | We are going to save it in database -  then we have to show all contact requests to admin
    await Contact.create({
        name,
        email,
        message
    })

    // option-2 | but for now mail to ourself
    // const to = process.env.MY_MAIL
    // const subject = `Contact From ${name}, to CourseBundler.`
    // const text = `I am ${name} and my email is ${email}.\n\n${message}.\n\nThanks & Regards,\n${name.toUpperCase()}`
    
    // await sendEmail(to,subject,text)

    res.status(200).json({
        success:true,
        message:`Your msg/email sent to ${process.env.MY_MAIL},CourseBundler team Successfully.`
    })
})
const sentAckMail = TryCatch(async (req,res,next)=>{

    const {message} = req.body
    // check by using express-validator

    const contactId = req.params.contactId

    const contact = await Contact.findById(contactId)

    if(!contact)
        return next(new ErrorHandler("Invalid Contact Id Or Contact Not Found.",400))

    if(contact.status === "accepted")
        return next(new ErrorHandler("This Contact Already Accepted.",400))

    contact.status = "accepted"

    await contact.save()

    const to = contact.email
    const subject = `Contact From CourseBundler`
    const text = message
    
    await sendEmail(to,subject,text)

    res.status(200).json({    
        success:true,
        message:"Contact Accepted Successfully"
    })

})
const deleteContact = TryCatch(async (req,res,next)=>{

    const contactId = req.params.contactId

    const contact = await Contact.findById(contactId)

    if(!contact)
        return next(new ErrorHandler("Invalid Contact Id Or Contact Not Found.",400))

    if(contact.status === "reported")
        return next(new ErrorHandler("Can't Delete This Contact Still Ack hasn't been sent.",400))

    await Contact.findByIdAndDelete(contactId)

    res.status(200).json({
        success:true,
        message:"Contact Deleted Successfully"
    })
})

const courseRequest = TryCatch(async (req,res,next)=>{

    const {name,email,course} = req.body
    // check by using express-validator

    // option-1 | We are going to save it in database -  then we have to show all course requests to admin
    await Request.create({
        name,
        email,
        course
    })

    // option-2 | but for now mail to ourself
    // const to = process.env.MY_MAIL
    // const subject = `Course Request From ${name}, to CourseBundler.`
    // const text = `I am ${name} and my email is ${email}.\n\n${course}.\n\nThanks & Regards,\n${name.toUpperCase()}`
    // await sendEmail(to,subject,text)

    res.status(200).json({
        success:true,
        message:`Your msg/email sent to ${process.env.MY_MAIL},CourseBundler team Successfully.`
    })
})
const reportRequest = TryCatch(async (req,res,next)=>{

    const requestId = req.params.requestId

    const request = await Request.findById(requestId)

    if(!request)
        return next(new ErrorHandler("Invalid Request Id Or Request Not Found.",400))

    if(request.status === "reported")
        return next(new ErrorHandler("This Request Already Reported.",400))

    request.status = "reported"

    await request.save()

    res.status(200).json({    
        success:true,
        message:"Request Reported Successfully"
    })
})
const deleteRequest = TryCatch(async (req,res,next)=>{

    const requestId = req.params.requestId

    const request = await Request.findById(requestId)

    if(!request)
        return next(new ErrorHandler("Invalid Request Id Or Request Not Found.",400))

    if(request.status === "pending")
        return next(new ErrorHandler("This Request Is Still Pending.",400))

    await Request.findByIdAndDelete(requestId)

    res.status(200).json({
        success:true,
        message:"Request Deleted Successfully"
    })
})
    
const getDashboardStats = TryCatch(async (req,res,next)=>{

    // nodecron will create a new stats each month

    //  last 12 month stats
    const stats = await Stats.find({}).sort({
        createdAt:"desc" // descending  - recent month at top
    }).limit(12)

    const statsData = []

    for(let i = 0 ; i < stats.length ; i++){
        statsData.push(stats[i])
    }

    const requiredSize  = 12 - stats.length
    // initially we have to create 12 stats otherwise it will not work
    for(let i = 0 ; i < requiredSize ; i++){
        statsData.unshift({
            users:0,
            subscriptions:0,
            views:0
        })
    }

    // last12th month , last11th month .....last month(pichla)

    // last month stats
    const usersCount = statsData[11].users
    const subscriptionsCount = statsData[11].subscriptions
    const viewsCount = statsData[11].views

    let usersProfit = true ,  
    viewsProfit = true , 
    subscriptionsProfit = true

    let userPercent = 0 , 
    viewsPercent = 0 , 
    subscriptionsPercent = 0

    //  last month as base month
    if(statsData[10].users ===0)userPercent = usersCount*100
    if(statsData[10].views ===0)viewsPercent = viewsCount*100
    if(statsData[10].subscriptions ===0)subscriptionsPercent = subscriptionsCount*100
    else{
        userPercent= (usersCount-statsData[10].users)/statsData[10].users*100,
        viewsPercent =(viewsCount-statsData[10].views)/statsData[10].views*100 ,
        subscriptionsPercent= (subscriptionsCount-statsData[10].subscriptions)/statsData[10].subscriptions*100

        if(userPercent < 0)usersProfit = false
        if(viewsPercent < 0)viewsProfit = false
        if(subscriptionsPercent < 0)subscriptionsProfit = false
    }
    
    res.status(200).json({
        success:true,
        stats:statsData,
        usersCount,
        subscriptionsCount,
        viewsCount,
        userPercent,
        viewsPercent,
        subscriptionsPercent,
        usersProfit,
        viewsProfit,
        subscriptionsProfit
    })
})

export {
    contact,
    sentAckMail,
    deleteContact,
    courseRequest,
    getDashboardStats,
    reportRequest,
    deleteRequest
}