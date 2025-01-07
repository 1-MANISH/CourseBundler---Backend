const USER_TOKEN = "USER_TOKEN"

const cookieOptions = {
    expires: new Date(Date.now() + 1000 * 60 *60 * 24 *15),
    httpOnly: true,
    secure: true,
    sameSite:"none"
}

export {
    USER_TOKEN,
    cookieOptions
}