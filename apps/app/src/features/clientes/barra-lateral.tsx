import { cn } from '@repo/ui'
import {
  GitBranch,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  StickyNote,
  Users,
} from 'lucide-react'
import { Fragment } from 'react'

/* Menu em grupos, na ordem em que aparecem. Dashboard abre sozinho, sem
 * rótulo; "Operação" é o trabalho do dia; "Gestão" são os ajustes. */
export const GRUPOS = [
  {
    rotulo: null,
    itens: [{ id: 'dashboard', titulo: 'Dashboard', icone: LayoutDashboard }],
  },
  {
    rotulo: 'Operação',
    itens: [
      { id: 'clientes', titulo: 'Clientes', icone: Users },
      { id: 'funis', titulo: 'Entregas', icone: GitBranch },
      { id: 'pipeline', titulo: 'Pipeline', icone: KanbanSquare },
      { id: 'mural', titulo: 'Anotações', icone: StickyNote },
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
      className="grid size-4 shrink-0 grid-cols-3 gap-px"
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
  onClick,
}: {
  titulo: string
  icone: typeof LayoutDashboard
  selecionado: boolean
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
      {titulo}
    </button>
  )
}

export function BarraLateral({
  ativo,
  onSelecionar,
  onSair,
}: BarraLateralProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-white/8 border-b lg:h-screen lg:w-60 lg:border-r lg:border-b-0">
      <div className="flex h-16 items-center px-5">
        <a href="/" className="flex items-center">
          <img
            src="/images/logo-white.webp"
            alt="Clickmax"
            className="h-5 w-auto"
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
