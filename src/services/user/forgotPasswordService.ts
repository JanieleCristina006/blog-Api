import crypto from "crypto";
import { sendEmail } from "../../config/sendMail.js";
import { prisma } from "../../database/db.js";

interface ForgotPasswordServiceProps {
  email: string;
}

export class ForgotPasswordService {
  async execute({ email }: ForgotPasswordServiceProps) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: "Se o email existir, voce recebera um link de recuperacao.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expireAt = new Date(Date.now() + 1000 * 60 * 15);

    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await prisma.passwordReset.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: expireAt,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Recuperacao de senha",
      html: `
        <h2>Ola, ${user.name}</h2>
        <p>Voce solicitou a redefinicao de senha.</p>
        <p>Use o link abaixo para continuar:</p>
        <a href="http://localhost:3000/reset?token=${resetToken}">
          Redefinir senha
        </a>
        <p>Esse link expira em 15 minutos.</p>
      `,
    });

    return {
      message: "Email de recuperacao enviado com sucesso.",
      resetToken,
    };
  }
}
