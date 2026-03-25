import { transporter } from "./mail.js";

interface SendEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailProps) {
  try {
    const info = await transporter.sendMail({
      from: `"Suporte" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email enviado:", info.messageId);

    return info;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Falha ao enviar email");
  }
}