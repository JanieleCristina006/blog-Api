import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../database/db.js";
import { AppError } from "../utils/AppError.js";

interface TokenPayload {
  sub: string;
}

export async function authUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError("Token não fornecido", 401));
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return next(new AppError("Formato do token inválido", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    const userId = decoded.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError("Usuário não encontrado", 401));
    }

    req.user_id = userId;
    req.user_role = user.role;

    return next();
  } catch {
    return next(new AppError("Token inválido", 401));
  }
}
