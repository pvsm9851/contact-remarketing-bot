import { z } from "zod";

export const contactSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode ter mais de 100 caracteres"),
  phone: z.string()
    .regex(/^55\d{10,11}$/, "Número deve estar no formato: 55 + DDD + número (ex: 5511999887766)")
});

export const contactImportSchema = z.array(contactSchema);

export type ContactValidation = z.infer<typeof contactSchema>;
export type ContactImportValidation = z.infer<typeof contactImportSchema>; 