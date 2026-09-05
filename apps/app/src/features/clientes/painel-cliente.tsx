import * as Dialog from '@radix-ui/react-dialog'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { cn } from '@repo/ui'
import {
  BadgeDollarSign,
  Check,
  ChevronDown,
  CircleDot,
  Cloud,
  ExternalLink,
  Figma,
  FileText,
  HardDrive,
  Link2,
  Mail,
  Maximize2,
  NotebookPen,
  Palette,
  PanelRight,
  Plus,
  Presentation,
  RectangleHorizontal,
  Table2,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AcessosCliente } from './acessos-cliente'
import { Avatar } from './avatares'
import {
  type AcessoCliente,
  type Administrador,
  type ArquivoCliente,
  CICLO_PLANO_LABEL,
  CICLOS_PLANO,
  CLASSES_PLANO,
  CLASSES_STATUS,
  CLASSES_STATUS_FUNIL,
  type Cliente,
  type Funil,
  formatarData,
  type NotaCliente,
  PLANO_LABEL,
  PLANOS_CLIENTE,
  STATUS_CLIENTE,
  STATUS_FUNIL_LABEL,
  STATUS_LABEL,
  TIPO_ARQUIVO_LABEL,
  TIPOS_ARQUIVO,
  type TipoArquivo,
} from './dados'
import { EstadoVazio } from './estado-vazio'

/* Ícone e cor de cada lugar onde o material costuma morar. Marca não tem
   ícone próprio no lucide: o que vale aqui é reconhecer o tipo de bate-pronto,
   então é um desenho genérico na cor da ferramenta. */
const ICONES_ARQUIVO: Record<
  TipoArquivo,
  { icone: typeof Link2; cor: string }
> = {
  drive: { icone: HardDrive, cor: 'text-amber-300' },
  docs: { icone: FileText, cor: 'text-sky-300' },
  sheets: { icone: Table2, cor: 'text-emerald-300' },
  slides: { icone: Presentation, cor: 'text-orange-300' },
  figma: { icone: Figma, cor: 'text-violet-300' },
  notion: { icone: NotebookPen, cor: 'text-[#D4D4D8]' },
  canva: { icone: Palette, cor: 'text-cyan-300' },
  dropbox: { icone: Cloud, cor: 'text-blue-300' },
  loom: { icone: Video, cor: 'text-fuchsia-300' },
  outro: { icone: Link2, cor: 'text-[#6F6F76]' },
}

/* As três frentes da ficha. Empilhadas, a ficha virava uma página longa de
 * rolar; em abas, vê-se uma de cada vez. */
const ABAS_FICHA = [
  { id: 'entregas', titulo: 'Entregas' },
  { id: 'anotacoes', titulo: 'Anotações' },
  { id: 'arquivos', titulo: 'Arquivos' },
  { id: 'acessos', titulo: 'Acessos' },
] as const

type AbaFicha = (typeof ABAS_FICHA)[number]['id']

/* Como o painel abre, nos três formatos do peek do Notion. `centralizado` é o
   padrão: cabe a ficha inteira sem tapar a lista de trás por completo. */
const MODOS = [
  { id: 'lado', rotulo: 'Modo lado a lado', icone: PanelRight },
  {
    id: 'centralizado',
    rotulo: 'Modo centralizado',
    icone: RectangleHorizontal,
  },
  { id: 'inteira', rotulo: 'Página inteira', icone: Maximize2 },
] as const

type Modo = (typeof MODOS)[number]['id']

const CLASSES_MODO: Record<Modo, string> = {
  lado: 'data-[state=open]:slide-in-from-right inset-y-0 right-0 w-full border-white/10 border-l sm:w-[min(56rem,80vw)]',
  centralizado:
    '-translate-x-1/2 -translate-y-1/2 data-[state=open]:zoom-in-95 top-1/2 left-1/2 h-[86svh] w-[calc(100%-2rem)] max-w-4xl rounded-xl border border-white/10',
  inteira: 'data-[state=open]:zoom-in-95 inset-0 w-full',
}

const classeCampo =
  'h-10 w-full rounded-lg border border-white/8 bg-white/2 px-3 font-inter text-[#F4F5F5] text-sm outline-none placeholder:text-[#6F6F76] focus-visible:border-white/25'

/* Endereço sem o "https://" da frente — o que interessa na lista é o domínio
   e o caminho; o resto o `truncate` corta com reticências. */
function semProtocolo(url: string) {
  return url.replace(/^https?:\/\//i, '')
}

/* Aceita a URL com ou sem protocolo; normaliza para https. */
function normalizarUrl(valor: string) {
  const limpo = valor.trim()
  if (!limpo) return null
  const comProtocolo = /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`

  try {
    return new URL(comProtocolo).toString()
  } catch {
    return null
  }
}

/* Linha de propriedade: rótulo com ícone à esquerda, valor à direita. */
function Propriedade({
  icone: Icone,
  rotulo,
  children,
}: {
  icone: typeof Mail
  rotulo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex w-36 shrink-0 items-center gap-2 font-inter text-[#8A8A8F] text-sm">
        <Icone className="size-4 shrink-0" />
        {rotulo}
      </span>
      <span className="min-w-0 flex-1 font-inter text-[#F4F5F5] text-sm">
        {children}
      </span>
    </div>
  )
}

/* Texto que vira campo ao clicar.
 *
 * Enter e sair do campo salvam; Esc desiste. Só chama `onSalvar` quando o
 * valor mudou de verdade — clicar sem querer e sair não dispara escrita. */
function TextoEditavel({
  valor,
  rotulo,
  onSalvar,
  className,
  tipo = 'text',
}: {
  valor: string
  rotulo: string
  onSalvar: (novo: string) => void
  className?: string
  tipo?: 'text' | 'email'
}) {
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState(valor)

  function confirmar() {
    const limpo = rascunho.trim()
    setEditando(false)

    if (limpo === '' || limpo === valor) {
      setRascunho(valor)
      return
    }

    onSalvar(limpo)
  }

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => {
          setRascunho(valor)
          setEditando(true)
        }}
        title={`Editar ${rotulo}`}
        className={cn(
          '-mx-1 max-w-full truncate rounded px-1 text-left transition-colors hover:bg-white/6',
          className,
        )}
      >
        {valor}
      </button>
    )
  }

  return (
    <input
      // biome-ignore lint/a11y/noAutofocus: o campo só existe depois do clique
      autoFocus
      type={tipo}
      aria-label={rotulo}
      value={rascunho}
      onChange={(evento) => setRascunho(evento.target.value)}
      onBlur={confirmar}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter') confirmar()
        if (evento.key === 'Escape') {
          setRascunho(valor)
          setEditando(false)
        }
      }}
      className={cn(
        '-mx-1 w-full rounded border border-white/20 bg-white/4 px-1 outline-none',
        className,
      )}
    />
  )
}

/* Selo que abre um menu para trocar o valor — usado no status e no plano. */
function SeloEditavel<T extends string>({
  valor,
  opcoes,
  rotuloCampo,
  vazio,
  onEscolher,
}: {
  valor: T | null
  opcoes: readonly { id: T; rotulo: string; classe?: string }[]
  rotuloCampo: string
  /** Texto e valor da opção "sem valor". Ausente = campo obrigatório. */
  vazio?: string
  onEscolher: (valor: T | null) => void
}) {
  const atual = opcoes.find((opcao) => opcao.id === valor)

  return (
    <Menu.Root>
      <Menu.Trigger
        title={`Editar ${rotuloCampo}`}
        className="-mx-1 rounded px-1 transition-colors hover:bg-white/6"
      >
        {atual ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset',
              atual.classe,
            )}
          >
            {atual.rotulo}
          </span>
        ) : (
          <span className="text-[#6F6F76]">—</span>
        )}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-44 rounded-lg border border-white/10 bg-[#17171A] p-1 shadow-lg data-[state=open]:animate-in"
        >
          {vazio && (
            <Menu.Item
              onSelect={() => onEscolher(null)}
              className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 font-inter text-[#8A8A8F] text-sm outline-none focus:bg-white/6"
            >
              <span className="flex-1">{vazio}</span>
              {valor === null && <Check className="size-3.5 shrink-0" />}
            </Menu.Item>
          )}

          {opcoes.map((opcao) => (
            <Menu.Item
              key={opcao.id}
              onSelect={() => onEscolher(opcao.id)}
              className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 font-inter text-[#F4F5F5] text-sm outline-none focus:bg-white/6"
            >
              <span className="flex-1">{opcao.rotulo}</span>
              {valor === opcao.id && <Check className="size-3.5 shrink-0" />}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}

/* Tipo do arquivo: o chip mostra o escolhido e abre a lista com os outros.
   Ocupa uma linha só, ao lado do campo de link. */
function SeletorTipoArquivo({
  tipo,
  onEscolher,
}: {
  tipo: TipoArquivo
  onEscolher: (tipo: TipoArquivo) => void
}) {
  const { icone: IconeAtual, cor: corAtual } = ICONES_ARQUIVO[tipo]

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Tipo do arquivo: ${TIPO_ARQUIVO_LABEL[tipo]}`}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/8 px-3.5 font-inter text-[#F4F5F5] text-sm transition-colors hover:border-white/25 data-[state=open]:border-white/25"
      >
        <IconeAtual className={cn('size-4', corAtual)} />
        {TIPO_ARQUIVO_LABEL[tipo]}
        <ChevronDown className="size-3.5 text-[#6F6F76]" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-40 rounded-lg border border-white/10 bg-[#17171A] p-1 shadow-lg data-[state=open]:animate-in"
        >
          {TIPOS_ARQUIVO.map((opcao) => {
            const { icone: Icone, cor } = ICONES_ARQUIVO[opcao]

            return (
              <Menu.Item
                key={opcao}
                onSelect={() => onEscolher(opcao)}
                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 font-inter text-[#F4F5F5] text-sm outline-none focus:bg-white/6"
              >
                <Icone className={cn('size-3.5 shrink-0', cor)} />
                <span className="flex-1">{TIPO_ARQUIVO_LABEL[opcao]}</span>
                {tipo === opcao && <Check className="size-3.5 shrink-0" />}
              </Menu.Item>
            )
          })}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}

interface PainelClienteProps {
  cliente: Cliente | null
  /** Os funis deste cliente — as entregas em construção com o time. */
  funis: Funil[]
  arquivos: ArquivoCliente[]
  acessos: AcessoCliente[]
  notas: NotaCliente[]
  administradores: Administrador[]
  onFechar: () => void
  onAdicionarArquivo: (arquivo: Omit<ArquivoCliente, 'id'>) => void
  onExcluirArquivo: (id: string) => void
  onAdicionarAcesso: (acesso: Omit<AcessoCliente, 'id'>) => void
  onExcluirAcesso: (id: string) => void
  onAdicionarNota: (clienteId: string, texto: string) => void
  onExcluirNota: (id: string) => void
  /** Salva a edição feita direto na ficha (nome, status, plano, e-mail). */
  onEditarCliente: (dados: Partial<Omit<Cliente, 'id'>>) => void
}

/* Painel do cliente, no formato do peek do Notion: abre pela direita, com o
 * nome em destaque, as propriedades logo abaixo e o conteúdo no fim. */
export function PainelCliente({
  cliente,
  funis,
  arquivos,
  acessos,
  notas,
  administradores,
  onFechar,
  onAdicionarArquivo,
  onExcluirArquivo,
  onAdicionarAcesso,
  onExcluirAcesso,
  onAdicionarNota,
  onExcluirNota,
  onEditarCliente,
}: PainelClienteProps) {
  const [tipo, setTipo] = useState<TipoArquivo>('drive')
  const [nome, setNome] = useState('')
  const [url, setUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState('')
  const [modo, setModo] = useState<Modo>('centralizado')
  const [aba, setAba] = useState<AbaFicha>('anotacoes')

  const clienteId = cliente?.id

  /* Cada cliente aberto começa com o formulário limpo. */
  useEffect(() => {
    setTipo('drive')
    setNome('')
    setUrl('')
    setErro(null)
    setRascunho('')
  }, [])

  if (!cliente) return null

  function adicionar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!clienteId) return

    /* Nos tipos conhecidos o nome já vem do rótulo; só "outro" precisa que a
       pessoa digite. */
    if (tipo === 'outro' && nome.trim().length < 2) {
      setErro('Informe o nome do arquivo')
      return
    }

    const urlNormalizada = normalizarUrl(url)
    if (!urlNormalizada) {
      setErro('Informe um link válido')
      return
    }

    onAdicionarArquivo({
      clienteId,
      tipo,
      nome: tipo === 'outro' ? nome.trim() : TIPO_ARQUIVO_LABEL[tipo],
      url: urlNormalizada,
    })
    setNome('')
    setUrl('')
    setErro(null)
  }

  /* Quem escreveu e depois saiu da equipe cai no primeiro desenho, para a
     anotação não ficar sem rosto. */
  function avatarDe(autorId: string) {
    return (
      administradores.find((pessoa) => pessoa.id === autorId)?.avatar ??
      'estrela'
    )
  }

  function anotar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!clienteId) return

    const texto = rascunho.trim()
    if (!texto) return

    onAdicionarNota(clienteId, texto)
    setRascunho('')
  }

  return (
    <Dialog.Root open onOpenChange={(aberto) => !aberto && onFechar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in" />

        <Dialog.Content
          className={cn(
            'data-[state=open]:fade-in-0 fixed z-50 flex flex-col overflow-y-auto bg-[#1B1B1F] shadow-2xl data-[state=open]:animate-in',
            CLASSES_MODO[modo],
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between px-4">
            <Dialog.Close
              type="button"
              aria-label="Fechar"
              className="flex size-8 items-center justify-center rounded-md text-[#8A8A8F] transition-colors hover:bg-white/6 hover:text-white"
            >
              <X className="size-4" />
            </Dialog.Close>

            <Menu.Root>
              <Menu.Trigger
                aria-label="Modo de exibição"
                className="flex size-8 items-center justify-center rounded-md text-[#8A8A8F] transition-colors hover:bg-white/6 hover:text-white data-[state=open]:bg-white/6 data-[state=open]:text-white"
              >
                <Maximize2 className="size-4" />
              </Menu.Trigger>

              <Menu.Portal>
                <Menu.Content
                  align="end"
                  sideOffset={6}
                  className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-52 rounded-lg border border-white/10 bg-[#17171A] p-1 shadow-lg data-[state=open]:animate-in"
                >
                  {MODOS.map((opcao) => {
                    const Icone = opcao.icone

                    return (
                      <Menu.Item
                        key={opcao.id}
                        onSelect={() => setModo(opcao.id)}
                        className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 font-inter text-[#F4F5F5] text-sm outline-none focus:bg-white/6"
                      >
                        <Icone className="size-3.5 shrink-0 text-[#8A8A8F]" />
                        <span className="flex-1">{opcao.rotulo}</span>
                        {modo === opcao.id && (
                          <Check className="size-3.5 shrink-0" />
                        )}
                      </Menu.Item>
                    )
                  })}
                </Menu.Content>
              </Menu.Portal>
            </Menu.Root>
          </div>

          <div className="mx-auto w-full max-w-3xl px-8 pb-16 sm:px-12">
            <Dialog.Title asChild>
              <h2 className="font-inter font-semibold text-3xl text-white leading-tight sm:text-4xl">
                <TextoEditavel
                  valor={cliente.nome}
                  rotulo="nome do cliente"
                  onSalvar={(nome) => onEditarCliente({ nome })}
                />
              </h2>
            </Dialog.Title>

            <Dialog.Description className="sr-only">
              Ficha do cliente {cliente.nome}
            </Dialog.Description>

            <div className="flex flex-col gap-0.5 pt-6">
              <Propriedade icone={CircleDot} rotulo="Status">
                <SeloEditavel
                  valor={cliente.status}
                  rotuloCampo="status"
                  opcoes={STATUS_CLIENTE.map((status) => ({
                    id: status,
                    rotulo: STATUS_LABEL[status],
                    classe: CLASSES_STATUS[status],
                  }))}
                  onEscolher={(status) => {
                    if (status) onEditarCliente({ status })
                  }}
                />
              </Propriedade>

              <Propriedade icone={BadgeDollarSign} rotulo="Plano">
                <span className="flex items-center gap-2">
                  <SeloEditavel
                    valor={cliente.plano}
                    rotuloCampo="plano"
                    vazio="Sem plano definido"
                    opcoes={PLANOS_CLIENTE.map((plano) => ({
                      id: plano,
                      rotulo: PLANO_LABEL[plano],
                      classe: CLASSES_PLANO[plano],
                    }))}
                    onEscolher={(plano) => onEditarCliente({ plano })}
                  />

                  {/* Cobrança só faz sentido depois que há plano — sem isso a
                      linha mostrava dois traços seguidos. */}
                  {cliente.plano && (
                    <SeloEditavel
                      valor={cliente.cicloPlano}
                      rotuloCampo="cobrança"
                      vazio="Sem periodicidade"
                      opcoes={CICLOS_PLANO.map((ciclo) => ({
                        id: ciclo,
                        rotulo: CICLO_PLANO_LABEL[ciclo],
                        classe: 'bg-white/6 text-[#ABABAB] ring-white/12',
                      }))}
                      onEscolher={(cicloPlano) =>
                        onEditarCliente({ cicloPlano })
                      }
                    />
                  )}
                </span>
              </Propriedade>

              <Propriedade icone={Mail} rotulo="E-mail">
                <TextoEditavel
                  valor={cliente.email}
                  rotulo="e-mail do cliente"
                  tipo="email"
                  onSalvar={(email) => onEditarCliente({ email })}
                />
              </Propriedade>
            </div>

            <div
              role="tablist"
              aria-label="Seções da ficha do cliente"
              className="mt-8 flex gap-1 border-white/8 border-b"
            >
              {ABAS_FICHA.map((opcao) => {
                const selecionada = opcao.id === aba

                return (
                  <button
                    key={opcao.id}
                    type="button"
                    role="tab"
                    aria-selected={selecionada}
                    onClick={() => setAba(opcao.id)}
                    className={cn(
                      '-mb-px border-b-2 px-3 pb-2.5 font-inter font-medium text-sm transition-colors',
                      selecionada
                        ? 'border-white text-white'
                        : 'border-transparent text-[#8A8A8F] hover:text-white',
                    )}
                  >
                    {opcao.titulo}
                  </button>
                )
              })}
            </div>

            {aba === 'arquivos' && (
              <section className="mt-6 flex flex-col gap-3">
                {arquivos.length === 0 ? (
                  <EstadoVazio
                    id="arquivos"
                    titulo="Nenhum arquivo"
                    descricao="Adicione o link do Drive, do briefing, do que for."
                  />
                ) : (
                  <ul className="flex flex-col gap-1">
                    {arquivos.map((arquivo) => (
                      <li
                        key={arquivo.id}
                        className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/2 px-3 py-2"
                      >
                        {(() => {
                          const { icone: Icone, cor } =
                            ICONES_ARQUIVO[arquivo.tipo] ?? ICONES_ARQUIVO.outro

                          return (
                            <Icone className={cn('size-4 shrink-0', cor)} />
                          )
                        })()}

                        {/* O ícone já diz de onde é o link; o que ajuda a
                          reconhecer a linha é o endereço, cortado no fim. */}
                        <span
                          title={arquivo.url}
                          className="min-w-0 flex-1 truncate font-inter text-[#ABABAB] text-sm"
                        >
                          {semProtocolo(arquivo.url)}
                        </span>

                        <a
                          href={arquivo.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Abrir ${arquivo.nome}`}
                          title="Abrir link"
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => onExcluirArquivo(arquivo.id)}
                          aria-label={`Excluir ${arquivo.nome}`}
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={adicionar} className="flex flex-col gap-2 pt-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <SeletorTipoArquivo tipo={tipo} onEscolher={setTipo} />

                    {tipo === 'outro' && (
                      <input
                        value={nome}
                        onChange={(evento) => setNome(evento.target.value)}
                        placeholder="Nome do arquivo"
                        aria-label="Nome do arquivo"
                        className={cn(classeCampo, 'sm:w-56')}
                      />
                    )}

                    <input
                      value={url}
                      onChange={(evento) => setUrl(evento.target.value)}
                      placeholder="Link"
                      aria-label="Link do arquivo"
                      className={classeCampo}
                    />

                    <button
                      type="submit"
                      className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90"
                    >
                      <Plus className="size-4" />
                      Adicionar
                    </button>
                  </div>
                </form>

                {erro && (
                  <p className="font-inter text-rose-300 text-xs" role="alert">
                    {erro}
                  </p>
                )}
              </section>
            )}

            {aba === 'acessos' && (
              <AcessosCliente
                clienteId={cliente.id}
                acessos={acessos}
                onAdicionar={onAdicionarAcesso}
                onExcluir={onExcluirAcesso}
              />
            )}

            {aba === 'entregas' && (
              <section className="mt-6 flex flex-col gap-3">
                {funis.length === 0 ? (
                  <EstadoVazio
                    id="entregas"
                    titulo="Nenhuma entrega para este cliente"
                    descricao="Os funis cadastrados em Funis para esta conta aparecem aqui."
                  />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {funis.map((funil) => (
                      <li
                        key={funil.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/2 p-3"
                      >
                        <p className="min-w-0 truncate font-inter font-medium text-[#F4F5F5] text-sm">
                          {funil.nome}
                        </p>

                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 font-inter font-medium text-xs ring-1 ring-inset',
                            CLASSES_STATUS_FUNIL[funil.status],
                          )}
                        >
                          {STATUS_FUNIL_LABEL[funil.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {aba === 'anotacoes' && (
              <section className="mt-6 flex flex-col gap-3">
                {notas.length === 0 ? (
                  <EstadoVazio
                    id="anotacoes"
                    desenho="anotacao"
                    titulo="Nenhuma anotação"
                    descricao="Registre aqui o que ficou combinado com o cliente."
                  />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {notas.map((nota) => (
                      <li
                        key={nota.id}
                        className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/2 p-3"
                      >
                        <Avatar
                          avatar={avatarDe(nota.autorId)}
                          rotulo={nota.autor}
                          className="size-7"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="flex items-baseline gap-2 font-inter text-sm">
                            <span className="font-medium text-[#F4F5F5]">
                              {nota.autor}
                            </span>
                            <span className="text-[#6F6F76] text-xs">
                              {formatarData(nota.criadaEm)}
                            </span>
                          </p>
                          <p className="whitespace-pre-wrap pt-1 font-inter text-[#ABABAB] text-sm leading-relaxed">
                            {nota.texto}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onExcluirNota(nota.id)}
                          aria-label={`Excluir anotação de ${nota.autor}`}
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={anotar} className="flex flex-col gap-2 pt-2">
                  <textarea
                    value={rascunho}
                    onChange={(evento) => setRascunho(evento.target.value)}
                    placeholder="Escreva uma anotação sobre este cliente..."
                    aria-label="Nova anotação"
                    className="h-24 w-full resize-none rounded-lg border border-white/8 bg-white/2 px-3 py-2.5 font-inter text-[#F4F5F5] text-sm leading-relaxed outline-none placeholder:text-[#6F6F76] focus-visible:border-white/25"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!rascunho.trim()}
                      className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 font-inter font-medium text-[#131316] text-sm transition-colors hover:bg-white/90 disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                      Anotar
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
