import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

type RequestSchema = z.ZodObject<{
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}>;

type ValidatedRequestData = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

export const validateSchema = (schema: RequestSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as ValidatedRequestData;

      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }

      if (validatedData.query !== undefined) {
        req.query = validatedData.query as Request["query"];
      }

      if (validatedData.params !== undefined) {
        req.params = validatedData.params as Request["params"];
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Erro de validação",
          details: error.issues.map((issue) => ({
            campo: issue.path.join("."),
            mensagem: issue.message,
          })),
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };