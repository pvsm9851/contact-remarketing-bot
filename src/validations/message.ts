import { z } from "zod";

export const messageSchema = z.object({
  content: z.string()
    .min(1, "Mensagem não pode estar vazia")
    .max(4096, "Mensagem não pode ter mais de 4096 caracteres"),
  intervalSeconds: z.number()
    .min(10, "Intervalo mínimo é de 10 segundos")
    .max(3600, "Intervalo máximo é de 1 hora"),
  contacts: z.array(z.string())
    .min(1, "Selecione pelo menos um contato")
});

export type MessageValidation = z.infer<typeof messageSchema>; 