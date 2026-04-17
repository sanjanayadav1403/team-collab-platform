const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((err) => {
    if(err) {
        console.warn('Email service not connected:', err.message);
    } else {
        console.log('Email service ready');
    }
});

const sendInviteEmail = async (toEmail, orgName, inviteLink, invitedByName) => {
  const mailOptions = {
    from: `"TeamCollab" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `You've been invited to join ${orgName} on TeamCollab`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">You're invited!</h2>
        <p>
          <strong>${invitedByName}</strong> has invited you to join 
          <strong>${orgName}</strong> on TeamCollab.
        </p>
        <p>Click the button below to accept the invitation. 
           This link expires in <strong>24 hours</strong>.
        </p>
        <a 
          href="${inviteLink}" 
          style="
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px;
            margin: 16px 0;
          "
        >
          Accept Invitation
        </a>
        <p style="color: #6B7280; font-size: 14px;">
          Or copy this link: <br/>
          <a href="${inviteLink}">${inviteLink}</a>
        </p>
        <p style="color: #6B7280; font-size: 12px; margin-top: 32px;">
          If you weren't expecting this email, you can safely ignore it.
        </p>
      </div>
    `,
  };
 
  await transporter.sendMail(mailOptions);
};
 
module.exports = { sendInviteEmail };