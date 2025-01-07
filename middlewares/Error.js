

const ErrorMiddleware = (err,req,res,next) => {

    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"


    // mongodb and multer error also jwt

    // Handle invalid JWT error
    if(err.name === "JsonWebTokenError"){
        err.statusCode = 401;
        err.message = "Invalid Token. Please log in again"
    }
    if(err.name === "TokenExpiredError"){
        err.statusCode = 401
        err.message = "Token has expired log in again"
    }


    // Handle mongoose validation error
    if(err.name === "ValidationError"){
        err.statusCode = 400
        err.message = Object.values(err.errors).map((error) => error.message).join(",")
    }
    // Mongoose duplicate key error
    if(err.code === 11000){
        err.statusCode = 400
        err.message =  `Duplicate ${Object.keys(err.keyValue)} entered`
    }
    // Handle mongoose cast error
    if(err.name === "CastError"){
        err.statusCode = 400
        err.message = `Invalid ${err.path}: ${err.value}.`;
    }


    res.status(err.statusCode).json ({
        success:false,
        message:err.message
    })
}

export {
    ErrorMiddleware
}