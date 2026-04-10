import * as z from "zod";

const optionalCategoryIdSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }

    return value;
  },
  z.uuid({
    message: "O id da categoria precisa ser um UUID valido",
  }).optional()
);

export const createPostShema = z.object({
  body: z.object({
    title: z.string().trim().min(3, {
      message: "O titulo precisa ter no minimo 3 caracteres",
    }),
    content: z.string().trim().min(3, {
      message: "O conteudo precisa ter no minimo 3 caracteres",
    }),
    categoryId: optionalCategoryIdSchema,
  }),
});

export const updatePostShema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, {
        message: "O titulo precisa ter no minimo 3 caracteres",
      })
      .optional(),
    content: z
      .string()
      .trim()
      .min(3, {
        message: "O conteudo precisa ter no minimo 3 caracteres",
      })
      .optional(),
    categoryId: z.preprocess(
      (value) => {
        if (typeof value === "string") {
          return value.trim();
        }

        return value;
      },
      z
        .union([
          z.literal(""),
          z.uuid({
            message: "O id da categoria precisa ser um UUID valido",
          }),
        ])
        .optional()
    ),
  }).refine(
    (body) =>
      body.title !== undefined ||
      body.content !== undefined ||
      body.categoryId !== undefined,
    {
      message: "Envie ao menos um campo para atualizar",
      path: ["body"],
    }
  ),
  params: z.object({
    postId: z.uuid({
      message: "O id do post precisa ser um UUID valido",
    }),
  }),
});

export const deletePostShema = z.object({
  params: z.object({
    postId: z.uuid({
      message: "O id do post precisa ser um UUID valido",
    }),
  }),
});
