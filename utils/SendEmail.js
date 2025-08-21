import { createTransport } from 'nodemailer';

export const SendEmail = async (options) => {
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });

  const codeRequestHTMLTemplate = `
  <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 20px;">
      <h2 style="color: #333; margin-bottom: 10px;">🔐 Reset Your Password</h2>
      <p style="font-size: 16px;">Hello <strong>${options.username}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">
        We received a request to reset your password. You can use the code or the link below to reset your password:
      </p>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 0 0 10px;"><strong>Reset Code:</strong> <span style="font-size: 18px; color: #007bff;">${options.resetCode}</span></p>
        <p style="margin: 0;"><strong>Reset Link:</strong> <a href="${options.resetLink}" style="color: #007bff; word-break: break-all;">${options.resetLink}</a></p>
      </div>

      <p style="color: #cc0000; font-weight: bold;">⚠️ Please do not share this code or link with anyone.</p>
      <p style="color: #cc0000;">⏰ This code/link is valid for 10 minutes only.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

      <p style="font-size: 13px; color: #777;">If you did not request a password reset, please ignore this email or contact support.</p>
      <p style="font-size: 13px; color: #777;">Thank you,<br/>The Humble Store Team</p>
    </div>
  </div>
`;

  const mailTo = {
    to: options.email,
    from: 'the store <hamamhussein10@gmail.com>',
    subject: `Hi ${options.username}, reset the store password account`,
    html: codeRequestHTMLTemplate,
  };

  try {
    await transporter.sendMail(mailTo);
    console.log('Email sent successfuly');
  } catch (err) {
    console.log('Error sending email ', err);
  }
};
