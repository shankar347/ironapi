import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sivaaadi96@gmail.com",
    pass: "omgz llkn avlm cbof", // Use app password, not your real password
  },
});

async function sendEnquiryConfirmation({
  name,
  email,
  phone,
  subject,
  message,
}) {
  const mailOptions = {
    from: "sivaaadi96@gmail.com",
    to: "sivaaadi96@gmail.com", // Send confirmation to the user
    subject: "We Received Your Enquiry",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #2196F3;">Enquiry Received</h2>
        <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          Thank you for reaching out to us. We have successfully received your enquiry. 
          Our team will review your request and get back to you shortly.
        </p>

        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #2196F3; background: #eef6fd;">
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>📞 Phone:</strong> ${phone}</p>
          <p style="margin: 5px 0;"><strong>📝 Subject:</strong> ${subject}</p>
          <p style="margin: 5px 0;"><strong>💬 Message:</strong> ${message}</p>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center;">
          We truly value your interest and will respond as soon as possible.
        </p>
        <p style="text-align: center; font-size: 14px; color: #888;">
          – The Support Team
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export default sendEnquiryConfirmation;
