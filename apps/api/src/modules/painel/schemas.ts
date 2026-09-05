import { z } from 'zod'

/* Os enums são os mesmos do Prisma e das listas `as const` da tela. Repetidos
 * aqui em Zod porque é deste arquivo que saem o OpenAPI e, por ele, os tipos
 * do front — a fonte da verdade do contrato da API. */

export const statusClienteSchema = z.enum([
  'ativo',
  'onboarding',
  'em_risco',
  'inativo',
])

export const planoClienteSchema = z.enum(['growth', 'profissional', 'business'])

export const cicloPlanoSchema = z.enum(['mensal', 'anual'])

export const colunaPipelineSchema = z.enum([
  'nao_iniciado',
  'em_andamento',
  'aguardando_cliente',
  'em_revisao',
  'bloqueado',
  'concluido',
])

export const etapaFunilSchema = z.enum([
  'onboarding',
  'briefing_diagnostico',
  'estrategia',
  'copy',
  'design',
  'construcao_funil',
  'pipeline',
  'automacoes',
  'testes_revisao',
  'publicacao',
])

export const tipoArquivoSchema = z.enum([
  'drive',
  'docs',
  'sheets',
  'slides',
  'figma',
  'notion',
  'canva',
  'dropbox',
  'loom',
  'claude',
  'outro',
])

export const papelSchema = z.enum(['administrador', 'editor', 'visualizador'])

export const avatarSchema = z.enum([
  'estrela',
  'espinho',
  'losango',
  'capsula',
  'gota',
  'coracao',
  'bolha',
])

export const grupoChecklistSchema = z.enum([
  'base',
  'produtos',
  'publico',
  'empresa',
  'paginas',
  'campanhas',
  'ferramentas',
  'objetivo',
])

export const tipoAnotacaoSchema = z.enum(['postit', 'emoji', 'comentario'])

export const corAnotacaoSchema = z.enum([
  'amarelo',
  'rosa',
  'azul',
  'verde',
  'roxo',
  'laranja',
])

// ─── Entidades ────────────────────────────────────────────────

export const clienteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string(),
  status: statusClienteSchema,
  /** Nulo nos clientes cadastrados antes de o plano existir na ficha. */
  plano: planoClienteSchema.nullable(),
  cicloPlano: cicloPlanoSchema.nullable(),
  /** Quantas entregas o cliente contratou; 0 = sem meta combinada. */
  funisContratados: z.number().int().min(0),
})

export const funilSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  nome: z.string(),
  etapa: etapaFunilSchema,
  status: colunaPipelineSchema,
  responsaveis: z.array(z.string()),
  /** AAAA-MM-DD, como o resto das datas da tela. */
  dataEntrega: z.string().nullable(),
})

export const arquivoSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  tipo: tipoArquivoSchema,
  nome: z.string(),
  url: z.string(),
})

export const acessoSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  plataforma: z.string(),
  email: z.string(),
  senha: z.string(),
  url: z.string().nullable(),
})

export const notaSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  autorId: z.string(),
  autor: z.string(),
  criadaEm: z.string(),
  texto: z.string(),
})

export const itemChecklistSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  grupo: grupoChecklistSchema,
  titulo: z.string(),
  descricao: z.string().optional(),
  recebido: z.boolean(),
  link: z.string().nullable(),
})

export const anotacaoSchema = z.object({
  id: z.string(),
  tipo: tipoAnotacaoSchema,
  x: z.number(),
  y: z.number(),
  texto: z.string(),
  cor: corAnotacaoSchema,
  autorId: z.string(),
  autor: z.string(),
})

export const administradorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  cargo: z.string(),
  email: z.string().nullable(),
  papel: papelSchema,
  ativo: z.boolean(),
  avatar: avatarSchema,
  /** Se a pessoa já tem conta para entrar no painel. */
  temAcesso: z.boolean(),
})

/* Uma coisa que aconteceu no painel. */
export const atividadeSchema = z.object({
  id: z.string(),
  autor: z.string(),
  /** `cliente_criado`, `entrega_criada`… a tela monta a frase. */
  acao: z.string(),
  alvo: z.string(),
  detalhe: z.string().nullable(),
  criadoEm: z.string(),
})

export const atividadesSchema = z.object({
  atividades: z.array(atividadeSchema),
})

/* Invoice emitido pelo painel, com as linhas da descrição. */
export const itemInvoiceSchema = z.object({
  id: z.string(),
  fornecedor: z.string(),
  quantidade: z.string(),
  /** Valor total da linha, em reais. */
  valor: z.number(),
})

export const invoiceSchema = z.object({
  id: z.string(),
  numero: z.string(),
  /** AAAA-MM-DD, como o resto das datas da tela. */
  data: z.string(),
  nome: z.string(),
  cpf: z.string(),
  email: z.string(),
  telefone: z.string(),
  endereco: z.string(),
  itens: z.array(itemInvoiceSchema),
  criadoEm: z.string(),
})

export const invoicesSchema = z.object({ invoices: z.array(invoiceSchema) })

/* Na gravação os itens vêm sem id: eles são reescritos por inteiro a cada
 * salvamento, então não há o que casar com o que já existe. */
export const invoiceInputSchema = invoiceSchema
  .omit({ id: true, criadoEm: true, itens: true })
  .extend({
    itens: z.array(itemInvoiceSchema.omit({ id: true })),
  })

/* Uma entrada no painel, gravada no momento do login. */
export const acessoEquipeSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string(),
  /** ISO completo: a tela formata a data e a hora. */
  entradaEm: z.string(),
  /** Navegador e sistema lidos do user-agent; nulos quando ele não veio. */
  navegador: z.string().nullable(),
  sistema: z.string().nullable(),
  ip: z.string().nullable(),
})

export const acessosEquipeSchema = z.object({
  acessos: z.array(acessoEquipeSchema),
})

// ─── Retrato completo do painel ───────────────────────────────

/** Tudo que a tela precisa para montar, em uma chamada só. */
export const painelSchema = z.object({
  clientes: z.array(clienteSchema),
  funis: z.array(funilSchema),
  arquivos: z.array(arquivoSchema),
  acessos: z.array(acessoSchema),
  notas: z.array(notaSchema),
  checklists: z.array(itemChecklistSchema),
  anotacoes: z.array(anotacaoSchema),
  administradores: z.array(administradorSchema),
})

// ─── Entradas ─────────────────────────────────────────────────

export const clienteInputSchema = clienteSchema.omit({ id: true })
export const clientePatchSchema = clienteInputSchema.partial()

export const funilInputSchema = funilSchema.omit({ id: true })
export const funilPatchSchema = funilInputSchema.partial()

export const arquivoInputSchema = arquivoSchema.omit({ id: true })
export const acessoInputSchema = acessoSchema.omit({ id: true })
export const notaInputSchema = z.object({
  clienteId: z.string(),
  texto: z.string().min(1),
})

export const itemChecklistPatchSchema = z.object({
  recebido: z.boolean().optional(),
  link: z.string().nullable().optional(),
})

export const anotacaoInputSchema = anotacaoSchema.omit({
  id: true,
  autorId: true,
  autor: true,
})
export const anotacaoPatchSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    texto: z.string(),
    cor: corAnotacaoSchema,
  })
  .partial()

/* Cadastrar alguém na equipe é criar o acesso dessa pessoa: a senha é
 * obrigatória e a conta nasce junto com a ficha. */
export const administradorInputSchema = administradorSchema
  .omit({ id: true, temAcesso: true })
  .extend({
    email: z.string().email('Informe um e-mail válido'),
    senha: z.string().min(6, 'A senha precisa de ao menos 6 caracteres'),
  })

/* Na edição a senha só aparece para quem ainda não tem conta (a equipe
 * cadastrada antes desta regra) — é o que cria o acesso que faltava. */
export const administradorPatchSchema = administradorSchema
  .omit({ id: true, temAcesso: true })
  .partial()
  .extend({ senha: z.string().min(6).optional() })

/** Erro padrão do painel. */
export const erroSchema = z.object({ error: z.string() })

/** Confirmação de exclusão. */
export const okSchema = z.object({ ok: z.boolean() })

export type Painel = z.infer<typeof painelSchema>
export type ClienteDTO = z.infer<typeof clienteSchema>
export type FunilDTO = z.infer<typeof funilSchema>
export type ArquivoDTO = z.infer<typeof arquivoSchema>
export type AcessoDTO = z.infer<typeof acessoSchema>
export type NotaDTO = z.infer<typeof notaSchema>
export type ItemChecklistDTO = z.infer<typeof itemChecklistSchema>
export type AnotacaoDTO = z.infer<typeof anotacaoSchema>
export type AdministradorDTO = z.infer<typeof administradorSchema>
export type AcessoEquipeDTO = z.infer<typeof acessoEquipeSchema>
export type AtividadeDTO = z.infer<typeof atividadeSchema>
export type InvoiceDTO = z.infer<typeof invoiceSchema>
export type InvoiceInput = z.infer<typeof invoiceInputSchema>
