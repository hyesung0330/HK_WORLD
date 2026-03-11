import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("EMAIL_USER or EMAIL_PASS environment variables are missing.");
    return { success: false, error: "EMAIL_USER_OR_PASS_MISSING" };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Textra" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, info };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
