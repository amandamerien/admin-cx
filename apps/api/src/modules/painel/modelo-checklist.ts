import type { GrupoChecklist } from '@repo/database'

/** Uma linha do documento de onboarding. */
interface ModeloItem {
  grupo: GrupoChecklist
  titulo: string
  descricao?: string
}

/* O checklist que o time envia ao cliente, na ordem do documento. É o
 * servidor que copia este modelo para cada cliente novo — a tela só lê o que
 * já está no banco. Espelha MODELO_CHECKLIST de
 * apps/app/src/features/clientes/dados.ts. */
export const MODELO_CHECKLIST: ModeloItem[] = [
  { grupo: 'base', titulo: 'Exportação de clientes e vendas da Hotmart' },
  {
    grupo: 'base',
    titulo: 'Exportação de outros checkouts e plataformas de pagamento',
  },
  { grupo: 'base', titulo: 'Exportação do CRM' },
  { grupo: 'base', titulo: 'Exportação do ActiveCampaign' },
  { grupo: 'base', titulo: 'Listas de leads' },
  { grupo: 'base', titulo: 'Tags dos contatos' },
  { grupo: 'base', titulo: 'Histórico de compras' },
  { grupo: 'base', titulo: 'Histórico de transações' },
  {
    grupo: 'base',
    titulo: 'Status das transações',
    descricao: 'Quando disponível.',
  },
  { grupo: 'base', titulo: 'Produtos comprados' },
  { grupo: 'base', titulo: 'Datas das compras' },
  { grupo: 'base', titulo: 'Valores pagos' },
  {
    grupo: 'base',
    titulo: 'Dados de origem e campanha',
    descricao: 'Quando disponíveis.',
  },

  { grupo: 'produtos', titulo: 'Nome dos produtos' },
  { grupo: 'produtos', titulo: 'Descrição dos produtos' },
  { grupo: 'produtos', titulo: 'Preços' },
  { grupo: 'produtos', titulo: 'Formas de pagamento' },
  { grupo: 'produtos', titulo: 'Principais benefícios' },
  { grupo: 'produtos', titulo: 'Diferenciais' },
  { grupo: 'produtos', titulo: 'Objeções mais comuns' },
  { grupo: 'produtos', titulo: 'Ofertas atuais' },
  { grupo: 'produtos', titulo: 'Bônus' },
  { grupo: 'produtos', titulo: 'Garantias' },
  { grupo: 'produtos', titulo: 'Apresentações comerciais' },
  { grupo: 'produtos', titulo: 'PDFs' },
  { grupo: 'produtos', titulo: 'Scripts de venda' },
  { grupo: 'produtos', titulo: 'VSLs ou vídeos explicando o produto' },

  { grupo: 'publico', titulo: 'ICP' },
  { grupo: 'publico', titulo: 'Personas' },
  { grupo: 'publico', titulo: 'Público-alvo' },
  { grupo: 'publico', titulo: 'Segmentos de clientes' },
  { grupo: 'publico', titulo: 'Principais dores' },
  { grupo: 'publico', titulo: 'Principais desejos' },
  { grupo: 'publico', titulo: 'Motivos que levam alguém a comprar' },
  { grupo: 'publico', titulo: 'Objeções mais frequentes' },
  { grupo: 'publico', titulo: 'Características dos melhores clientes' },
  { grupo: 'publico', titulo: 'Pesquisas com clientes' },
  { grupo: 'publico', titulo: 'Entrevistas' },
  { grupo: 'publico', titulo: 'Depoimentos' },
  { grupo: 'publico', titulo: 'Cases' },

  { grupo: 'empresa', titulo: 'Apresentação institucional' },
  { grupo: 'empresa', titulo: 'Site institucional' },
  { grupo: 'empresa', titulo: 'Manifesto ou posicionamento da marca' },
  { grupo: 'empresa', titulo: 'Guia de marca ou tom de voz' },
  { grupo: 'empresa', titulo: 'Vídeos do fundador ou especialistas' },
  { grupo: 'empresa', titulo: 'Vídeos de vendas' },
  { grupo: 'empresa', titulo: 'Webinars' },
  { grupo: 'empresa', titulo: 'Aulas' },
  { grupo: 'empresa', titulo: 'E-mails' },
  { grupo: 'empresa', titulo: 'Mensagens de WhatsApp' },
  { grupo: 'empresa', titulo: 'Scripts usados pelo time comercial' },
  {
    grupo: 'empresa',
    titulo: 'Vídeo informal explicando o negócio',
    descricao:
      'O que a empresa faz, para quem vende, por que os clientes compram e como vocês gostam de se comunicar.',
  },

  { grupo: 'paginas', titulo: 'Site institucional' },
  { grupo: 'paginas', titulo: 'Landing pages' },
  { grupo: 'paginas', titulo: 'Páginas de captura' },
  { grupo: 'paginas', titulo: 'Páginas de diagnóstico' },
  { grupo: 'paginas', titulo: 'Quizzes' },
  { grupo: 'paginas', titulo: 'Páginas de vendas' },
  { grupo: 'paginas', titulo: 'VSLs' },
  { grupo: 'paginas', titulo: 'Webinars' },
  { grupo: 'paginas', titulo: 'Checkouts' },
  { grupo: 'paginas', titulo: 'Páginas de obrigado' },
  { grupo: 'paginas', titulo: 'Páginas de agendamento' },
  { grupo: 'paginas', titulo: 'Funis ativos' },
  { grupo: 'paginas', titulo: 'Funis antigos com bons resultados' },

  { grupo: 'campanhas', titulo: 'Campanhas de aquisição' },
  { grupo: 'campanhas', titulo: 'Campanhas de remarketing' },
  { grupo: 'campanhas', titulo: 'Sequências de e-mail' },
  { grupo: 'campanhas', titulo: 'Automações de WhatsApp' },
  { grupo: 'campanhas', titulo: 'Automações de Instagram' },
  { grupo: 'campanhas', titulo: 'Recuperação de leads' },
  { grupo: 'campanhas', titulo: 'Recuperação de checkout' },
  { grupo: 'campanhas', titulo: 'Campanhas para clientes existentes' },
  { grupo: 'campanhas', titulo: 'Scripts comerciais' },
  { grupo: 'campanhas', titulo: 'Fluxos do CRM' },
  { grupo: 'campanhas', titulo: 'Relatórios de campanhas anteriores' },

  {
    grupo: 'ferramentas',
    titulo: 'Lista das ferramentas usadas hoje',
    descricao:
      'Para cada uma: nome, para que usam, custo mensal aproximado e quais dados estão nela.',
  },

  { grupo: 'objetivo', titulo: 'Objetivo principal da operação' },
  { grupo: 'objetivo', titulo: 'Produto prioritário' },
  { grupo: 'objetivo', titulo: 'Meta de faturamento' },
  { grupo: 'objetivo', titulo: 'Ticket médio' },
  { grupo: 'objetivo', titulo: 'Prazo ou período da campanha' },
  { grupo: 'objetivo', titulo: 'Quantidade atual de leads' },
  { grupo: 'objetivo', titulo: 'Quantidade atual de clientes' },
  { grupo: 'objetivo', titulo: 'Meta de vendas' },
  { grupo: 'objetivo', titulo: 'Principais gargalos percebidos hoje' },
]
