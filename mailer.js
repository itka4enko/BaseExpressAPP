const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_USE_TLS, 
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD
  }
});

// Метод для відправки електронного листа
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.DEFAULT_FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
