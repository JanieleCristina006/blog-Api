import { prisma } from "../../database/db.js";


export class ListPostService{
    async execute(){
        const posts = prisma.post.findMany({
            select:{
                media:true,
                title:true,
                content:true,
                category:true,
                id:true,
                likes:true,
                comments:true,
            }
        })

        return posts;
    }
}
