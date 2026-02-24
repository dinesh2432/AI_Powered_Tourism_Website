const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    service:"gmail",
host: "smtp.gmail.com",
port: 587,
secure: false, 
auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_APP_PASS
},
});

module.exports=transporter
