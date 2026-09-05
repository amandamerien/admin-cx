import * as Menu from '@radix-ui/react-dropdown-menu'
import { cn } from '@repo/ui'
import {
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Mail,
  Megaphone,
  Plus,
  ShoppingBag,
  Trash2,
  Video,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AcessoCliente } from './dados'
import { EstadoVazio } from './estado-vazio'

/* As plataformas que o cliente costuma entregar acesso, na mesma ideia do
 * seletor de Arquivos: escolher de uma lista evita "Panda Video", "panda" e
 * "PandaVideos" virarem três coisas diferentes na ficha.
 *
 * Marca não tem ícone próprio no lucide, então o desenho é genérico por
 * categoria (venda, vídeo, anúncio...) e a cor é que distingue — o que vale
 * aqui é bater o olho e reconhecer. `outro` abre um campo para digitar. */
const OUTRA = {
  id: 'outro',
  rotulo: 'Outro',
  icone: KeyRound,
  cor: 'text-[#6F6F76]',
} as const

const PLATAFORMAS = [
  {
    id: 'hotmart',
    rotulo: 'Hotmart',
    icone: ShoppingBag,
    cor: 'text-orange-300',
  },
  {
    id: 'kiwify',
    rotulo: 'Kiwify',
    icone: ShoppingBag,
    cor: 'text-emerald-300',
  },
  { id: 'eduzz', rotulo: 'Eduzz', icone: ShoppingBag, cor: 'text-amber-300' },
  {
    id: 'monetizze',
    rotulo: 'Monetizze',
    icone: ShoppingBag,
    cor: 'text-sky-300',
  },
  { id: 'braip', rotulo: 'Braip', icone: ShoppingBag, cor: 'text-violet-300' },
  { id: 'ticto', rotulo: 'Ticto', icone: ShoppingBag, cor: 'text-blue-300' },
  {
    id: 'perfectpay',
    rotulo: 'Perfect Pay',
    icone: CreditCard,
    cor: 'text-teal-300',
  },
  {
    id: 'guru',
    rotulo: 'Digital Manager Guru',
    icone: CreditCard,
    cor: 'text-rose-300',
  },
  {
    id: 'pandavideo',
    rotulo: 'Panda Video',
    icone: Video,
    cor: 'text-fuchsia-300',
  },
  { id: 'vturb', rotulo: 'VTurb', icone: Video, cor: 'text-cyan-300' },
  { id: 'vimeo', rotulo: 'Vimeo', icone: Video, cor: 'text-sky-300' },
  { id: 'youtube', rotulo: 'YouTube', icone: Video, cor: 'text-red-300' },
  {
    id: 'meta',
    rotulo: 'Meta Business',
    icone: Megaphone,
    cor: 'text-blue-300',
  },
  {
    id: 'googleads',
    rotulo: 'Google Ads',
    icone: Megaphone,
    cor: 'text-amber-300',
  },
  {
    id: 'tiktokads',
    rotulo: 'TikTok Ads',
    icone: Megaphone,
    cor: 'text-[#D4D4D8]',
  },
  {
    id: 'activecampaign',
    rotulo: 'ActiveCampaign',
    icone: Mail,
    cor: 'text-sky-300',
  },
  { id: 'rdstation', rotulo: 'RD Station', icone: Mail, cor: 'text-cyan-300' },
  {
    id: 'analytics',
    rotulo: 'Google Analytics',
    icone: BarChart3,
    cor: 'text-orange-300',
  },
  {
    id: 'gtm',
    rotulo: 'Google Tag Manager',
    icone: BarChart3,
    cor: 'text-blue-300',
  },
  { id: 'wordpress', rotulo: 'WordPress', icone: Globe, cor: 'text-[#D4D4D8]' },
  { id: 'shopify', rotulo: 'Shopify', icone: Globe, cor: 'text-emerald-300' },
  OUTRA,
] as const

type PlataformaId = (typeof PLATAFORMAS)[number]['id']

/* Acha a plataforma pelo nome guardado no acesso, para a lista mostrar o
 * mesmo ícone do seletor. Acessos antigos (nome digitado à mão) caem no
 * genérico. */
function plataformaPorNome(nome: string) {
  const procurado = nome.trim().toLowerCase()
  return (
    PLATAFORMAS.find((item) => item.rotulo.toLowerCase() === procurado) ?? OUTRA
  )
}

/* Chip que mostra a plataforma escolhida e abre a lista com as outras —
 * mesma peça do seletor de tipo em Arquivos. */
function SeletorPlataforma({
  plataforma,
  onEscolher,
}: {
  plataforma: PlataformaId
  onEscolher: (id: PlataformaId) => void
}) {
  const atual = PLATAFORMAS.find((item) => item.id === plataforma) ?? OUTRA
  const IconeAtual = atual.icone

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Plataforma: ${atual.rotulo}`}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-white/8 bg-white/2 px-3 font-inter text-[#F4F5F5] text-sm transition-colors hover:border-white/25 data-[state=open]:border-white/25"
      >
        <IconeAtual className={cn('size-4', atual.cor)} />
        {atual.rotulo}
        <ChevronDown className="size-3.5 text-[#6F6F76]" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 max-h-72 min-w-52 overflow-y-auto rounded-lg border border-white/10 bg-[#17171A] p-1 shadow-lg data-[state=open]:animate-in"
        >
          {PLATAFORMAS.map((opcao) => {
            const Icone = opcao.icone

            return (
              <Menu.Item
                key={opcao.id}
                onSelect={() => onEscolher(opcao.id)}
                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 font-inter text-[#F4F5F5] text-sm outline-none focus:bg-white/6"
              >
                <Icone className={cn('size-3.5 shrink-0', opcao.cor)} />
                <span className="flex-1">{opcao.rotulo}</span>
                {plataforma === opcao.id && (
                  <Check className="size-3.5 shrink-0" />
                )}
              </Menu.Item>
            )
          })}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}

const classeCampo =
  'h-10 w-full rounded-lg border border-white/8 bg-white/2 px-3 font-inter text-[#F4F5F5] text-sm outline-none placeholder:text-[#6F6F76] focus-visible:border-white/25'

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

/* Copia o valor e confirma trocando o ícone por alguns segundos. */
function BotaoCopiar({ valor, rotulo }: { valor: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    },
    [],
  )

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor)
    } catch {
      return
    }

    setCopiado(true)
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setCopiado(false), 2000)
  }

  const Icone = copiado ? Check : Copy

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={copiado ? 'Copiado' : `Copiar ${rotulo}`}
      title={copiado ? 'Copiado' : `Copiar ${rotulo}`}
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
        copiado
          ? 'text-emerald-300'
          : 'text-[#6F6F76] hover:bg-white/6 hover:text-white',
      )}
    >
      <Icone className="size-3.5" />
    </button>
  )
}

/* Senha escondida por padrão: a tela vive aberta em reunião e em
   compartilhamento de tela. Copiar funciona sem revelar. */
function Senha({ senha }: { senha: string }) {
  const [revelada, setRevelada] = useState(false)
  const Icone = revelada ? EyeOff : Eye

  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate font-inter font-mono text-[#ABABAB] text-xs">
        {revelada ? senha : '•'.repeat(Math.min(senha.length, 12))}
      </span>

      <button
        type="button"
        onClick={() => setRevelada((atual) => !atual)}
        aria-pressed={revelada}
        aria-label={revelada ? 'Ocultar senha' : 'Mostrar senha'}
        title={revelada ? 'Ocultar senha' : 'Mostrar senha'}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white"
      >
        <Icone className="size-3.5" />
      </button>

      <BotaoCopiar valor={senha} rotulo="senha" />
    </span>
  )
}

interface AcessosClienteProps {
  clienteId: string
  acessos: AcessoCliente[]
  onAdicionar: (acesso: Omit<AcessoCliente, 'id'>) => void
  onExcluir: (id: string) => void
}

/* Acessos — as contas do cliente que o time precisa para trabalhar. */
export function AcessosCliente({
  clienteId,
  acessos,
  onAdicionar,
  onExcluir,
}: AcessosClienteProps) {
  const [plataforma, setPlataforma] = useState<PlataformaId>('hotmart')
  const [outroNome, setOutroNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [url, setUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function adicionar(evento: React.FormEvent) {
    evento.preventDefault()

    /* Nas plataformas conhecidas o nome já vem do rótulo; só "outro" precisa
       que a pessoa escreva qual é. */
    if (plataforma === 'outro' && outroNome.trim().length < 2) {
      setErro('Informe o nome da plataforma')
      return
    }

    if (email.trim() === '') {
      setErro('Informe o e-mail de acesso')
      return
    }

    const nome =
      plataforma === 'outro'
        ? outroNome.trim()
        : (PLATAFORMAS.find((item) => item.id === plataforma)?.rotulo ?? '')

    onAdicionar({
      clienteId,
      plataforma: nome,
      email: email.trim(),
      senha,
      url: normalizarUrl(url),
    })

    setPlataforma('hotmart')
    setOutroNome('')
    setEmail('')
    setSenha('')
    setUrl('')
    setErro(null)
  }

  return (
    <section className="mt-6 flex flex-col gap-3">
      <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 font-inter text-amber-200/90 text-xs leading-relaxed">
        O que você digitar aqui fica salvo no banco do painel, em texto legível
        para quem tem acesso a ele. Use para registrar <em>quais</em> acessos o
        cliente precisa entregar — a senha real fica no gerenciador de senhas da
        equipe.
      </p>

      {acessos.length === 0 ? (
        <EstadoVazio
          id="acessos"
          desenho="cadeado"
          titulo="Nenhum acesso registrado"
          descricao="Guarde aqui as contas das plataformas que o cliente entregar."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {acessos.map((acesso) => {
            const marca = plataformaPorNome(acesso.plataforma)
            const IconeMarca = marca.icone

            return (
              <li
                key={acesso.id}
                className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/2 p-3"
              >
                <IconeMarca
                  className={cn('mt-0.5 size-4 shrink-0', marca.cor)}
                />

                <div className="min-w-0 flex-1">
                  <p className="font-inter font-medium text-[#F4F5F5] text-sm">
                    {acesso.url ? (
                      <a
                        href={acesso.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline"
                      >
                        {acesso.plataforma}
                      </a>
                    ) : (
                      acesso.plataforma
                    )}
                  </p>

                  <span className="flex min-w-0 items-center gap-1 pt-0.5">
                    <span className="truncate font-inter text-[#8A8A8F] text-xs">
                      {acesso.email}
                    </span>
                    <BotaoCopiar valor={acesso.email} rotulo="e-mail" />
                  </span>

                  {acesso.senha && <Senha senha={acesso.senha} />}
                </div>

                <button
                  type="button"
                  onClick={() => onExcluir(acesso.id)}
                  aria-label={`Excluir acesso ${acesso.plataforma}`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-rose-400/10 hover:text-rose-300"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={adicionar} className="flex flex-col gap-2 pt-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <SeletorPlataforma
            plataforma={plataforma}
            onEscolher={(id) => {
              setPlataforma(id)
              setErro(null)
            }}
          />

          {plataforma === 'outro' && (
            <input
              value={outroNome}
              onChange={(evento) => setOutroNome(evento.target.value)}
              placeholder="Qual plataforma?"
              aria-label="Nome da plataforma"
              className={cn(classeCampo, 'sm:w-48')}
            />
          )}

          <input
            value={url}
            onChange={(evento) => setUrl(evento.target.value)}
            placeholder="Link da plataforma"
            aria-label="Link da plataforma"
            className={classeCampo}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder="E-mail de acesso"
            aria-label="E-mail de acesso"
            autoComplete="off"
            className={classeCampo}
          />
          <input
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            type="password"
            placeholder="Senha de acesso"
            aria-label="Senha de acesso"
            autoComplete="new-password"
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

        {erro && (
          <p className="font-inter text-rose-300 text-xs" role="alert">
            {erro}
          </p>
        )}
      </form>
    </section>
  )
}
