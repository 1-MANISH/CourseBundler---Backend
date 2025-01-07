import express from "express"
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllContacts, getAllRequests, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateProfilePicture, updateUserRole } from "../controllers/userControllers.js"
import { addToPlaylistValidator, changePasswordValidator, forgetPasswordValidator, loginValidator, registerValidator, removeFromPlaylistValidator, resetPasswordValidator, updateProfileValidator, validateHandler } from "../lib/validators.js"
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js"
import { singleUpload } from "../middlewares/multer.js"


const router = express.Router()

// to register a new user
router.route("/register").post(singleUpload,registerValidator(),validateHandler,register)

// to login a user
router.route("/login").post(loginValidator(),validateHandler,login)

// logout
router.route("/logout").get(logout)

// getMyProfile
router.route('/me').get(isAuthenticated,getMyProfile)

// delete my profile
router.route('/me').delete(isAuthenticated,deleteMyProfile)

// change password
router.route('/changepassword').put(isAuthenticated,changePasswordValidator(),validateHandler,changePassword)

// update profile
router.route('/updateprofile').put(isAuthenticated,updateProfileValidator(),validateHandler,updateProfile)

// update profile Picture
router.route('/updateprofilepicture').put(isAuthenticated,singleUpload,updateProfilePicture)

// forget password -  we get token to reset password
router.route('/forgetpassword').post(forgetPasswordValidator(),validateHandler,forgetPassword)

// reset password - using token we can reset password
router.route('/resetpassword/:resetPasswordToken').put(resetPasswordValidator(),validateHandler,resetPassword)

// add course to playlist
router.route("/addToPlaylist").post(isAuthenticated,addToPlaylistValidator(),validateHandler,addToPlaylist)

// remove course  from playlist
router.route("/removeFromPlaylist").delete(isAuthenticated,removeFromPlaylistValidator(),validateHandler,removeFromPlaylist)

// get all user playlist - if needed


// admin routes

// Get All users
router.route("/admin/users").get(isAuthenticated,authorizeRoles("admin"),getAllUsers)

// Change user role
router.route("/admin/user/:userId").put(isAuthenticated,authorizeRoles("admin"),updateUserRole)

// Delete user
router.route("/admin/user/:userId").delete(isAuthenticated,authorizeRoles("admin"),deleteUser)

// Get all Contacts
router.route("/admin/contacts").get(isAuthenticated,authorizeRoles("admin"),getAllContacts)

// Get All Requests
router.route("/admin/requests").get(isAuthenticated,authorizeRoles("admin"),getAllRequests)


export default router