import express from "express"
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from "../controllers/courseControllers.js"
import { addLectureValidator, createCourseValidator, deleteLectureValidator, validateHandler } from "../lib/validators.js"
import { authorizeRoles, authorizeSubscribers, isAuthenticated } from "../middlewares/auth.js"
import { multipleUpload, singleUpload } from "../middlewares/multer.js"


const router = express.Router()

// Get all courses without lectures - to be used for home page
router.route("/all").get(getAllCourses)

// Create new course --- ADMIN
router.route("/create").post(isAuthenticated,authorizeRoles("admin"),singleUpload,createCourseValidator(),validateHandler,createCourse)

// Get Course Lectures --- SUBSCRIBED USERS
router.route("/:courseId").get(isAuthenticated,authorizeSubscribers,getCourseLectures)

// Add Lecture --- ADMIN - max video size is 100mb
router.route("/:courseId").post(isAuthenticated,authorizeRoles("admin"),multipleUpload,addLectureValidator(),validateHandler,addLecture)

// Delete Course --- ADMIN
router.route("/:courseId").delete(isAuthenticated,authorizeRoles("admin"),deleteCourse)

// Delete Lecture of a course --- ADMIN
router.route("/lecture").delete(isAuthenticated,authorizeRoles("admin"),deleteLectureValidator(),validateHandler,deleteLecture)

// Get Course Details --- SUBSCRIBED USERS


export default router
