import * as z from "zod";

export const createCommentShema = z.object({
  body: z.object({
    content: z.string().min(1, {
      message: "O comentário não pode estar vazio",
    }),
    parentId: z
      .uuid({
        message: "O id do comentário pai precisa ser um UUID válido",
      })
      .optional(),
  }),
  params: z.object({
    postId: z.uuid({
      message: "O id do post precisa ser um UUID válido",
    }),
  }),
});

export const listCommentShema = z.object({
  params: z.object({
    postId: z.uuid({
      message: "O id do post precisa ser um UUID válido",
    }),
  }),
});

export const deleteCommentShema = z.object({
  params: z.object({
    commentId: z.uuid({
      message: "O id do comentário precisa ser um UUID válido",
    }),
  }),
});
