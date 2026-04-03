import { z } from 'zod';

// ── Contact Form ──
export const contactSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z.string().email('E-mail inválido').trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, '').length >= 10,
      'Telefone deve ter pelo menos 10 dígitos',
    ),
  subject: z.enum(['duvidas', 'orcamento', 'elogios', 'sugestoes', 'reclamacoes'], {
    error: 'Selecione um assunto válido',
  }),
  message: z
    .string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres')
    .trim(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ── Helper: format Zod errors into a flat object ──
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
