import { z } from 'zod';

// Schemas Zod para todas as entidades

// Schema para Processo
export const ProcessoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  status: z.enum(['rascunho', 'ativo', 'finalizado']),
  dataAbertura: z.date().optional(),
  dataEncerramento: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  usuarioId: z.string().optional(),
});

// Schema para Função
export const FuncaoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  salario: z.number().positive().optional(),
  processoId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema para Convite
export const ConviteSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Email inválido'),
  processoId: z.string(),
  funcaoId: z.string(),
  status: z.enum(['pendente', 'aceito', 'recusado']).optional(),
  dataEnvio: z.date().optional(),
  dataExpiracao: z.date().optional(),
  createdAt: z.date().optional(),
});

// Schema para Candidato
export const CandidatoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  processoId: z.string(),
  funcaoId: z.string(),
  status: z.enum(['recebido', 'triagem', 'entrevista', 'aprovado', 'recusado']).optional(),
  avaliacao: z.number().min(0).max(10).optional(),
  observacoes: z.string().optional(),
  arquivoUrl: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type Inference
export type Processo = z.infer<typeof ProcessoSchema>;
export type Funcao = z.infer<typeof FuncaoSchema>;
export type Convite = z.infer<typeof ConviteSchema>;
export type Candidato = z.infer<typeof CandidatoSchema>;

// Helpers para validação

/**
 * Valida dados contra um schema e lança erro se inválido
 * @param schema - Schema Zod para validação
 * @param data - Dados a serem validados
 * @returns Dados validados
 * @throws ZodError se validação falhar
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validação falhou: ${messages}`);
    }
    throw error;
  }
}

/**
 * Valida dados contra um schema de forma segura
 * Retorna {success: true, data} ou {success: false, errors}
 * @param schema - Schema Zod para validação
 * @param data - Dados a serem validados
 * @returns Resultado da validação
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  result.error.errors.forEach(error => {
    const path = error.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(error.message);
  });

  return { success: false, errors };
}

// Schemas para formulários (versões sem ID e timestamps)
export const ProcessoFormSchema = ProcessoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const FuncaoFormSchema = FuncaoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ConviteFormSchema = ConviteSchema.omit({
  id: true,
  dataEnvio: true,
  createdAt: true,
});

export const CandidatoFormSchema = CandidatoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export de tipos de formulário
export type ProcessoForm = z.infer<typeof ProcessoFormSchema>;
export type FuncaoForm = z.infer<typeof FuncaoFormSchema>;
export type ConviteForm = z.infer<typeof ConviteFormSchema>;
export type CandidatoForm = z.infer<typeof CandidatoFormSchema>;
