import * as z from "zod";

export const registerShema = z.object({
  body: z.object({
    name: z.string().min(3, {
      message: "O nome precisa ter no mínimo 3 caracteres",
    }),
    email: z.string().email({
      message: "Email inválido",
    }),
    password: z.string().min(6, {
      message: "A senha precisa ter no mínimo 6 caracteres",
    }),
    role: z.enum(["admin", "user"], {
        message: "O role só pode ser admin ou user",
    }).default("user"),
  }),
});

export const loginShema = z.object({
  body: z.object({
    email: z.string().email({
      message: "Email inválido",
    }),
    password: z.string().min(6, {
      message: "A senha precisa ter no mínimo 6 caracteres",
    }),
  }),
});