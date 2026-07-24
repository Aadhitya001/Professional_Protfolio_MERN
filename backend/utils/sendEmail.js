import nodemailer from 'nodemailer';

export const sendConfirmationEmail = async (recipientEmail, recipientName, subject, messageContent) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('SMTP configuration (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) is missing. Confirmation email skipped.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT) || 587,
      secure: parseInt(EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Admin'}" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Message Received - Thank you for contacting me',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #374151;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Hello ${recipientName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for reaching out! Your message has reached me successfully.
          </p>
          <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #111827;">Message Details:</p>
            <p style="margin: 0 0 5px 0;"><strong>Subject:</strong> ${subject || '(No Subject)'}</p>
            <p style="margin: 0;"><strong>Message:</strong> ${messageContent}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">
            I will review your message and contact you soon.
          </p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            This is an automated confirmation email sent from my professional portfolio site. Please do not reply directly to this message.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${recipientEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send confirmation email to ${recipientEmail}: ${error.message}`);
    return false;
  }
};

export const sendOtpEmail = async (recipientEmail, recipientName, otp) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.warn(`SMTP configuration missing. OTP for ${recipientName} is: ${otp}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT) || 587,
      secure: parseInt(EMAIL_PORT) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Admin'}" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Admin Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #374151;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Admin Password Reset</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            You requested to reset your admin password. Use the following One-Time Password (OTP) to proceed:
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            This OTP is valid for 10 minutes. If you did not request this, please secure your credentials immediately.
          </p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Automated security alert from your professional portfolio site.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Failed to send OTP email to ${recipientEmail}: ${error.message}`);
    return false;
  }
};
