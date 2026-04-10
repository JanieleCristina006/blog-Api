import { Request, Response } from "express";
import LoginUserService from "../../services/user/loginUserService.js";

class LoginUserController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const userService = new LoginUserService();
      const dados = await userService.execute({ email, password });

      return res.json(dados);
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        error: error instanceof Error ? error.message : "Credenciais invalidas",
      });
    }
  }
}

export default LoginUserController;
