import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendOTP(email, otp) {
  console.log(`Attempting to send OTP to: ${email}`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const currentYear = new Date().getFullYear();
  const websiteUrl = 'https://www.steemer.in';
  const supportEmail = 'steemerservicescontactin@gmail.com';
  const phoneNumber = '+91 6383148182';
  const address = 'West Tambaram, Chennai';
  const businessHours = '8 AM - 8 PM Daily';

  const mailOptions = {
    from: `Steemer Services <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Secure Login OTP | Steemer Services',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code - Steemer Services</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 10px;">
        <!-- Header with Branding -->
        <tr>
            <td style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <table width="100%">
                    <tr>
                        <td style="text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                                <a href="${websiteUrl}" style="color: white; text-decoration: none;">
                                    STEEMER SERVICES
                                </a>
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px; font-weight: 300;">
                                Professional Home Services & Solutions
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

     

        <!-- Main Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <!-- Greeting -->
                <h2 style="color: #2d3436; margin-top: 0; font-size: 24px; border-bottom: 2px solid #00b894; padding-bottom: 10px;">
                    Welcome to Steemer Services! 👋
                </h2>
                
                <p style="color: #636e72; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
                    You're just one step away from accessing your <strong>Steemer Services</strong> account. 
                    Use the OTP below to securely log in and manage your home service requests.
                </p>

                <!-- OTP Display -->
                <table width="100%" style="margin: 35px 0; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); border-radius: 15px; padding: 30px; text-align: center;">
                    <tr>
                        <td>
                            <p style="color: white; margin: 0 0 10px; font-size: 18px; font-weight: 500;">
                                🔐 VERIFICATION CODE
                            </p>
                            <div style="background: white; display: inline-block; padding: 25px 45px; border-radius: 12px; margin: 20px 0; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                                <span style="font-size: 48px; font-weight: 800; color: #2d3436; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                                    ${otp}
                                </span>
                            </div>
                            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0; font-size: 15px;">
                                ⏱️ Valid for next 5 minutes only
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Service Reminder -->
                <div style="background-color: #fff9e6; border: 1px solid #ffeaa7; padding: 20px; margin: 30px 0; border-radius: 10px;">
                    <h3 style="color: #e17055; margin-top: 0; font-size: 18px;">🏡 Your Home Services Partner:</h3>
                    <p style="color: #636e72; margin: 10px 0; line-height: 1.6;">
                        Access your profile to:
                    </p>
                    <ul style="color: #636e72; padding-left: 20px; margin: 10px 0;">
                        <li style="margin-bottom: 8px;">📋 Book new home services</li>
                        <li style="margin-bottom: 8px;">📊 Track ongoing service requests</li>
                        <li style="margin-bottom: 8px;">⭐ View service history and ratings</li>
                        <li style="margin-bottom: 8px;">💳 Manage payments and invoices</li>
                        <li>👥 Update your contact preferences</li>
                    </ul>
                </div>

                <!-- Quick Action Button -->
                <table width="100%" style="margin: 35px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <a href="${websiteUrl}/login" style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(0, 184, 148, 0.4); transition: all 0.3s;">
                                🔐 LOGIN WITH OTP
                            </a>
                            <p style="color: #636e72; font-size: 14px; margin-top: 15px;">
                                Or visit: <a href="${websiteUrl}/login" style="color: #00b894; text-decoration: none;">${websiteUrl}/login</a>
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Contact Information Box -->
                <div style="background: linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%); padding: 25px; border-radius: 10px; margin: 30px 0;">
                    <h3 style="color: #2d3436; margin-top: 0; font-size: 18px; text-align: center;">📞 Need Assistance?</h3>
                    <table width="100%" style="margin-top: 15px;">
                        <tr>
                            <td style="text-align: center;">
                                <p style="margin: 10px 0; color: #2d3436;">
                                    <strong>📧 Email:</strong> 
                                    <a href="mailto:${supportEmail}" style="color: #00b894; text-decoration: none;">${supportEmail}</a>
                                </p>
                                <p style="margin: 10px 0; color: #2d3436;">
                                    <strong>📱 Phone:</strong> 
                                    <a href="tel:${phoneNumber}" style="color: #00b894; text-decoration: none;">${phoneNumber}</a>
                                </p>
                                <p style="margin: 10px 0; color: #2d3436;">
                                    <strong>📍 Location:</strong> ${address}
                                </p>
                                <p style="margin: 10px 0; color: #2d3436;">
                                    <strong>🕐 Hours:</strong> ${businessHours}
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Important Security Notice -->
                <div style="background-color: #ffeaea; border-left: 4px solid #ff7675; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="color: #d63031; margin-top: 0; font-size: 16px;">⚠️ SECURITY ALERT:</h3>
                    <ul style="color: #636e72; padding-left: 20px; margin: 10px 0; font-size: 14px;">
                        <li style="margin-bottom: 8px;">Steemer Services team will NEVER ask for your OTP or password</li>
                        <li style="margin-bottom: 8px;">This OTP is for one-time use only</li>
                        <li style="margin-bottom: 8px;">Do not share this code with anyone</li>
                        <li>If you didn't request this OTP, secure your account immediately</li>
                    </ul>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background: linear-gradient(135deg, #2d3436 0%, #000000 100%); color: #dfe6e9; padding: 35px 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <!-- Quick Links -->
                <table width="100%" style="margin-bottom: 25px;">
                    <tr>
                        <td style="text-align: center;">
                            <a href="${websiteUrl}" style="color: #00b894; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">🏠 Home</a>
                            <span style="color: #555">|</span>
                            <a href="${websiteUrl}/services" style="color: #00b894; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">🔧 Services</a>
                            <span style="color: #555">|</span>
                            <a href="${websiteUrl}/about" style="color: #00b894; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">📖 About Us</a>
                            <span style="color: #555">|</span>
                            <a href="${websiteUrl}/contact" style="color: #00b894; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">📞 Contact</a>
                            <span style="color: #555">|</span>
                            <a href="${websiteUrl}/profile" style="color: #00b894; text-decoration: none; margin: 0 12px; font-size: 14px; font-weight: 500;">👤 Profile</a>
                        </td>
                    </tr>
                </table>

                <!-- Business Info -->
                <div style="margin: 25px 0; line-height: 1.8;">
                    <p style="margin: 5px 0; font-size: 15px;">
                        <strong>STEEMER SERVICES</strong>
                    </p>
                    <p style="margin: 5px 0; font-size: 14px; color: #b2bec3;">
                        ${address}<br>
                        ${businessHours}
                    </p>
                </div>

                <!-- Contact Footer -->
                <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 10px 0; font-size: 14px;">
                        📧 <a href="mailto:${supportEmail}" style="color: #00b894; text-decoration: none; font-weight: 500;">${supportEmail}</a>
                    </p>
                    <p style="margin: 10px 0; font-size: 14px;">
                        📱 <a href="tel:${phoneNumber}" style="color: #00b894; text-decoration: none; font-weight: 500;">${phoneNumber}</a>
                    </p>
                </div>

                <!-- Back to Website Button -->
                <div style="margin: 25px 0;">
                    <a href="${websiteUrl}" style="background-color: rgba(0, 184, 148, 0.2); color: #00b894; padding: 14px 35px; text-decoration: none; border-radius: 25px; font-size: 15px; font-weight: 600; border: 1px solid #00b894; display: inline-block; transition: all 0.3s;">
                        ← Return to Steemer Services
                    </a>
                </div>

                <!-- Copyright -->
                <p style="color: #b2bec3; font-size: 12px; margin: 25px 0 0; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); line-height: 1.6;">
                    © ${currentYear} <strong>Steemer Services</strong>. All rights reserved.<br>
                    <small>This email was sent to ${email} as part of our authentication process.</small>
                </p>
            </td>
        </tr>
    </table>

    <!-- Email Footer Note -->
    <div style="text-align: center; margin: 20px auto; max-width: 600px;">
        <p style="color: #636e72; font-size: 11px; line-height: 1.5;">
            Steemer Services - Your trusted partner for professional home services.<br>
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
    `,
    // Plain text version
    text: `
STEEMER SERVICES - SECURE LOGIN OTP

Hello,

Welcome to Steemer Services! You're just one step away from accessing your account.

YOUR OTP CODE: ${otp}
(Valid for 5 minutes)

LOGIN LINK: ${websiteUrl}/login

OUR SERVICES:
- Home Services Management
- Service Request Booking
- Service History Tracking
- Payment & Invoice Management

CONTACT INFORMATION:
📧 Email: ${supportEmail}
📱 Phone: ${phoneNumber}
📍 Address: ${address}
🕐 Business Hours: ${businessHours}

QUICK LINKS:
🏠 Home: ${websiteUrl}
🔧 Services: ${websiteUrl}/services
📖 About: ${websiteUrl}/about
📞 Contact: ${websiteUrl}/contact
👤 Profile: ${websiteUrl}/profile

SECURITY REMINDER:
• Never share your OTP with anyone
• Steemer Services will never ask for your password
• This OTP is for one-time use only
• If you didn't request this, please contact us immediately

---
© ${currentYear} Steemer Services. All rights reserved.
${address} | ${supportEmail} | ${phoneNumber}

This is an automated message. Please do not reply directly.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    console.log('📧 Message ID:', info.messageId);
    console.log('🏢 Business:', 'Steemer Services');
    console.log('📍 Location:', address);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('🔧 Error details:', error);
    return { success: false, error: error.message };
  }
}

export default sendOTP;