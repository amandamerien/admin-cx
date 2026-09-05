import { cn } from '@repo/ui'
import {
  BookMarked,
  BookText,
  FileSignature,
  Gift,
  GitBranch,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  StickyNote,
  Users,
} from 'lucide-react'
import { Fragment } from 'react'

/* Menu em grupos, na ordem em que aparecem. "Visão geral" é o retrato do
 * todo; "Operação" é o trabalho do dia; "Onboarding" é o material que o time
 * envia ao cliente; "Gestão" são os ajustes. */
export const GRUPOS = [
  {
    rotulo: 'Visão geral',
    itens: [
      { id: 'dashboard', titulo: 'Dashboard', icone: LayoutDashboard },
      { id: 'pipeline', titulo: 'Pipeline', icone: KanbanSquare },
    ],
  },
  {
    rotulo: 'Operação',
    itens: [
      { id: 'clientes', titulo: 'Clientes', icone: Users },
      { id: 'funis', titulo: 'Entregas', icone: GitBranch },
      {
        id: 'playbooks',
        titulo: 'Playbooks',
        icone: BookMarked,
        selo: 'Em breve',
      },
      { id: 'mural', titulo: 'Anotações', icone: StickyNote },
    ],
  },
  {
    rotulo: 'Onboarding',
    itens: [
      {
        id: 'contrato',
        titulo: 'Contrato',
        icone: FileSignature,
        selo: 'Em breve',
      },
      { id: 'invoices', titulo: 'Invoices', icone: ReceiptText },
      { id: 'documentacao', titulo: 'Documentação', icone: BookText },
      { id: 'indicacoes', titulo: 'Indique e ganhe', icone: Gift },
    ],
  },
  {
    rotulo: 'Gestão',
    itens: [{ id: 'configuracoes', titulo: 'Configurações', icone: Settings }],
  },
] as const

export type SecaoMenu = (typeof GRUPOS)[number]['itens'][number]['id']

interface BarraLateralProps {
  ativo: SecaoMenu
  onSelecionar: (secao: SecaoMenu) => void
  onSair: () => void
}

/* Ordem em que o brilho percorre as oito casas da borda — é o que dá a
 * sensação de giro. O centro fica parado, mais apagado. */
const VOLTA = [0, 1, 2, 5, 8, 7, 6, 3]

/* As nove casas da grade, na ordem de leitura. */
const CASAS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

/* Grade 3x3 pulsando em sequência, no lugar do ícone do item ativo. */
function GradeCarregando() {
  return (
    <span
      className="grid size-4 shrink-0 grid-cols-3 gap-px text-sky-400"
      aria-hidden="true"
    >
      {CASAS.map((casa) => {
        const posicao = VOLTA.indexOf(casa)
        const centro = casa === 4

        return (
          <span
            key={casa}
            className={cn(
              'rounded-[1px] bg-current',
              centro
                ? 'opacity-25'
                : 'animate-pulse opacity-90 motion-reduce:animate-none',
            )}
            style={
              centro
                ? undefined
                : {
                    animationDelay: `${posicao * 110}ms`,
                    animationDuration: '900ms',
                  }
            }
          />
        )
      })}
    </span>
  )
}

function BotaoMenu({
  titulo,
  icone: Icone,
  selecionado,
  selo,
  onClick,
}: {
  titulo: string
  icone: typeof LayoutDashboard
  selecionado: boolean
  /** Etiqueta ao lado do nome, para itens que ainda não estão prontos. */
  selo?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selecionado ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-full px-3.5 py-2 text-left font-inter font-medium text-sm transition-colors',
        selecionado
          ? 'text-white'
          : 'text-[#8A8A8F] hover:bg-white/4 hover:text-white',
      )}
    >
      {selecionado ? (
        <GradeCarregando />
      ) : (
        <Icone className="size-4 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate">{titulo}</span>

      {selo && (
        <span className="shrink-0 rounded-md bg-white/6 px-1.5 py-0.5 font-inter font-medium text-[#8A8A8F] text-[10px]">
          {selo}
        </span>
      )}
    </button>
  )
}

export function BarraLateral({
  ativo,
  onSelecionar,
  onSair,
}: BarraLateralProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-white/8 border-b lg:h-screen lg:w-60 lg:overflow-y-auto lg:border-r lg:border-b-0">
      {/* 26px = os 12px do nav mais os 14px do botão: alinha a logo com o
          ícone dos itens do menu. */}
      <div className="flex h-16 items-center px-[26px]">
        <a href="/" className="flex items-center">
          <img
            src="/images/cx-delivery.webp"
            alt="CX Delivery"
            className="h-7 w-auto"
          />
        </a>
      </div>

      <nav
        className="flex flex-1 flex-col px-3 pb-4 lg:pt-2"
        aria-label="Navegação principal"
      >
        <ul className="flex gap-1 lg:h-full lg:flex-col">
          {GRUPOS.map((grupo) => (
            <Fragment key={grupo.rotulo ?? 'principal'}>
              {/* O rótulo do grupo só existe no desktop: no mobile a barra é
                  uma faixa horizontal e os itens seguem em linha. */}
              {grupo.rotulo && (
                <li className="hidden px-3 pt-6 pb-1.5 lg:block">
                  <span className="font-inter font-semibold text-[#6F6F76] text-[11px] uppercase tracking-wider">
                    {grupo.rotulo}
                  </span>
                </li>
              )}

              {grupo.itens.map((item) => (
                <li key={item.id}>
                  <BotaoMenu
                    titulo={item.titulo}
                    icone={item.icone}
                    selecionado={item.id === ativo}
                    selo={'selo' in item ? item.selo : undefined}
                    onClick={() => onSelecionar(item.id)}
                  />
                </li>
              ))}
            </Fragment>
          ))}

          {/* Sair fica sozinho no pé da barra. */}
          <li className="lg:mt-auto">
            <BotaoMenu
              titulo="Sair"
              icone={LogOut}
              selecionado={false}
              onClick={onSair}
            />
          </li>
        </ul>
      </nav>
    </aside>
  )
}
