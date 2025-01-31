
import {createTransport} from "nodemailer"

const sendEmail = async (to,subject,message) =>{
    
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user:process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

    await transporter.sendMail({
        to:to,
        subject:subject,
        text:message,
    })
}


export {
    sendEmail
}

