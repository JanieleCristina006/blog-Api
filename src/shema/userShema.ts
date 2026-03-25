import * as z from "zod";

export const registerShema = z.object({
  body: z.object({
    name: z.string().min(3, {
      message: "O nome precisa ter no minimo 3 caracteres",
    }),
    email: z.string().email({
      message: "Email invalido",
    }),
    password: z.string().min(6, {
      message: "A senha precisa ter no minimo 6 caracteres",
    }),
    role: z
      .enum(["admin", "user"], {
        message: "O role so pode ser admin ou user",
      })
      .default("user"),
  }),
});

export const loginShema = z.object({
  body: z.object({
    email: z.string().email({
      message: "Email invalido",
    }),
    password: z.string().min(6, {
      message: "A senha precisa ter no minimo 6 caracteres",
    }),
  }),
});

export const forgotPasswordShema = z.object({
  body: z.object({
    email: z.string().email({
      message: "Email invalido",
    }),
  }),
});

export const resetPasswordShema = z.object({
  body: z.object({
    newPassword: z.string().min(6, {
      message: "A nova senha precisa ter no minimo 6 caracteres",
    }),
  }),
  params: z.object({
    token: z.string().min(1, {
      message: "Token obrigatorio",
    }),
  }),
});
