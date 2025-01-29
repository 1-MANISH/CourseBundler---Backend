import { body, query, validationResult } from "express-validator"
import { ErrorHandler } from "../utils/errorHandler.js"


const validateHandler = (req,res,next) => {
    const errors = validationResult(req)
    const errorMessages = errors.array().map(error => error.msg).join(", ")
    if(!errors.isEmpty()){
        next(new ErrorHandler(errorMessages,400))
    }
    next()
}

// course related validators
const createCourseValidator = () => {
    return [
        body("title").notEmpty().withMessage("Course Title is required"),
        body("description").notEmpty().withMessage("Course Description is required"),
        body("category").notEmpty().withMessage("Course Category is required"),
        body("createdBy").notEmpty().withMessage("Course CreatedBy is required")
    ]
}

const addLectureValidator = () => {
    return [
        body("title").notEmpty().withMessage("Lecture Title is required"),
        body("description").notEmpty().withMessage("Lecture Description is required")
    ]
}

const deleteLectureValidator = () => {
    return [
        query("courseId").notEmpty().withMessage("Course Id is required").isMongoId().withMessage("Invalid Course Id"),
        query("lectureId").notEmpty().withMessage("Lecture Id is required").isMongoId().withMessage("Invalid Lecture Id")
    ]
}

// user related validators

const registerValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid Email is required"),
        body("password").isLength({min:8}).withMessage("Password must be at least 8 characters long")
    ]
}

const loginValidator = () => {
    return [
        body("email").isEmail().withMessage("Valid Email is required"),
        body("password").isLength({min:8}).withMessage("Password must be at least 8 characters long")
    ]
}

const changePasswordValidator = () => {
    return [
        body("oldPassword").isLength({min:8}).withMessage("Password(Old) must be at least 8 characters long"),
        body("newPassword").isLength({min:8}).withMessage("Password(New) must be at least 8 characters long")
    ]
}

const updateProfileValidator = () => {
    return [
        body("name").optional().isLength({min:3}).withMessage("Name must be at least 3 characters long"),
        body("email").optional().isEmail().withMessage("Valid Email is required")
    ]
}

const forgetPasswordValidator = () => {
    return [
        body("email").isEmail().withMessage("Valid Email is required")
    ]
}

const resetPasswordValidator = () => {
    return [
        body("password").isLength({min:8}).withMessage("Password(New) must be at least 8 characters long")
    ]
}

const addToPlaylistValidator = () => {
    return [
        body("courseId").notEmpty().withMessage("Course Id is required").isMongoId().withMessage("Invalid Course Id")
    ]
}
const removeFromPlaylistValidator = () => {
    return [
        query("courseId").notEmpty().withMessage("Course Id is required").isMongoId().withMessage("Invalid Course Id")
    ]
}

// some other validators
const contactFormValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid Email is required"),
        body("message").notEmpty().withMessage("Message is required")
    ]
}

const sentAckMailValidator = () => {
    return [
        body("message").notEmpty().withMessage("Message is required")
    ]
}

const requestCourseValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid Email is required"),
        body("course").notEmpty().withMessage("Course Description is required")
    ]
}

export {
    validateHandler,
    createCourseValidator,
    registerValidator,
    loginValidator,
    changePasswordValidator,
    updateProfileValidator,
    forgetPasswordValidator,
    resetPasswordValidator,
    addToPlaylistValidator,
    removeFromPlaylistValidator,
    addLectureValidator,
    deleteLectureValidator,
    contactFormValidator,
    requestCourseValidator,
    sentAckMailValidator
}