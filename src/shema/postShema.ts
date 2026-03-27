import * as z from "zod";

export const deletePostShema = z.object({
  params: z.object({
    postId: z.uuid({
      message: "O id do post precisa ser um UUID válido",
    }),
  }),
});
