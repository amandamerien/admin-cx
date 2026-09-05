import { cn } from '@repo/ui'
import {
  MessageSquare,
  MousePointer2,
  Palette,
  PenLine,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from './avatares'
import {
  type Administrador,
  type Anotacao,
  type AvatarId,
  CLASSES_ANOTACAO,
  CORES_ANOTACAO,
  type CorAnotacao,
  EMOJIS_MURAL,
  type TipoAnotacao,
} from './dados'

/* Ferramenta ativa da barra: define o que um clique no quadro cria. */
type Ferramenta = 'selecionar' | TipoAnotacao

const FERRAMENTAS: {
  id: Ferramenta
  titulo: string
  icone: typeof StickyNote | null
}[] = [
  { id: 'selecionar', titulo: 'Selecionar', icone: MousePointer2 },
  { id: 'postit', titulo: 'Post-it', icone: StickyNote },
  { id: 'emoji', titulo: 'Emoji', icone: null },
  { id: 'comentario', titulo: 'Comentário', icone: MessageSquare },
]

/* Comentário — no quadro ele é só um selo com o avatar de quem escreveu.
   O texto e o nome aparecem no balão, ao clicar. */
function Comentario({
  anotacao,
  avatar,
  aberto,
  onAlternar,
  onMudarTexto,
  onExcluir,
}: {
  anotacao: Anotacao
  avatar: AvatarId
  /* Quem manda no balão é o quadro: o comentário recém-criado já nasce aberto,
     e só um fica aberto por vez. */
  aberto: boolean
  onAlternar: () => void
  onMudarTexto: (texto: string) => void
  onExcluir: () => void
}) {
  const campoRef = useRef<HTMLTextAreaElement>(null)

  /* Ao abrir o balão o cursor já vai para o texto: o selo é pequeno demais
     para valer um segundo clique. */
  useEffect(() => {
    if (aberto) campoRef.current?.focus()
  }, [aberto])

  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute"
      style={{ left: `${anotacao.x}%`, top: `${anotacao.y}%` }}
    >
      {aberto && (
        <div className="-left-3 absolute bottom-full z-10 mb-3 w-64 rounded-2xl bg-[#1A1A1C] p-4 shadow-xl ring-1 ring-white/8">
          {/* Rabinho apontando para o selo. */}
          <span className="-bottom-1.5 absolute left-3 size-3 rotate-45 rounded-[3px] bg-[#1A1A1C]" />

          <div className="flex items-center gap-2.5">
            <Avatar
              avatar={avatar}
              rotulo={anotacao.autor}
              className="size-7"
            />
            <span className="flex-1 font-inter font-semibold text-sm text-white leading-tight">
              {anotacao.autor}
            </span>
            <button
              type="button"
              onClick={onExcluir}
              aria-label="Excluir comentário"
              className="flex size-6 items-center justify-center rounded-md text-[#8A8A8F] hover:bg-white/8 hover:text-rose-300"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          <textarea
            value={anotacao.texto}
            onChange={(evento) => onMudarTexto(evento.target.value)}
            placeholder="Escreva o comentário..."
            aria-label="Comentário"
            ref={campoRef}
            className="h-20 w-full resize-none bg-transparent pt-2 font-inter text-[#C9C9CE] text-sm leading-relaxed outline-none placeholder:text-[#6F6F76]"
          />
        </div>
      )}

      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        aria-label={`Comentário de ${anotacao.autor}`}
        className={cn(
          'block rounded-xl ring-offset-2 ring-offset-[#161619] transition-transform hover:scale-105',
          aberto && 'ring-2 ring-white/50',
        )}
      >
        <Avatar avatar={avatar} rotulo={anotacao.autor} className="size-9" />
      </button>
    </div>
  )
}

/* Post-it ou emoji posicionado no quadro. */
function Item({
  anotacao,
  autoFoco,
  onMudarTexto,
  onMudarCor,
  onExcluir,
}: {
  anotacao: Anotacao
  /* Nota recém-colada no quadro: o cursor já entra nela. */
  autoFoco: boolean
  onMudarTexto: (texto: string) => void
  onMudarCor: (cor: CorAnotacao) => void
  onExcluir: () => void
}) {
  const [paletaAberta, setPaletaAberta] = useState(false)
  const campoRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFoco) campoRef.current?.focus()
  }, [autoFoco])

  const posicao = {
    left: `${anotacao.x}%`,
    top: `${anotacao.y}%`,
  }

  if (anotacao.tipo === 'emoji') {
    return (
      <div
        className="-translate-x-1/2 -translate-y-1/2 group absolute"
        style={posicao}
      >
        <span className="select-none text-3xl">{anotacao.texto}</span>
        <button
          type="button"
          onClick={onExcluir}
          aria-label="Excluir emoji"
          className="-top-1 -right-2 absolute hidden size-5 items-center justify-center rounded-full bg-[#131316] text-[#8A8A8F] ring-1 ring-white/15 hover:text-rose-300 group-hover:flex"
        >
          <Trash2 className="size-2.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="group absolute flex w-64 flex-col rounded-2xl border border-black/8 bg-white shadow-lg"
      style={posicao}
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-white',
            CLASSES_ANOTACAO[anotacao.cor],
          )}
        >
          <PenLine className="size-4" />
        </span>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setPaletaAberta((aberta) => !aberta)}
            aria-label="Cor da anotação"
            className="flex size-6 items-center justify-center rounded-md text-[#6B6B70] hover:bg-black/8"
          >
            <Palette className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={onExcluir}
            aria-label="Excluir"
            className="flex size-6 items-center justify-center rounded-md text-[#6B6B70] hover:bg-black/8 hover:text-rose-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {paletaAberta && (
        <div className="absolute top-12 right-2 z-10 rounded-lg border border-black/10 bg-white p-2 shadow-xl">
          <p className="pb-1.5 font-inter font-semibold text-[#6B6B70] text-[10px] uppercase tracking-wider">
            Cor da anotação
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {CORES_ANOTACAO.map((cor) => (
              <button
                key={cor}
                type="button"
                aria-label={`Cor ${cor}`}
                onClick={() => {
                  onMudarCor(cor)
                  setPaletaAberta(false)
                }}
                className={cn(
                  'size-7 rounded-md',
                  CLASSES_ANOTACAO[cor],
                  anotacao.cor === cor && 'ring-2 ring-sky-500 ring-offset-2',
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Na nota o autor vem em destaque, como título do cartão. */}
      <p className="px-4 pt-3 font-inter font-semibold text-[#1F2123] text-lg leading-tight">
        {anotacao.autor}
      </p>

      <textarea
        value={anotacao.texto}
        onChange={(evento) => onMudarTexto(evento.target.value)}
        placeholder="Escreva a nota..."
        aria-label="Anotação"
        ref={campoRef}
        className="h-28 resize-none bg-transparent px-4 pt-2 pb-4 font-inter text-[#5A5A61] text-sm leading-relaxed outline-none placeholder:text-[#9A9AA0]"
      />
    </div>
  )
}

/* Prévia que segue o mouse: mostra o que vai ser colado antes do clique, no
   lugar do cursor. */
function Previa({
  ferramenta,
  emoji,
  avatar,
  x,
  y,
}: {
  ferramenta: TipoAnotacao
  emoji: string
  avatar: AvatarId
  x: number
  y: number
}) {
  if (ferramenta === 'emoji') {
    return (
      <span
        className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute select-none text-3xl opacity-80"
        style={{ left: x, top: y }}
      >
        {emoji}
      </span>
    )
  }

  if (ferramenta === 'comentario') {
    return (
      <div
        className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute opacity-80"
        style={{ left: x, top: y }}
      >
        <Avatar avatar={avatar} className="size-9 rounded-xl" />
      </div>
    )
  }

  /* Post-it: cartão em miniatura, com o mesmo desenho do de verdade. */
  return (
    <div
      className="pointer-events-none absolute w-48 rounded-xl border border-black/8 bg-white p-3 opacity-80 shadow-lg"
      style={{ left: x, top: y }}
    >
      <span className="block size-6 rounded-full bg-[#F2C94C]" />
      <span className="mt-2 block h-2.5 w-24 rounded-full bg-[#1F2123]/70" />
      <span className="mt-2 block h-2 w-full rounded-full bg-black/10" />
      <span className="mt-1.5 block h-2 w-2/3 rounded-full bg-black/10" />
    </div>
  )
}

interface SecaoMuralProps {
  anotacoes: Anotacao[]
  administradores: Administrador[]
  usuario: Administrador
  /* Devolve o id do item criado, para o quadro já abri-lo para escrita. */
  /* Devolve o id da anotação criada — vem do servidor, então é assíncrono.
     `null` quando a criação falhou. */
  onCriar: (
    tipo: TipoAnotacao,
    x: number,
    y: number,
    texto: string,
  ) => Promise<string | null>
  onAtualizar: (anotacao: Anotacao, mudanca: Partial<Anotacao>) => void
  onExcluir: (anotacao: Anotacao) => void
}

/* Mural — quadro pontilhado com post-its, emojis e comentários do time. */
export function SecaoMural({
  anotacoes,
  administradores,
  usuario,
  onCriar,
  onAtualizar,
  onExcluir,
}: SecaoMuralProps) {
  const [ferramenta, setFerramenta] = useState<Ferramenta>('postit')
  const [emoji, setEmoji] = useState<(typeof EMOJIS_MURAL)[number]>(
    EMOJIS_MURAL[0],
  )
  const [paletaEmoji, setPaletaEmoji] = useState(false)
  const [ponteiro, setPonteiro] = useState<{ x: number; y: number } | null>(
    null,
  )
  /* Id do item que acabou de ser criado: o comentário abre o balão, a nota
     recebe o cursor. */
  const [recemCriado, setRecemCriado] = useState<string | null>(null)
  const quadroRef = useRef<HTMLDivElement>(null)

  /* O avatar vem do cadastro da equipe; quem escreveu e depois saiu de lá cai
     no primeiro desenho, para o selo não sumir do quadro. */
  function avatarDe(autorId: string) {
    return (
      administradores.find((pessoa) => pessoa.id === autorId)?.avatar ??
      'estrela'
    )
  }

  function posicaoNoQuadro(evento: React.MouseEvent<HTMLDivElement>) {
    const quadro = quadroRef.current
    if (!quadro) return null

    const area = quadro.getBoundingClientRect()
    return {
      x: evento.clientX - area.left,
      y: evento.clientY - area.top,
      largura: area.width,
      altura: area.height,
    }
  }

  async function aoClicarNoQuadro(evento: React.MouseEvent<HTMLDivElement>) {
    if (ferramenta === 'selecionar') return
    /* Clique em um item existente não cria outro por baixo. */
    if (evento.target !== evento.currentTarget) return

    const ponto = posicaoNoQuadro(evento)
    if (!ponto) return

    const id = await onCriar(
      ferramenta,
      (ponto.x / ponto.largura) * 100,
      (ponto.y / ponto.altura) * 100,
      ferramenta === 'emoji' ? emoji : '',
    )

    if (ferramenta === 'emoji') return
    if (!id) return

    /* Post-it e comentário existem para receber texto: o item já nasce pronto
       para digitar e a ferramenta volta para a seta, senão a prévia fica
       pairando por cima do que acabou de ser colado. O emoji fica de fora — a
       graça dele é soltar vários seguidos. */
    setRecemCriado(id)
    setFerramenta('selecionar')
    setPonteiro(null)
  }

  function aoMoverNoQuadro(evento: React.MouseEvent<HTMLDivElement>) {
    if (ferramenta === 'selecionar') return

    const ponto = posicaoNoQuadro(evento)
    if (ponto) setPonteiro({ x: ponto.x, y: ponto.y })
  }

  return (
    <div className="relative">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a área é a tela de
          desenho; criar item também é possível pela barra de ferramentas */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: idem */}
      <div
        ref={quadroRef}
        onClick={aoClicarNoQuadro}
        onMouseMove={aoMoverNoQuadro}
        onMouseLeave={() => setPonteiro(null)}
        className={cn(
          'relative h-[70vh] w-full overflow-hidden rounded-2xl border border-white/8 bg-[#161619]',
          /* Com ferramenta escolhida, a prévia toma o lugar do cursor. */
          ferramenta !== 'selecionar' && 'cursor-none',
        )}
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {anotacoes.map((anotacao) =>
          anotacao.tipo === 'comentario' ? (
            <Comentario
              key={anotacao.id}
              anotacao={anotacao}
              avatar={avatarDe(anotacao.autorId)}
              aberto={recemCriado === anotacao.id}
              onAlternar={() =>
                setRecemCriado((atual) =>
                  atual === anotacao.id ? null : anotacao.id,
                )
              }
              onMudarTexto={(texto) => onAtualizar(anotacao, { texto })}
              onExcluir={() => onExcluir(anotacao)}
            />
          ) : (
            <Item
              key={anotacao.id}
              anotacao={anotacao}
              autoFoco={recemCriado === anotacao.id}
              onMudarTexto={(texto) => onAtualizar(anotacao, { texto })}
              onMudarCor={(cor) => onAtualizar(anotacao, { cor })}
              onExcluir={() => onExcluir(anotacao)}
            />
          ),
        )}

        {ferramenta !== 'selecionar' && ponteiro && (
          <Previa
            ferramenta={ferramenta}
            emoji={emoji}
            avatar={usuario.avatar}
            x={ponteiro.x}
            y={ponteiro.y}
          />
        )}

        {anotacoes.length === 0 && (
          <p className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-center font-inter text-[#6F6F76] text-sm">
            Escolha uma ferramenta e clique no quadro para começar.
          </p>
        )}
      </div>

      {/* Barra flutuante, no rodapé do quadro. */}
      <div className="-translate-x-1/2 absolute bottom-5 left-1/2 flex flex-col items-center gap-2">
        {paletaEmoji && ferramenta === 'emoji' && (
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#232327] p-1.5 shadow-lg">
            {EMOJIS_MURAL.map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => {
                  setEmoji(opcao)
                  setPaletaEmoji(false)
                }}
                aria-label={`Emoji ${opcao}`}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full text-xl transition-colors hover:bg-white/8',
                  emoji === opcao && 'bg-white/12',
                )}
              >
                {opcao}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#232327] p-1.5 shadow-lg">
          {FERRAMENTAS.map((item) => {
            const Icone = item.icone
            const selecionada = ferramenta === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setFerramenta(item.id)
                  setPaletaEmoji(item.id === 'emoji')
                }}
                aria-label={item.titulo}
                aria-pressed={selecionada}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full transition-colors',
                  selecionada
                    ? 'bg-white text-[#131316]'
                    : 'text-[#8A8A8F] hover:bg-white/8 hover:text-white',
                )}
              >
                {Icone ? (
                  <Icone className="size-4.5" />
                ) : (
                  <span className="text-xl">{emoji}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
