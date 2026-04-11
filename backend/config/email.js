const nodemailer = require('nodemailer');

// Create transporter — works with Gmail, Outlook, or any SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Base HTML wrapper — consistent branded layout for all emails
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>A World For Them</title>
</head>
<body style="margin:0;padding:0;background:#f5ede0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5ede0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#2a1a0e);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#c4633a,#d4882c);width:52px;height:52px;border-radius:14px;line-height:52px;font-size:26px;margin-bottom:12px;">🐾</div>
          <h1 style="margin:0;color:white;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
            Stray<span style="color:#e07a50;">Paws</span>
          </h1>
          <p style="margin:6px 0 0;color:#888;font-size:13px;">Find a Home · Give a Home</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:40px;border-radius:0 0 16px 16px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">
            © ${new Date().getFullYear()} A World For Them · Every animal deserves a loving home 🐾
          </p>
          <p style="margin:6px 0 0;color:#bbb;font-size:11px;">
            You're receiving this because you have a AWFT account.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// Reusable button component
const emailButton = (text, url, color = '#c4633a') => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:${color};color:white;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
      ${text}
    </a>
  </div>
`;

// Reusable info row
const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;width:140px;">${label}</td>
    <td style="padding:8px 0;color:#2d2d2d;font-size:13px;">${value}</td>
  </tr>
`;

// ─── Send helper ─────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html }) => {
  // If email credentials not configured, just log and skip — don't crash the app
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email skipped — not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `AWFT <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email sent] To: ${to} | Subject: ${subject} | ID: ${info.messageId}`);
  } catch (error) {
    // Log but never throw — email failure should never break the main request
    console.error(`[Email failed] To: ${to} | Error: ${error.message}`);
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// 1. Welcome email after registration
const sendWelcomeEmail = async (user) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Welcome to A World For Them, ${user.name}! 🎉</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      We're so glad you're here. A world for them is a community built on compassion — connecting stray animals with the loving homes they deserve.
    </p>
    <div style="background:#fdf6ec;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 12px;font-weight:700;color:#2d2d2d;">Here's what you can do:</p>
      <p style="margin:6px 0;color:#555;">🐾 <strong>Browse adoptions</strong> — find your perfect companion</p>
      <p style="margin:6px 0;color:#555;">📋 <strong>Post a stray</strong> — help animals you've found</p>
      <p style="margin:6px 0;color:#555;">🏥 <strong>Book vet care</strong> — keep rescued animals healthy</p>
      <p style="margin:6px 0;color:#555;">💬 <strong>Chat directly</strong> — connect with adopters and posters</p>
    </div>
    ${emailButton('Start Exploring 🐾', `${CLIENT_URL}/adopt`)}
    <p style="color:#999;font-size:13px;text-align:center;margin:0;">
      Questions? Just reply to this email and we'll help you out.
    </p>
  `);

  await sendEmail({ to: user.email, subject: '🐾 Welcome to AWFT!', html });
};

// 2. Someone requested to adopt your animal
const sendAdoptionRequestEmail = async ({ posterEmail, posterName, requesterName, animalName, message, adoptionId }) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Someone wants to adopt ${animalName}! 🐾</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Great news, <strong>${posterName}</strong>! <strong>${requesterName}</strong> has sent an adoption request for <strong>${animalName}</strong>.
    </p>
    <div style="background:#fdf6ec;border:1px solid #e8d5b7;border-radius:12px;padding:20px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow('Requester', requesterName)}
        ${infoRow('Animal', animalName)}
        ${message ? infoRow('Their message', `<em>"${message}"</em>`) : ''}
      </table>
    </div>
    <p style="color:#666;line-height:1.7;">
      A chat room has been created so you can talk with ${requesterName} directly. Review their request and decide if it's a good match!
    </p>
    ${emailButton('Review Request & Chat', `${CLIENT_URL}/adopt/${adoptionId}`, '#c4633a')}
    <p style="color:#999;font-size:12px;text-align:center;">
      You can accept or reject this request from the adoption post page.
    </p>
  `);

  await sendEmail({ to: posterEmail, subject: `🐾 New adoption request for ${animalName}`, html });
};

// 3. Your adoption request was accepted
const sendRequestAcceptedEmail = async ({ requesterEmail, requesterName, animalName, posterName, chatRoomId }) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#3d6b4f;font-size:22px;">Your request was accepted! 🎉</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Wonderful news, <strong>${requesterName}</strong>! <strong>${posterName}</strong> has <strong style="color:#3d6b4f;">accepted</strong> your adoption request for <strong>${animalName}</strong>.
    </p>
    <div style="background:#e8f4ec;border:1px solid #b2dfdb;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🐾❤️</div>
      <p style="margin:0;color:#3d6b4f;font-weight:700;font-size:16px;">You're one step closer to your new companion!</p>
    </div>
    <p style="color:#666;line-height:1.7;">
      Head to your chat with ${posterName} to arrange the next steps — meeting the animal, pickup details, and anything else you need to discuss.
    </p>
    ${emailButton('Open Chat with ' + posterName, `${CLIENT_URL}/chat/${chatRoomId}`, '#3d6b4f')}
  `);

  await sendEmail({ to: requesterEmail, subject: `✅ Your adoption request for ${animalName} was accepted!`, html });
};

// 4. Your adoption request was rejected
const sendRequestRejectedEmail = async ({ requesterEmail, requesterName, animalName, posterName }) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Update on your adoption request</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${requesterName}</strong>, unfortunately <strong>${posterName}</strong> was unable to move forward with your adoption request for <strong>${animalName}</strong> at this time.
    </p>
    <p style="color:#666;line-height:1.7;">
      Don't be discouraged — there are many wonderful animals waiting for a home just like yours. Keep browsing and you'll find the perfect match!
    </p>
    ${emailButton('Browse More Animals 🐾', `${CLIENT_URL}/adopt`)}
    <p style="color:#999;font-size:12px;text-align:center;margin-top:20px;">
      The right companion is out there for you. 💛
    </p>
  `);

  await sendEmail({ to: requesterEmail, subject: `Update on your adoption request for ${animalName}`, html });
};

// 5. Adoption completed — email both parties
const sendAdoptionCompleteEmail = async ({ posterEmail, posterName, requesterEmail, requesterName, animalName }) => {
  // Email to the new owner
  const ownerHtml = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#3d6b4f;font-size:22px;">Congratulations on your new family member! 🎊</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      <strong>${requesterName}</strong>, the adoption of <strong>${animalName}</strong> is now complete. Welcome to the family!
    </p>
    <div style="background:#e8f4ec;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
      <div style="font-size:48px;margin-bottom:8px;">🏡🐾</div>
      <p style="margin:0;color:#3d6b4f;font-weight:700;font-size:16px;">${animalName} has found their forever home!</p>
    </div>
    <p style="color:#666;line-height:1.7;">
      We recommend booking a <strong>post-adoption checkup</strong> with one of our vets to make sure ${animalName} settles in healthy and happy.
    </p>
    ${emailButton('Book a Vet Checkup', `${CLIENT_URL}/vet-care`, '#3d6b4f')}
  `);

  // Email to the poster
  const posterHtml = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#c4633a;font-size:22px;">You've changed a life, ${posterName}! 🌟</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      The adoption of <strong>${animalName}</strong> is now marked as complete. <strong>${requesterName}</strong> is the proud new owner!
    </p>
    <div style="background:#fdf6ec;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
      <div style="font-size:48px;margin-bottom:8px;">❤️🐾</div>
      <p style="margin:0;color:#c4633a;font-weight:700;font-size:16px;">Thank you for making a difference.</p>
    </div>
    <p style="color:#666;line-height:1.7;">
      If you know of other strays that need help, please don't hesitate to post them here.
    </p>
    ${emailButton('Post Another Stray', `${CLIENT_URL}/post-adoption`)}
  `);

  await Promise.all([
    sendEmail({ to: requesterEmail, subject: `🎊 Adoption of ${animalName} is complete!`, html: ownerHtml }),
    sendEmail({ to: posterEmail, subject: `🌟 ${animalName} has found a home!`, html: posterHtml }),
  ]);
};

// 6. Vet appointment confirmation
const sendAppointmentConfirmationEmail = async ({ userEmail, userName, animalName, serviceType, appointmentDate, timeSlot, vet, fee, appointmentId }) => {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const serviceName = serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Appointment Confirmed! 🏥</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${userName}</strong>, your vet appointment has been booked successfully. Here are the details:
    </p>
    <div style="background:#e8f4ec;border:1px solid #b2dfdb;border-radius:12px;padding:24px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow('🐾 Animal', animalName)}
        ${infoRow('🩺 Service', serviceName)}
        ${infoRow('📅 Date', formattedDate)}
        ${infoRow('🕐 Time', timeSlot)}
        ${infoRow('👩‍⚕️ Vet', vet)}
        ${infoRow('💰 Fee', `৳${fee?.toLocaleString() || 'TBD'}`)}
      </table>
    </div>
    <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#e65100;font-size:13px;font-weight:600;">📍 Clinic Location</p>
      <p style="margin:6px 0 0;color:#555;font-size:13px;">AWFT Vet Center · Road 4, Dhanmondi, Dhaka 1205</p>
    </div>
    <p style="color:#666;font-size:13px;line-height:1.7;">
      Please arrive 10 minutes early. If you need to cancel or reschedule, please do so at least 24 hours in advance from your dashboard.
    </p>
    ${emailButton('View Appointment', `${CLIENT_URL}/dashboard`, '#3d6b4f')}
  `);

  await sendEmail({ to: userEmail, subject: `🏥 Vet appointment confirmed for ${animalName} — ${formattedDate}`, html });
};

// 7. Vet appointment cancellation
const sendAppointmentCancelledEmail = async ({ userEmail, userName, animalName, appointmentDate, timeSlot }) => {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Appointment Cancelled</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${userName}</strong>, your vet appointment for <strong>${animalName}</strong> on <strong>${formattedDate}</strong> at <strong>${timeSlot}</strong> has been cancelled.
    </p>
    <p style="color:#666;line-height:1.7;">
      If this was a mistake or you'd like to rebook, you can do so anytime from the Vet Care page.
    </p>
    ${emailButton('Book a New Appointment', `${CLIENT_URL}/vet-care`, '#3d6b4f')}
  `);

  await sendEmail({ to: userEmail, subject: `Vet appointment for ${animalName} cancelled`, html });
};

// 8. Admin: user banned notification
const sendAccountBannedEmail = async ({ userEmail, userName, reason }) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#c62828;font-size:22px;">Account Suspended</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${userName}</strong>, your AWFT account has been suspended by an administrator.
    </p>
    ${reason ? `
    <div style="background:#ffebee;border:1px solid #ffcdd2;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#c62828;font-size:13px;font-weight:600;">Reason:</p>
      <p style="margin:6px 0 0;color:#555;font-size:13px;">${reason}</p>
    </div>` : ''}
    <p style="color:#666;line-height:1.7;">
      If you believe this is a mistake, please contact our support team by replying to this email.
    </p>
  `);

  await sendEmail({ to: userEmail, subject: 'Your AWFT account has been suspended', html });
};

// 9. Admin: post removed notification
const sendPostRemovedEmail = async ({ userEmail, userName, animalName, reason }) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Your post was removed</h2>
    <p style="color:#666;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${userName}</strong>, your adoption post for <strong>${animalName}</strong> has been removed by an administrator.
    </p>
    ${reason ? `
    <div style="background:#fff3e0;border:1px solid #ffe0b2;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#e65100;font-size:13px;font-weight:600;">Reason:</p>
      <p style="margin:6px 0 0;color:#555;font-size:13px;">${reason}</p>
    </div>` : ''}
    <p style="color:#666;line-height:1.7;">
      Please review our community guidelines before reposting. If you have questions, reply to this email.
    </p>
    ${emailButton('View Guidelines', `${CLIENT_URL}`)}
  `);

  await sendEmail({ to: userEmail, subject: `Your adoption post for ${animalName} was removed`, html });
};

module.exports = {
  sendWelcomeEmail,
  sendAdoptionRequestEmail,
  sendRequestAcceptedEmail,
  sendRequestRejectedEmail,
  sendAdoptionCompleteEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentCancelledEmail,
  sendAccountBannedEmail,
  sendPostRemovedEmail,
};
