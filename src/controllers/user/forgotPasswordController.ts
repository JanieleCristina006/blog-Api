import { Request, Response } from "express";
import { ForgotPasswordService } from "../../services/user/forgotPasswordService.js";

class ForgotPasswordController {
  async handle(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const service = new ForgotPasswordService();
      const result = await service.execute({ email });

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Falha ao enviar email de recuperacao",
      });
    }
  }
}

export default ForgotPasswordController;
