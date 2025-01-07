import express from "express"
import { contact, courseRequest, deleteContact, deleteRequest, getDashboardStats, reportRequest, sentAckMail } from "../controllers/otherControllers.js"
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js"
import { contactFormValidator, requestCourseValidator, sentAckMailValidator, validateHandler } from "../lib/validators.js"

const router = express.Router()


// contact form
router.route("/contact").post(contactFormValidator(),validateHandler,contact)
router.route("/contact/:contactId").post(isAuthenticated,authorizeRoles("admin"),sentAckMailValidator(),validateHandler,sentAckMail)
router.route("/contact/:contactId").delete(isAuthenticated,authorizeRoles("admin"),deleteContact)

// request form
router.route("/courserequest").post(requestCourseValidator(),validateHandler,courseRequest)
router.route("/courserequest/:requestId").put(isAuthenticated,authorizeRoles("admin"),reportRequest)
router.route("/courserequest/:requestId").delete(isAuthenticated,authorizeRoles("admin"),deleteRequest)

// Get Admin Dashboard Stats
router.route("/admin/stats").get(isAuthenticated,authorizeRoles("admin"),getDashboardStats)

export default router