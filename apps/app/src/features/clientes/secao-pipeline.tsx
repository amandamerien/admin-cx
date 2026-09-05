import { cn } from '@repo/ui'
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar } from './avatares'
import {
  type Administrador,
  avatarDoResponsavel,
  CLASSES_BARRA_COLUNA,
  CLASSES_ETAPA,
  type Cliente,
  COLUNA_PIPELINE_LABEL,
  COLUNAS_PIPELINE,
  ETAPA_FUNIL_LABEL,
  type Funil,
  formatarData,
} from './dados'

function Card({
  funil,
  cliente,
  administradores,
  onMover,
}: {
  funil: Funil
  cliente: string
  administradores: Administrador[]
  onMover: (direcao: -1 | 1) => void
}) {
  const indice = COLUNAS_PIPELINE.indexOf(funil.status)
  const avatar = avatarDoResponsavel(administradores, funil.responsavel)

  return (
    <li className="group relative rounded-xl border border-white/8 bg-white/3 p-3 transition-colors hover:border-white/16">
      {/* O nome do funil é o assunto do card: fica na primeira linha, com a
          etapa à direita. O status não vira selo aqui — a coluna onde o card
          está já é ele. */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 font-inter font-medium text-[#F4F5F5] text-xs leading-snug">
          {funil.nome}
        </h4>

        <span
          className={cn(
            'mt-px shrink-0 rounded px-1.5 py-0.5 font-inter font-medium text-[10px] leading-none ring-1 ring-inset',
            CLASSES_ETAPA[funil.etapa],
          )}
        >
          {ETAPA_FUNIL_LABEL[funil.etapa]}
        </span>
      </div>

      <p className="pt-0.5 font-inter text-[#8A8A8F] text-[10px] leading-snug">
        {cliente}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-white/8 border-t pt-3">
        {/* Entrega e responsável no mesmo canto: a data à direita, colada no
            bichinho de quem toca o funil. */}
        <div className="flex min-w-0 items-center gap-1.5">
          <CalendarClock className="size-3 shrink-0 text-[#6F6F76]" />
          <span className="truncate font-inter text-[#8A8A8F] text-[10px]">
            {formatarData(funil.dataEntrega)}
          </span>
        </div>

        <span
          className="shrink-0"
          title={funil.responsavel || 'Sem responsável'}
        >
          {avatar ? (
            <Avatar
              avatar={avatar}
              className="size-4 rounded-[4px]"
              rotulo={funil.responsavel}
            />
          ) : (
            /* Responsável que não está (ou não está mais) na equipe: sem
               avatar, fica a inicial no lugar do bichinho. */
            <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-white/8 font-inter font-medium text-[#8A8A8F] text-[10px]">
              {funil.responsavel.trim().charAt(0).toUpperCase() || '—'}
            </span>
          )}
        </span>

        {/* Sem arrastar: as setas movem entre colunas e funcionam no teclado.
            Só aparecem no hover, encostadas na borda direita. */}
        <div className="-right-1 absolute bottom-2 flex shrink-0 items-center gap-0.5 rounded-md bg-[#1B1B1F] opacity-0 shadow-sm transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onMover(-1)}
            disabled={indice === 0}
            aria-label={`Mover "${funil.nome}" para a coluna anterior`}
            className="flex size-6 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onMover(1)}
            disabled={indice === COLUNAS_PIPELINE.length - 1}
            aria-label={`Mover "${funil.nome}" para a próxima coluna`}
            className="flex size-6 items-center justify-center rounded-md text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  )
}

interface SecaoPipelineProps {
  funis: Funil[]
  clientes: Cliente[]
  administradores: Administrador[]
  onMover: (funil: Funil, direcao: -1 | 1) => void
}

/* Pipeline — quadro com os funis cadastrados, coluna a coluna. O cadastro
 * mora em Funis: aqui só se empurra o card. */
export function SecaoPipeline({
  funis,
  clientes,
  administradores,
  onMover,
}: SecaoPipelineProps) {
  function nomeDoCliente(clienteId: string) {
    return clientes.find((cliente) => cliente.id === clienteId)?.nome ?? '—'
  }

  if (funis.length === 0) {
    return (
      <p className="rounded-2xl border border-white/8 border-dashed px-6 py-12 text-center font-inter text-[#6F6F76] text-sm">
        Nenhuma entrega cadastrada. Os cards aparecem aqui assim que você
        cadastrar uma entrega em Entregas.
      </p>
    )
  }

  /* São seis colunas agora: numa tela comum elas entram em duas fileiras de
     três, e só em monitor bem largo cabem as seis lado a lado. Espremer as
     seis sempre deixaria o card estreito demais para ler o nome do funil. */
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {COLUNAS_PIPELINE.map((coluna) => {
        const daColuna = funis.filter((funil) => funil.status === coluna)

        return (
          <section
            key={coluna}
            className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/8 bg-white/2 p-3"
            aria-label={COLUNA_PIPELINE_LABEL[coluna]}
          >
            <div className="flex items-center gap-2 px-1">
              {/* Barrinha colorida identificando a coluna, como no quadro de
                  referência. */}
              <span
                aria-hidden
                className={cn(
                  'h-4 w-1 rounded-full',
                  CLASSES_BARRA_COLUNA[coluna],
                )}
              />

              <h3 className="font-inter font-medium text-[#F4F5F5] text-sm">
                {COLUNA_PIPELINE_LABEL[coluna]}
              </h3>

              <span className="rounded-md bg-white/6 px-1.5 py-0.5 font-inter text-[#ABABAB] text-xs tabular-nums">
                {daColuna.length}
              </span>
            </div>

            <ul className="flex flex-col gap-2">
              {daColuna.map((funil) => (
                <Card
                  key={funil.id}
                  funil={funil}
                  cliente={nomeDoCliente(funil.clienteId)}
                  administradores={administradores}
                  onMover={(direcao) => onMover(funil, direcao)}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
