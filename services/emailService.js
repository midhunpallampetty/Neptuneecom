const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service provider (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "midhunpallampetty@gmail.com", // Replace with your email
    pass: "acjr jvev anap xhag", // Replace with your email password or app password
  },
});
