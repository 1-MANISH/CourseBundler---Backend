import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from "../controllers/paymentControllers.js"

const router = express.Router()

// buy subscription
router.route("/subscribe").get(isAuthenticated,buySubscription)

// payment verification
router.route("/paymentverification").post(isAuthenticated,paymentVerification)

// get razorpay key
router.route("/razorpaykey").get(getRazorPayKey)

// Cancel subscription
router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscription)

export default router