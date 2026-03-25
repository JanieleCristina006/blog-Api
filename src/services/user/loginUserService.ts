import "dotenv/config";
import { prisma } from "../../database/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";



interface LoginUserServiceProps{
    email:string,
    password: string
}

class loginUserService {
    async execute({ email,password }:LoginUserServiceProps){

        const user = await prisma.user.findUnique({
            where:{
                email: email
            }
        })
        // console.log(user)

        if (!user) {
            throw new Error("Credenciais inválidas")
        }

        let senhaValida = await bcrypt.compare(password,user.password)

        if(!senhaValida){
            throw new Error("Credenciais inválidas")
        }

        const token = jwt.sign(
            {
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            {
                subject: user.id,
                expiresIn: "15d",
            }
        )

        // console.log(`Token gerado: ${token}`)

        if(!token){
            throw new Error("Falha ao gerar token!")
        }

        return `token:${token}`
        
    }
}

export default loginUserService;