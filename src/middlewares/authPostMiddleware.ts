import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../database/db.js";

interface TokenPayload {
  sub: string;
}

export async function authPostMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    const userId = decoded.sub;

    //  busca usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // 🔥 verifica se é admin
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Apenas administradores podem criar posts"
      });
    }

    // 🔥 adiciona no req
    (req as any).user_id = userId;

    return next();

  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}