import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sivaaadi96@gmail.com",
    pass: "omgz llkn avlm cbof",
  },
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: "sivaaadi96@gmail.com",
    to: email,
    subject: "Your Login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Login OTP</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your OTP for login is:</p>
        <h1 style="text-align: center; color: #000;">${otp}</h1>
        <p style="font-size: 14px; color: #888; text-align: center;">This OTP is valid for 5 minutes.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export default sendOTP;
