import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

// Verify API key is loaded
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set in environment variables');
} else {
  console.log('SendGrid API Key is set');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Verify sender email is loaded
if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error('SENDGRID_FROM_EMAIL is not set in environment variables');
} else {
  console.log(`Sender email: ${process.env.SENDGRID_FROM_EMAIL}`);
}

async function sendOTP(email, otp) {
  // Log what's being sent
  console.log(`Attempting to send OTP to: ${email}`);
  console.log(`Using sender: ${process.env.SENDGRID_FROM_EMAIL}`);

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Your Login OTP',
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

  try {
    await sgMail.send(msg);
    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    console.error('Full error details:', error.response?.body?.errors || error);
    
    // Log specific SendGrid API issues
    if (error.response) {
      console.error('Status Code:', error.code);
      console.error('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

export default sendOTP;