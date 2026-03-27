import { ListPostService } from "../../services/post/ListPostService.js";

import { Request,Response } from "express";


export class ListPostController{
     async handle(req:Request,res:Response,){
        try {
            const service = new ListPostService();
            const data = await service.execute()

          return  res.json(data)
            
        } catch (error) {
            console.log(error)
            throw new Error("Erro ao listar posts!")
        }
     }
}