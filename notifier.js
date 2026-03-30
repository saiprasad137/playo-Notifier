const nodemailer = require('nodemailer');
const config = require('./config');

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password, NOT your account password
    },
  });
}

function formatGameHtml(game) {
  const date = game.date ? new Date(game.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'TBD';
  return `
    <div style="border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:16px; font-family:sans-serif;">
      <h3 style="margin:0 0 8px; color:#1a202c;">${game.title}</h3>
      <p style="margin:4px 0; color:#4a5568;">📍 ${game.venueName}</p>
      <p style="margin:4px 0; color:#4a5568;">📅 ${date}</p>
      <p style="margin:4px 0; color:#4a5568;">👥 Spots left: <strong>${game.spotsLeft}</strong></p>
      <p style="margin:4px 0; color:#4a5568;">💰 Price: ₹${game.price}</p>
      <a href="${game.url}" style="display:inline-block; margin-top:12px; padding:8px 16px; background:#6366f1; color:white; text-decoration:none; border-radius:6px;">
        Book Now →
      </a>
    </div>
  `;
}

async function sendNotification(games) {
  const transporter = createTransport();

  const gamesHtml = games.map(formatGameHtml).join('');
  const subject =
    games.length === 1
      ? `🏸 New badminton game near you: ${games[0].venueName}`
      : `🏸 ${games.length} new badminton games near you!`;

  await transporter.sendMail({
    from: `"Playo Notifier" <${process.env.GMAIL_USER}>`,
    to: config.EMAIL_TO,
    subject,
    html: `
      <div style="max-width:600px; margin:0 auto; font-family:sans-serif;">
        <h2 style="color:#1a202c;">New badminton games within 5km of you 🏸</h2>
        <p style="color:#718096;">Found ${games.length} new game(s) on Playo. Book fast before they fill up!</p>
        ${gamesHtml}
        <p style="color:#a0aec0; font-size:12px; margin-top:24px;">
          You're receiving this because Playo Notifier is watching for games near Hyderabad (17.47, 78.48).
        </p>
      </div>
    `,
  });

  console.log(`Email sent for ${games.length} game(s).`);
}

module.exports = { sendNotification };
