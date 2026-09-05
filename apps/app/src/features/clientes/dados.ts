/* /clientes — modelo e base da tela de clientes.
 *
 *
 * Atenção: o `clickmax-site` é público (S3/CloudFront) e este arquivo vai
 * inteiro para o bundle. Dado de cliente commitado aqui fica acessível a quem
 * abrir a página. Quando a lista crescer, o certo é buscá-la em runtime, por
 * uma chamada autenticada. */

export const STATUS_CLIENTE = [
  'ativo',
  'onboarding',
  'em_risco',
  'inativo',
] as const

export type StatusCliente = (typeof STATUS_CLIENTE)[number]

/* Responsável padrão dos funis, enquanto o time não vem da API. */
export const RESPONSAVEL_PADRAO = 'Amanda Merien'

/* O plano que o cliente assina, e de quanto em quanto tempo ele paga. */
export const PLANOS_CLIENTE = ['growth', 'profissional', 'business'] as const

export type PlanoCliente = (typeof PLANOS_CLIENTE)[number]

export const PLANO_LABEL: Record<PlanoCliente, string> = {
  growth: 'Growth',
  profissional: 'Profissional',
  business: 'Business',
}

export const CLASSES_PLANO: Record<PlanoCliente, string> = {
  growth: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  profissional: 'bg-violet-400/10 text-violet-300 ring-violet-400/20',
  business: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
}

export const CICLOS_PLANO = ['mensal', 'anual'] as const

export type CicloPlano = (typeof CICLOS_PLANO)[number]

export const CICLO_PLANO_LABEL: Record<CicloPlano, string> = {
  mensal: 'Mensal',
  anual: 'Anual',
}

export interface Cliente {
  id: string
  nome: string
  email: string
  status: StatusCliente
  /* Nulo nos clientes cadastrados antes de o plano entrar na ficha — melhor
     mostrar "—" do que chutar um plano comercial. */
  plano: PlanoCliente | null
  cicloPlano: CicloPlano | null
  /* Quantas entregas o cliente contratou. Zero = não há meta combinada, e a
     ficha simplesmente não mostra progresso. */
  funisContratados: number
}

export const STATUS_LABEL: Record<StatusCliente, string> = {
  ativo: 'Ativo',
  onboarding: 'Onboarding',
  em_risco: 'Em risco',
  inativo: 'Inativo',
}

/* Cor do badge de status — uma classe por estado, para não repetir
 * condicional em cada tela que mostra o status. */
export const CLASSES_STATUS: Record<StatusCliente, string> = {
  ativo: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  onboarding: 'bg-violet-400/10 text-violet-300 ring-violet-400/20',
  em_risco: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  inativo: 'bg-white/6 text-[#8A8A8F] ring-white/10',
}

/* ---------------------------------------------------------------------------
 * Pipeline
 *
 * Quadro de colunas com o andamento do trabalho. Os cards são os próprios
 * funis — não há cadastro aqui: o funil entra em Funis e aparece no quadro,
 * onde anda de uma coluna para a outra. */

export const COLUNAS_PIPELINE = [
  'nao_iniciado',
  'em_andamento',
  'aguardando_cliente',
  'em_revisao',
  'bloqueado',
  'concluido',
] as const

export type ColunaPipeline = (typeof COLUNAS_PIPELINE)[number]

export const COLUNA_PIPELINE_LABEL: Record<ColunaPipeline, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  aguardando_cliente: 'Aguardando cliente',
  em_revisao: 'Em revisão',
  bloqueado: 'Bloqueado',
  concluido: 'Concluído',
}

/* Cor do título de cada coluna, para bater o olho e achar a etapa. */
export const CLASSES_COLUNA: Record<ColunaPipeline, string> = {
  nao_iniciado: 'text-[#8A8A8F]',
  em_andamento: 'text-sky-300',
  aguardando_cliente: 'text-amber-300',
  em_revisao: 'text-violet-300',
  bloqueado: 'text-rose-300',
  concluido: 'text-emerald-300',
}

/* ---------------------------------------------------------------------------
 * Funis
 *
 * Cada cliente tem N funis em construção com o time. A etapa diz onde o
 * processo está; o status, como ele está. */

export const ETAPAS_FUNIL = [
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
] as const

export type EtapaFunil = (typeof ETAPAS_FUNIL)[number]

export const ETAPA_FUNIL_LABEL: Record<EtapaFunil, string> = {
  onboarding: 'Onboarding',
  briefing_diagnostico: 'Briefing e diagnóstico',
  estrategia: 'Estratégia',
  copy: 'Copy',
  design: 'Design',
  construcao_funil: 'Construção do funil',
  pipeline: 'Pipeline',
  automacoes: 'Automações',
  testes_revisao: 'Testes e revisão',
  publicacao: 'Publicação',
}

/* Cor do selo de cada etapa, no mesmo padrão dos outros badges do painel:
 * fundo e texto da mesma família, com um anel de contorno bem fraco. */
export const CLASSES_ETAPA: Record<EtapaFunil, string> = {
  onboarding: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  briefing_diagnostico: 'bg-violet-400/10 text-violet-300 ring-violet-400/20',
  estrategia: 'bg-indigo-400/10 text-indigo-300 ring-indigo-400/20',
  copy: 'bg-pink-400/10 text-pink-300 ring-pink-400/20',
  design: 'bg-fuchsia-400/10 text-fuchsia-300 ring-fuchsia-400/20',
  construcao_funil: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  pipeline: 'bg-orange-400/10 text-orange-300 ring-orange-400/20',
  automacoes: 'bg-teal-400/10 text-teal-300 ring-teal-400/20',
  testes_revisao: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/20',
  publicacao: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
}

/* Barra colorida do topo de cada coluna da Pipeline. */
export const CLASSES_BARRA_COLUNA: Record<ColunaPipeline, string> = {
  nao_iniciado: 'bg-[#5A5A61]',
  em_andamento: 'bg-sky-400',
  aguardando_cliente: 'bg-amber-400',
  em_revisao: 'bg-violet-400',
  bloqueado: 'bg-rose-400',
  concluido: 'bg-emerald-400',
}

/* O status do funil é a coluna da Pipeline.
 *
 * Eram duas listas de estado para a mesma coisa — mudar o status na tabela de
 * Funis não movia o card no quadro, e mover o card não mudava o status. Agora
 * é um campo só: mexer em qualquer uma das duas telas mexe na outra. */
export const STATUS_FUNIL = COLUNAS_PIPELINE
export type StatusFunil = ColunaPipeline
export const STATUS_FUNIL_LABEL = COLUNA_PIPELINE_LABEL

/* Mesmas cores dos títulos das colunas, em formato de selo. */
export const CLASSES_STATUS_FUNIL: Record<StatusFunil, string> = {
  nao_iniciado: 'bg-white/6 text-[#ABABAB] ring-white/12',
  em_andamento: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  aguardando_cliente: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  em_revisao: 'bg-violet-400/10 text-violet-300 ring-violet-400/20',
  bloqueado: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  concluido: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
}

export interface Funil {
  id: string
  clienteId: string
  nome: string
  etapa: EtapaFunil
  status: StatusFunil
  /* Quem do time responde por esta entrega. Pode ser mais de uma pessoa. */
  responsaveis: string[]
  /* Data de entrega prevista, em ISO (YYYY-MM-DD). `null` enquanto não
     houver data combinada. */
  dataEntrega: string | null
}

/* Começa vazio: os funis reais entram pelo cadastro da tela. */

/* Progresso de 0 a 100 pela posição da etapa na sequência. */
export function progressoDaEtapa(etapa: EtapaFunil) {
  const posicao = ETAPAS_FUNIL.indexOf(etapa)
  return Math.round(((posicao + 1) / ETAPAS_FUNIL.length) * 100)
}

/* Os meses do filtro do Dashboard: o atual e os doze seguintes.
 *
 * Vai para a frente, não para trás, porque o que se filtra é a data prevista
 * de entrega — o interesse é no que ainda vai vencer. O mês corrente entra
 * junto para as entregas deste mês não ficarem inalcançáveis.
 *
 * Guardados como AAAA-MM, o mesmo prefixo da data de entrega. */
export interface MesDoFiltro {
  valor: string
  rotulo: string
}

export function mesesDoFiltro(hoje = new Date()): MesDoFiltro[] {
  return Array.from({ length: 13 }, (_, passo) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + passo, 1)
    const mes = `${data.getMonth() + 1}`.padStart(2, '0')

    return {
      valor: `${data.getFullYear()}-${mes}`,
      rotulo: data.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
    }
  })
}

/* Filtra as entregas pela data prevista. Entrega sem data combinada fica de
 * fora de qualquer mês — ela ainda não pertence a nenhum. */
export function funisDoMes(funis: Funil[], mes: string) {
  if (!mes) return funis
  return funis.filter((funil) => funil.dataEntrega?.startsWith(mes))
}

/* Progresso do funil como um todo. Entregue é 100% por definição: o trabalho
 * acabou, não importa em que etapa da esteira ele parou. */
export function progressoDoFunil(funil: {
  etapa: EtapaFunil
  status: StatusFunil
}) {
  return funil.status === 'concluido' ? 100 : progressoDaEtapa(funil.etapa)
}

/* ---------------------------------------------------------------------------
 * Arquivos do cliente
 *
 * Links para material que vive fora daqui — Drive, Notion, Figma. Guardamos
 * só o rótulo e a URL; nada é hospedado nesta tela. */

/* Onde o material do cliente costuma morar. Escolher um destes já nomeia o
   link e dá o ícone; "outro" abre o campo para digitar o nome. */
export const TIPOS_ARQUIVO = [
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
] as const

export type TipoArquivo = (typeof TIPOS_ARQUIVO)[number]

export const TIPO_ARQUIVO_LABEL: Record<TipoArquivo, string> = {
  drive: 'Drive',
  docs: 'Docs',
  sheets: 'Sheets',
  slides: 'Slides',
  figma: 'Figma',
  notion: 'Notion',
  canva: 'Canva',
  dropbox: 'Dropbox',
  loom: 'Loom',
  claude: 'Claude',
  outro: 'Outro',
}

export interface ArquivoCliente {
  id: string
  clienteId: string
  tipo: TipoArquivo
  /* Como o arquivo é chamado na conversa. Nos tipos conhecidos é o próprio
     rótulo ("Drive"); em "outro", o que a pessoa digitou. */
  nome: string
  url: string
}

/* Começa vazio: os links entram pelo painel do cliente. */

/* Arquivos de um cliente, na ordem em que foram adicionados. */
export function arquivosDoCliente(
  arquivos: ArquivoCliente[],
  clienteId: string,
) {
  return arquivos.filter((arquivo) => arquivo.clienteId === clienteId)
}

/* ---------------------------------------------------------------------------
 * Acessos do cliente
 *
 * As contas que o time precisa para trabalhar: Panda, Meta Business, Hotmart,
 * o que for. A ideia é não caçar senha no WhatsApp toda vez.
 *
 * ATENÇÃO — enquanto não houver servidor, isto NÃO é um cofre de senhas.
 * O que for digitado aqui vive na memória da aba e some ao recarregar. Não
 * commite senha real neste arquivo e não guarde senha real no navegador: o
 * `clickmax-site` é público e a tela não tem autenticação de verdade (ver
 * `tela-login.tsx`). Guardar credencial de cliente com segurança pede um
 * backend com cofre e registro de quem leu o quê — até lá, use isto para
 * organizar QUAIS acessos faltam, e mantenha a senha no gerenciador de senhas
 * da equipe. */

export interface AcessoCliente {
  id: string
  clienteId: string
  /* Nome da plataforma: "Panda Video", "Meta Business", "Hotmart". */
  plataforma: string
  /* E-mail de acesso. */
  email: string
  senha: string
  /* Link de entrada da plataforma. `null` quando não foi informado. */
  url: string | null
}

export function acessosDoCliente(acessos: AcessoCliente[], clienteId: string) {
  return acessos.filter((acesso) => acesso.clienteId === clienteId)
}

/* ---------------------------------------------------------------------------
 * Anotações do cliente
 *
 * Recado curto preso à ficha: o que ficou combinado na reunião, o que está
 * pendente com o cliente. Diferente do mural, que é do time inteiro e solto no
 * quadro — esta só existe dentro do cliente. */

export interface NotaCliente {
  id: string
  clienteId: string
  /* Id do administrador, para achar o avatar; o nome vai junto para a nota não
     ficar sem assinatura se a pessoa sair da equipe. */
  autorId: string
  autor: string
  /* AAAA-MM-DD, como o resto das datas do arquivo. */
  criadaEm: string
  texto: string
}

export function notasDoCliente(notas: NotaCliente[], clienteId: string) {
  return notas.filter((nota) => nota.clienteId === clienteId)
}

/* Data de hoje em AAAA-MM-DD, no fuso de quem está usando a tela. */
export function hojeIso(hoje = new Date()) {
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${hoje.getFullYear()}-${mes}-${dia}`
}

/* ---------------------------------------------------------------------------
 * Administradores
 *
 * O time. É daqui que sai a lista do campo "Responsável" dos funis.
 *
 * O papel define o que a pessoa pode fazer. `PERMISSOES` é a regra escrita:
 * hoje ela só descreve — nada na interface é bloqueado, porque ainda não há
 * login para dizer quem está usando a tela. Quando o login entrar, é este mapa
 * que a interface vai consultar. */

export const PAPEIS = ['administrador', 'editor', 'visualizador'] as const

export type Papel = (typeof PAPEIS)[number]

export const PAPEL_LABEL: Record<Papel, string> = {
  administrador: 'Administrador',
  editor: 'Editor',
  visualizador: 'Visualizador',
}

export interface Permissoes {
  /* Adicionar e excluir pessoas da equipe, e definir o papel de cada uma. */
  gerenciarEquipe: boolean
  adicionarCliente: boolean
  editarCliente: boolean
  adicionarFunil: boolean
}

export const PERMISSOES: Record<Papel, Permissoes> = {
  administrador: {
    gerenciarEquipe: true,
    adicionarCliente: true,
    editarCliente: true,
    adicionarFunil: true,
  },
  editor: {
    gerenciarEquipe: false,
    adicionarCliente: true,
    editarCliente: true,
    adicionarFunil: true,
  },
  /* Só leitura: enxerga todas as telas, não altera nada. */
  visualizador: {
    gerenciarEquipe: false,
    adicionarCliente: false,
    editarCliente: false,
    adicionarFunil: false,
  },
}

/* Cor do badge de cada papel. */
export const CLASSES_PAPEL: Record<Papel, string> = {
  administrador: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  editor: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  visualizador: 'bg-white/6 text-[#ABABAB] ring-white/12',
}

export const PAPEL_DESCRICAO: Record<Papel, string> = {
  administrador:
    'Faz tudo: adiciona e exclui pessoas da equipe e define o papel de cada uma.',
  editor: 'Adiciona e edita clientes e adiciona funis. Não mexe na equipe.',
  visualizador:
    'Vê todas as telas, mas não cadastra, não edita e não exclui nada.',
}

/* Avatares — bichinhos de pixel que identificam a pessoa onde não cabe o nome
   inteiro: no selo do comentário do mural, na lista da equipe. O desenho de
   cada um está em `avatares.tsx`. */

export const AVATARES = [
  'estrela',
  'espinho',
  'losango',
  'capsula',
  'gota',
  'coracao',
  'bolha',
] as const

export type AvatarId = (typeof AVATARES)[number]

export const AVATAR_LABEL: Record<AvatarId, string> = {
  estrela: 'Estrela vermelha',
  espinho: 'Espinho amarelo',
  losango: 'Losango verde',
  capsula: 'Cápsula azul',
  gota: 'Gota roxa',
  coracao: 'Coração rosa',
  bolha: 'Bolha ciano',
}

export interface Administrador {
  id: string
  nome: string
  cargo: string
  /* É por ele que a pessoa vai entrar quando houver login. `null` enquanto
     não foi informado. */
  email: string | null
  papel: Papel
  /* Desligado, a pessoa continua cadastrada mas sem acesso — serve para
     suspender alguém sem perder o histórico. */
  ativo: boolean
  avatar: AvatarId
  /* Se a pessoa já tem conta para entrar. Cadastro novo sempre nasce com
     acesso; só a equipe cadastrada antes dessa regra pode estar sem. */
  temAcesso?: boolean
}

/* 04/09/2026 — travessão quando não há data. */
export function formatarData(iso: string | null) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

/* Dias inteiros entre hoje e a data (negativo = já passou). */
export function diasAte(iso: string, hoje = new Date()) {
  const alvo = new Date(`${iso}T12:00:00`)
  const referencia = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
    12,
  )
  return Math.round((alvo.getTime() - referencia.getTime()) / 86_400_000)
}

/* Quantos funis há em cada etapa da esteira. */
export function funisPorEtapa(funis: Funil[]) {
  return ETAPAS_FUNIL.map((etapa) => ({
    etapa,
    total: funis.filter((funil) => funil.etapa === etapa).length,
  }))
}

/* Um mês do gráfico de entregas, já com a quebra por responsável. */
export interface MesDeEntregas {
  chave: string
  rotulo: string
  total: number
  porResponsavel: { responsavel: string; total: number }[]
}

/* Funis entregues em cada um dos últimos `meses` meses, do mais antigo ao mais
 * recente. Só entra quem tem data de entrega: sem data não há mês. */
export function entreguesPorMes(
  funis: Funil[],
  meses = 6,
  hoje = new Date(),
): MesDeEntregas[] {
  const formatador = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

  return Array.from({ length: meses }, (_, indice) => {
    const referencia = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - (meses - 1 - indice),
      1,
    )
    const chave = `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, '0')}`

    const doMes = funis.filter(
      (funil) =>
        funil.status === 'concluido' && funil.dataEntrega?.startsWith(chave),
    )

    return {
      chave,
      rotulo: formatador.format(referencia).replace('.', ''),
      total: doMes.length,
      porResponsavel: funisPorResponsavel(doMes),
    }
  })
}

/* Quantos funis cada responsável tem, do maior para o menor. */
/* Carga de cada pessoa. Entrega com duas mãos conta para as duas — o número
 * responde "quantas entregas estão comigo?", não "como o total se divide". */
export function funisPorResponsavel(funis: Funil[]) {
  const contagem = new Map<string, number>()

  for (const funil of funis) {
    for (const nome of responsaveisDoFunil(funil)) {
      contagem.set(nome, (contagem.get(nome) ?? 0) + 1)
    }
  }

  return [...contagem.entries()]
    .map(([responsavel, total]) => ({ responsavel, total }))
    .sort((a, b) => b.total - a.total)
}

/* Tipos de funil que o time monta. Servem de atalho no cadastro; o que não
 * estiver aqui entra por "Outros", digitando o nome. */
export const TIPOS_FUNIL = [
  'Funil de Isca',
  'Newsletter',
  'VSL',
  'Tripwire',
  'Funil de Upsell e Downsell',
  'Webinário',
  'Webinário Pago',
  'Exposição',
  'Desafio',
  'Aplicação',
  'Diagnóstico',
] as const

/* Valor da opção que libera o campo de texto livre. */
export const TIPO_FUNIL_OUTROS = 'outros'

/* O nome gravado sempre diz que é funil: "Diagnóstico" sozinho não identifica
 * nada quando aparece na pipeline ou na ficha do cliente. Os tipos que já
 * começam com "Funil" ficam como estão — senão viraria "Funil Funil de Isca".
 * O que a pessoa digita em "Outros" não ganha prefixo: se não é um funil da
 * lista, é outra coisa. */
export function nomeDoTipoDeFunil(tipo: string) {
  return tipo.startsWith('Funil') ? tipo : `Funil ${tipo}`
}

/* Caminho inverso, para o formulário reabrir no tipo certo: tira o prefixo e
 * procura na lista. Nome que não bate com nenhum tipo é texto livre. */
export function tipoDoNomeDeFunil(nome: string): string | null {
  const tipos = TIPOS_FUNIL as readonly string[]
  if (tipos.includes(nome)) return nome

  const semPrefixo = nome.replace(/^Funil\s+/, '')
  return tipos.includes(semPrefixo) ? semPrefixo : null
}

/* O "responsável" do funil guarda o nome, não o id. Quando o nome bate com
   alguém da equipe, dá para mostrar o avatar ao lado; quando não bate (pessoa
   excluída, nome digitado à mão), volta `null` e só o nome aparece. */
export function avatarDoResponsavel(
  administradores: Administrador[],
  nome: string,
): AvatarId | null {
  return administradores.find((pessoa) => pessoa.nome === nome)?.avatar ?? null
}

/* Só os nomes que a lista traz, na ordem em que foram escolhidos. Serve para a
 * tela não ter que se preocupar com entrega sem responsável. */
export function responsaveisDoFunil(funil: { responsaveis: string[] }) {
  return funil.responsaveis.filter((nome) => nome.trim() !== '')
}

/* Administradores primeiro, editores depois; dentro de cada grupo, a ordem de
 * cadastro. */
export function ordenarAdministradores(administradores: Administrador[]) {
  const peso = (papel: Papel) => (papel === 'administrador' ? 0 : 1)
  return [...administradores].sort((a, b) => peso(a.papel) - peso(b.papel))
}

/* ---------------------------------------------------------------------------
 * Checklist de onboarding
 *
 * Transcrição do documento que o time envia ao cliente ("Checklist de
 * Onboarding"). As oito seções, os textos de abertura e os itens de cada uma
 * saem de lá — este é o lugar de editar quando o documento mudar. */

export const INTRO_CHECKLIST =
  'Para começarmos a estruturar sua operação, precisamos reunir as informações que já existem sobre clientes, vendas, produtos, campanhas e funis. O objetivo é centralizar esses dados para identificar oportunidades de receita, estruturar os novos funis e permitir que automações e IA trabalhem com o contexto real da empresa.'

export const FECHAMENTO_CHECKLIST =
  'Com os materiais em mãos, consolidamos os dados e montamos a visão inicial da operação: quem está na base, o que essas pessoas já compraram, o que vocês vendem, para quem deveriam vender, quais ativos já existem e onde estão as maiores oportunidades de receita. É daí que sai a estratégia de funis, campanhas, automações e abordagem comercial.'

export const GRUPOS_CHECKLIST = [
  'base',
  'produtos',
  'publico',
  'empresa',
  'paginas',
  'campanhas',
  'ferramentas',
  'objetivo',
] as const

export type GrupoChecklist = (typeof GRUPOS_CHECKLIST)[number]

interface DefinicaoGrupo {
  titulo: string
  descricao: string
  /* Observação de rodapé da seção, quando o documento traz uma. */
  nota?: string
}

export const GRUPO_CHECKLIST: Record<GrupoChecklist, DefinicaoGrupo> = {
  base: {
    titulo: 'Base de clientes, leads e transações',
    descricao:
      'Todos os dados disponíveis de clientes, leads e transações, de preferência em CSV ou Excel.',
    nota: 'Não precisa organizar nem juntar os arquivos antes de enviar — pode mandar separado por plataforma que nós consolidamos.',
  },
  produtos: {
    titulo: 'Produtos e ofertas',
    descricao:
      'Materiais que ajudem a entender os produtos e as ofertas que serão trabalhados.',
    nota: 'Não é preciso produzir material novo: envie o que vocês já usam hoje.',
  },
  publico: {
    titulo: 'Público e ICP',
    descricao:
      'Quem é o cliente ideal de cada produto. ICP é Ideal Customer Profile, o perfil de cliente ideal.',
    nota: 'Se não existir um documento formal de ICP, tudo bem: campanhas, apresentações, vídeos e páginas de vendas ajudam a reconstruir esse contexto.',
  },
  empresa: {
    titulo: 'Empresa e tom de voz',
    descricao:
      'Materiais que representem a linguagem da empresa — é o que ensina às IAs e automações como vocês pensam, vendem e se comunicam.',
  },
  paginas: {
    titulo: 'Sites, páginas e funis existentes',
    descricao:
      'Os links de tudo que já existe ligado aos produtos e campanhas que vamos trabalhar.',
    nota: 'Se houver campanhas ligadas a essas páginas, envie também os materiais e os resultados disponíveis.',
  },
  campanhas: {
    titulo: 'Campanhas e automações existentes',
    descricao:
      'O que já está sendo feito hoje, para entendermos antes de construir a nova operação.',
  },
  ferramentas: {
    titulo: 'Integrações e migrações para reduzir custos',
    descricao:
      'Quais ferramentas vocês usam hoje, para que serve cada uma e quanto custam por mês. Com isso mapeamos o que pode ser substituído, integrado ou centralizado no Clickmax.',
    nota: 'Exemplos do que costumamos substituir: GoHighLevel, ActiveCampaign, Curseduca, Circle, ClickFunnels, Zapier, Funnelytics, ManyChat, Pipedrive, Inleads e Calendly. Inclua qualquer outra ferramenta, mesmo as pequenas.',
  },
  objetivo: {
    titulo: 'Objetivo do projeto',
    descricao:
      'O que vocês querem alcançar: aumentar vendas para a base, vender um produto específico, gerar oportunidades, aumentar agendamentos, recuperar leads antigos, aumentar LTV, automatizar uma campanha, criar um novo funil ou melhorar a conversão do comercial.',
  },
}

interface ModeloItem {
  grupo: GrupoChecklist
  titulo: string
  descricao?: string
}

/* Um item por linha do documento, na mesma ordem. */
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

export interface ItemChecklist {
  id: string
  clienteId: string
  grupo: GrupoChecklist
  titulo: string
  descricao?: string
  recebido: boolean
  /* Onde o material foi parar: link do Drive, do Figma, do que for. */
  link: string | null
}

/* Cria a cópia do modelo para um cliente. */
export function criarChecklist(clienteId: string): ItemChecklist[] {
  return MODELO_CHECKLIST.map((modelo, indice) => ({
    ...modelo,
    id: `chk-${clienteId}-${indice}`,
    clienteId,
    recebido: false,
    link: null,
  }))
}

/* Itens de um cliente. Se ele ainda não tem checklist, devolve uma cópia nova
 * do modelo — assim a tela nunca aparece vazia. */
export function checklistDoCliente(
  itens: ItemChecklist[],
  clienteId: string,
): ItemChecklist[] {
  const existentes = itens.filter((item) => item.clienteId === clienteId)
  return existentes.length > 0 ? existentes : criarChecklist(clienteId)
}

export interface ProgressoChecklist {
  recebidos: number
  total: number
  percentual: number
}

export function progressoDoChecklist(
  itens: ItemChecklist[],
): ProgressoChecklist {
  const recebidos = itens.filter((item) => item.recebido).length

  return {
    recebidos,
    total: itens.length,
    percentual: itens.length ? Math.round((recebidos / itens.length) * 100) : 0,
  }
}

/* ---------------------------------------------------------------------------
 * Mural de anotações
 *
 * Quadro pontilhado onde o time larga post-its, emojis e comentários. Tudo
 * fica posicionado livremente, em coordenadas relativas ao quadro. */

export const CORES_ANOTACAO = [
  'amarelo',
  'rosa',
  'azul',
  'verde',
  'roxo',
  'laranja',
] as const

export type CorAnotacao = (typeof CORES_ANOTACAO)[number]

/* A nota é branca; a cor escolhida fica no selo do topo e na paleta. */
export const CLASSES_ANOTACAO: Record<CorAnotacao, string> = {
  amarelo: 'bg-[#F2C94C]',
  rosa: 'bg-[#EF95BF]',
  azul: 'bg-[#7FA8F0]',
  verde: 'bg-[#6FCF97]',
  roxo: 'bg-[#A98BE8]',
  laranja: 'bg-[#F2A65A]',
}

export const EMOJIS_MURAL = [
  '👍',
  '❤️',
  '🎉',
  '😂',
  '⭐',
  '🔥',
  '👀',
  '✅',
] as const

export type TipoAnotacao = 'postit' | 'emoji' | 'comentario'

export interface Anotacao {
  id: string
  tipo: TipoAnotacao
  /* Posição em porcentagem do quadro, para acompanhar o redimensionamento. */
  x: number
  y: number
  texto: string
  cor: CorAnotacao
  /* Quem criou. `autorId` é o id do administrador, usado para achar o avatar;
     `autor` guarda o nome como estava na criação, para a nota não ficar em
     branco se a pessoa for excluída da equipe depois. */
  autorId: string
  autor: string
}
