import { Request,Response } from "express";
import loginUserService from "../../services/user/loginUserService.js";


class LoginUserController{
    async handle(req:Request,res:Response){
        const { email,password } = req.body
        
        try {
            const userService = new loginUserService()
            const dados = await userService.execute({email,password})

            res.json(dados)
        } catch (error) {
            console.log(error)
             return res.status(400).json({
                error: "Credenciais inválidas!"
            });
        }
    }
}

export default LoginUserController;