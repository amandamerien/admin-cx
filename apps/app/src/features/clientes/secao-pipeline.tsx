import { cn } from '@repo/ui'
import {
  Ban,
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  CircleDashed,
  Hammer,
  Hourglass,
  ScanEye,
} from 'lucide-react'
import { useState } from 'react'
import { ResponsaveisComAvatar } from './avatares'
import {
  type Administrador,
  CLASSES_BARRA_COLUNA,
  CLASSES_STATUS_FUNIL,
  type Cliente,
  COLUNA_PIPELINE_LABEL,
  COLUNAS_PIPELINE,
  type ColunaPipeline,
  ETAPA_FUNIL_LABEL,
  ETAPAS_FUNIL,
  type Funil,
  progressoDoFunil,
  responsaveisDoFunil,
} from './dados'
import { DonutEtapa } from './graficos'

/* Um ícone por status, escolhido pelo que cada momento é de fato: a entrega
 * ainda não saiu do lugar, está sendo construída, parada esperando o cliente,
 * sob revisão, travada, ou pronta. Ler o trilho de cima a baixo conta a
 * história da entrega sem precisar do rótulo. */
const ICONES_COLUNA: Record<ColunaPipeline, typeof CircleDashed> = {
  nao_iniciado: CircleDashed,
  em_andamento: Hammer,
  aguardando_cliente: Hourglass,
  em_revisao: ScanEye,
  bloqueado: Ban,
  concluido: CircleCheckBig,
}

/* Uma entrega dentro do grupo do status: nome e cliente à esquerda, progresso
 * da etapa e responsável à direita. */
function Linha({
  funil,
  cliente,
  administradores,
  arrastando,
  onArrastarInicio,
  onArrastarFim,
  onMover,
}: {
  funil: Funil
  cliente: string
  administradores: Administrador[]
  arrastando: boolean
  onArrastarInicio: () => void
  onArrastarFim: () => void
  onMover: (direcao: -1 | 1) => void
}) {
  const indice = COLUNAS_PIPELINE.indexOf(funil.status)
  const responsaveis = responsaveisDoFunil(funil)

  return (
    <li
      draggable
      onDragStart={(evento) => {
        evento.dataTransfer.setData('text/plain', funil.id)
        evento.dataTransfer.effectAllowed = 'move'
        onArrastarInicio()
      }}
      onDragEnd={onArrastarFim}
      className={cn(
        'group flex cursor-grab items-center gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition-colors hover:border-white/16 active:cursor-grabbing',
        arrastando && 'opacity-40',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-inter font-medium text-[#F4F5F5] text-sm leading-snug">
          {funil.nome}
        </p>
        <p className="truncate pt-0.5 font-inter text-[#8A8A8F] text-xs">
          {cliente}
        </p>
      </div>

      {/* O anel diz a etapa e a porcentagem no hover — por isso não há selo de
          etapa aqui. */}
      <DonutEtapa
        progresso={progressoDoFunil(funil)}
        rotulo={ETAPA_FUNIL_LABEL[funil.etapa]}
        posicao={ETAPAS_FUNIL.indexOf(funil.etapa) + 1}
        total={ETAPAS_FUNIL.length}
        concluido={funil.status === 'concluido'}
      />

      <span className="flex shrink-0 items-center rounded-md border border-white/8 bg-white/4 px-2 py-1">
        <ResponsaveisComAvatar
          administradores={administradores}
          nomes={responsaveis}
          className="max-w-40 font-inter text-[#ABABAB] text-xs"
        />
      </span>

      {/* Arrastar é o caminho principal; as setas ficam como alternativa de
          teclado, que o drag nativo do navegador não cobre. Como a lista é
          vertical, elas apontam para cima e para baixo. */}
      <div className="flex shrink-0 flex-col opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onMover(-1)}
          disabled={indice === 0}
          aria-label={`Mover "${funil.nome}" para o status anterior`}
          className="flex size-5 items-center justify-center rounded text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronUp className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onMover(1)}
          disabled={indice === COLUNAS_PIPELINE.length - 1}
          aria-label={`Mover "${funil.nome}" para o próximo status`}
          className="flex size-5 items-center justify-center rounded text-[#6F6F76] transition-colors hover:bg-white/6 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    </li>
  )
}

interface SecaoPipelineProps {
  funis: Funil[]
  clientes: Cliente[]
  administradores: Administrador[]
  onMover: (funil: Funil, direcao: -1 | 1) => void
  /** Solta a entrega em outro status (arrasto). */
  onAlterarStatus: (funil: Funil, status: ColunaPipeline) => void
}

/* Pipeline — os status um abaixo do outro, cada um com as entregas que estão
 * nele. Em lista vertical cabem os seis status sem rolagem lateral e sem
 * espremer o card, o que o quadro em colunas não conseguia. O cadastro mora em
 * Entregas: aqui só se empurra a entrega de um status para o outro. */
export function SecaoPipeline({
  funis,
  clientes,
  administradores,
  onMover,
  onAlterarStatus,
}: SecaoPipelineProps) {
  /* Qual entrega está na mão e sobre qual status ela está pairando. */
  const [arrastado, setArrastado] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<ColunaPipeline | null>(null)

  function soltar(coluna: ColunaPipeline, id: string) {
    setArrastado(null)
    setAlvo(null)

    const funil = funis.find((item) => item.id === id)
    if (funil && funil.status !== coluna) onAlterarStatus(funil, coluna)
  }

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

  return (
    <ol className="flex flex-col">
      {COLUNAS_PIPELINE.map((coluna, indice) => {
        const doGrupo = funis.filter((funil) => funil.status === coluna)
        const ultimo = indice === COLUNAS_PIPELINE.length - 1
        const Icone = ICONES_COLUNA[coluna]

        return (
          /* Status sem nada fica apagado: some do caminho da leitura sem
             sumir da lista, e quem tem entrega salta à vista. Durante um
             arrasto todos acendem — senão não dá para mirar num grupo vazio. */
          <li
            key={coluna}
            onDragOver={(evento) => {
              evento.preventDefault()
              evento.dataTransfer.dropEffect = 'move'
              setAlvo(coluna)
            }}
            onDragLeave={(evento) => {
              /* Só larga o destaque quando o ponteiro sai do grupo inteiro, e
                 não ao cruzar a borda de um filho. */
              if (
                !evento.currentTarget.contains(evento.relatedTarget as Node)
              ) {
                setAlvo((atual) => (atual === coluna ? null : atual))
              }
            }}
            onDrop={(evento) => {
              evento.preventDefault()
              soltar(coluna, evento.dataTransfer.getData('text/plain'))
            }}
            className={cn(
              'flex gap-4 rounded-2xl transition-opacity',
              doGrupo.length === 0 && !arrastado && 'opacity-40',
              alvo === coluna && 'bg-white/2 ring-1 ring-white/16 ring-inset',
            )}
          >
            {/* Trilho: o marcador do status e a linha pontilhada que emenda no
                grupo seguinte. */}
            <div className="flex flex-col items-center py-1">
              {/* Mesmo tratamento dos ícones do Dashboard: fundo e anel na cor
                  do próprio status, num badge pequeno. */}
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
                  CLASSES_STATUS_FUNIL[coluna],
                )}
              >
                <Icone className="size-4" />
              </span>

              {!ultimo && (
                <span
                  aria-hidden
                  className="w-px flex-1 border-white/12 border-l border-dashed"
                />
              )}
            </div>

            <div
              className={cn(
                'min-w-0 flex-1 py-1',
                !ultimo && (doGrupo.length > 0 ? 'pb-6' : 'pb-3'),
              )}
            >
              <h3 className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/2 px-3 py-2">
                <span
                  aria-hidden
                  className={cn(
                    'h-4 w-1 rounded-full',
                    CLASSES_BARRA_COLUNA[coluna],
                  )}
                />
                <span className="font-inter font-medium text-[#F4F5F5] text-sm">
                  {COLUNA_PIPELINE_LABEL[coluna]}
                </span>
                <span className="rounded-md bg-white/6 px-1.5 py-0.5 font-inter text-[#ABABAB] text-xs tabular-nums">
                  {doGrupo.length}
                </span>
              </h3>

              {doGrupo.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {doGrupo.map((funil) => (
                    <Linha
                      key={funil.id}
                      funil={funil}
                      cliente={nomeDoCliente(funil.clienteId)}
                      administradores={administradores}
                      arrastando={arrastado === funil.id}
                      onArrastarInicio={() => setArrastado(funil.id)}
                      onArrastarFim={() => {
                        setArrastado(null)
                        setAlvo(null)
                      }}
                      onMover={(direcao) => onMover(funil, direcao)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
