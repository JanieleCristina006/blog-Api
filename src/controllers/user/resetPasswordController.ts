import { Request, Response } from "express";
import ResetPasswordService from "../../services/user/resetPasswordService.js";

class ResetPasswordController {
  async handle(req: Request, res: Response) {
    const { newPassword } = req.body;
    const { token } = req.params as { token: string };

    try {
      const userService = new ResetPasswordService();
      const dados = await userService.execute({ token, newPassword });

      return res.json(dados);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Falha ao resetar senha!",
      });
    }
  }
}

export default ResetPasswordController;
