let mailer = require('nodemailer')
require('dotenv').config();

const transporter = mailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

let sendMail = (to, subject, text, header) =>{
    mailOptions = {
        from: process.env.SMTP_USER,
        to, subject, text, header
    };
    return transporter.sendMail(mailOptions);
}

module.exports = sendMail;
