import { Request,Response } from "express";
import RegisterService from "../../services/user/registerUserService.js";

class RegisterController{
    async handle(req:Request,res:Response){
        const { name,email,password,role } = req.body;
        const file = req.file;

        const service = new RegisterService()

       try {

         const dados = await service.execute({name,email,password,role,file});
         return res.json(dados)
        
       } catch (error) {
        console.log(error)
         return res.status(400).json({ error: error instanceof Error ? error.message : "Erro desconhecido",})
       }

       
    }
}

export default RegisterController