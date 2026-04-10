import * as z from "zod";

export const createCategoryShema = z.object({
  body: z.object({
    name: z.string().min(2, {
      message: "O nome da categoria precisa ter no mínimo 2 caracteres",
    }),
  }),
});

export const updateCategoryShema = z.object({
  body: z.object({
    name: z.string().min(2, {
      message: "O nome da categoria precisa ter no mínimo 2 caracteres",
    }),
  }),
  params: z.object({
    categoryId: z.uuid({
      message: "O id da categoria precisa ser um UUID válido",
    }),
  }),
});

export const deleteCategoryShema = z.object({
  params: z.object({
    categoryId: z.uuid({
      message: "O id da categoria precisa ser um UUID válido",
    }),
  }),
});
