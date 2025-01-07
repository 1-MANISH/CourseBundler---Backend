
import {cookieOptions, USER_TOKEN} from "../constants/constants.js"


const sendToken = (res,user,message,statusCode=200) => {

    // generate jwt token
    const token = user.getJwtToken()

    // remove password
    const {password,...otherDetails} = user._doc

    // send token and response
    res.status(statusCode)
    .cookie(
        USER_TOKEN,
        token,
        cookieOptions
    )
    .json({
        success:true,
        message,
        user:otherDetails
    })
}


export {
    sendToken
}