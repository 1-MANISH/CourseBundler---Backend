import { TryCatch } from "../middlewares/catchAsyncError.js";
import { Payment } from "../models/PaymentModal.js";
import { User } from "../models/UserModel.js";
import { instance } from "../server.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import crypto from "crypto"

const buySubscription = TryCatch(async (req,res,next) =>{

    const user = await User.findById(req.user._id)

    if(user.role === "admin")
        return next(new ErrorHandler("Admin can't buy subscription",400))

    const plan_id = process.env.PLAN_ID || "plan_PZQrzPfP34D7tD"

    const subscription = await instance.subscriptions.create({
        plan_id:plan_id,
        customer_notify:1,  
        total_count:12
    })

    user.subscription.id = subscription.id
    user.subscription.status = subscription.status

    await user.save()

    res.status(201).json({
        success:true,
        message:"Subscription Activated Successfully",
        subscriptionId:subscription.id // later we just send id
    })
})

const paymentVerification = TryCatch(async (req,res,next)=>{

    const {razorpay_signature,razorpay_payment_id,razorpay_subscription_id} = req.body

    const user = await User.findById(req.user._id)

    const subscription_id  = user.subscription.id

    const generated_signature = crypto.createHmac(
        'sha256',process.env.RAZORPAY_API_SECRET
    ).update(
        razorpay_payment_id + "|" + subscription_id,
        'UTF-8'
    ).digest('hex')

    const isAuthentic =  razorpay_signature === generated_signature
    
    if(!isAuthentic)
        return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`)

    // database comes here
    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    })

    user.subscription.status = "active"

    await user.save()

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
})

const getRazorPayKey = TryCatch(async (req,res,next)=>{
    res.status(200).json({
        success:true,
        key:process.env.RAZORPAY_API_KEY
    })
})

const cancelSubscription = TryCatch(async (req,res,next)=>{

    const user = await User.findById(req.user._id)

    const subscriptionId = user.subscription.id
    if(!subscriptionId)
        return next(new ErrorHandler("You are not subscribed to any plan",400))

    // suppose
    let refund = false

    await instance.subscriptions.cancel(subscriptionId)

    const payment = await Payment.findOne({razorpay_subscription_id:subscriptionId})

    const gap  = Date.now() - payment.createdAt

    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000 // ms

    if(refundTime > gap && !refund){
        await instance.payments.refund(payment.razorpay_payment_id)
        refund = true
    }

    await Payment.findByIdAndDelete(payment._id)

    user.subscription.id = undefined
    user.subscription.status = undefined

    await user.save()

    res.status(200).json({
        success:true,
        message:refund ? "Subscription Cancelled Successfully. You will get full refund within 7 days" : "Subscription Cancelled Successfully, Now no refund is applicable for cancellation within 7 days"
    })
})

export {
    buySubscription,
    paymentVerification,
    getRazorPayKey,
    cancelSubscription
}