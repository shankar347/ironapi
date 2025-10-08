import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEnquiryConfirmation({ name, email, phone, subject, message }) {
  const msg = {
    to: email, // send to the user who submitted the form
    from: process.env.SENDGRID_FROM_EMAIL, // your verified SendGrid sender
    subject: 'We Received Your Enquiry',
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

  try {
    await sgMail.send(msg);
    console.log(`Enquiry confirmation sent to ${email}`);
  } catch (error) {
    console.error(error);
  }
}

export default sendEnquiryConfirmation;
