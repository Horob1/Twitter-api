import nodemailer from 'nodemailer'
import { env } from './environment'

const transporter = nodemailer.createTransport({
  service: 'gmail', // replace with your email service provider
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASSWORD
  }
})

export const mailVerifyOptions = (receiverEmail: string, emailVerifyToken: string) => {
  return {
    from: {
      name: 'Horob1',
      address: env.MAIL_USER // sender address
    }, // sender address
    to: [receiverEmail], // list of receivers
    subject: 'TWITTER: Email verify', // Subject line
    html: `Click to verify: <a href=${env.HOSTNAME}/api/v1/users/verify_email/${emailVerifyToken}>verify</a>` // html body
  }
}

export const mailResetPasswordOptions = (receiverEmail: string, resetPasswordToken: string) => {
  return {
    from: {
      name: 'Horob1',
      address: env.MAIL_USER // sender address
    }, // sender address
    to: [receiverEmail], // list of receivers
    subject: 'TWITTER: Reset Password', // Subject line
    html: `Click to reset password: <a href=${env.HOSTNAME}/api/v1/users/verify_forgot_password/${resetPasswordToken}>reset password</a>` // html body
  }
}

export const sendEmail = async (options: object) => {
  try {
    await transporter.sendMail(options)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
