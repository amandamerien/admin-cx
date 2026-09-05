import { cn } from '@repo/ui'
import { Avatar } from './avatares'
import type { AvatarId, MesDeEntregas } from './dados'

/* Gráfico de colunas. As alturas são proporcionais ao maior valor da série;
 * séries zeradas mostram só a linha de base. Passar o mouse abre a quebra do
 * mês por responsável. */
export function GraficoColunas({ dados }: { dados: MesDeEntregas[] }) {
  const maior = Math.max(...dados.map((item) => item.total), 1)

  return (
    <div className="flex h-64 items-end gap-2 pt-6">
      {dados.map((item) => {
        const resumo =
          item.total === 0
            ? 'nenhuma entrega'
            : item.porResponsavel
                .map((linha) => `${linha.responsavel} ${linha.total}`)
                .join(', ')

        return (
          <div
            key={item.chave}
            className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            /* `role="img"` para o leitor de tela receber a coluna como um
               gráfico único, descrito pelo aria-label. */
            role="img"
            aria-label={`${item.rotulo}: ${resumo}`}
          >
            {/* Quebra por responsável, só no hover. */}
            <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-48 rounded-lg border border-white/10 bg-[#17171A] px-2.5 py-2 shadow-lg group-hover:block">
              <p className="font-inter font-medium text-[#F4F5F5] text-xs capitalize">
                {item.rotulo}
              </p>

              {item.total === 0 ? (
                <p className="pt-1 font-inter text-[#6F6F76] text-xs">
                  Nenhuma entrega
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5 pt-1">
                  {item.porResponsavel.map((linha) => (
                    <li
                      key={linha.responsavel}
                      className="flex items-center justify-between gap-3 font-inter text-xs"
                    >
                      <span className="text-[#ABABAB]">
                        {linha.responsavel}
                      </span>
                      <span className="text-[#F4F5F5] tabular-nums">
                        {linha.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <span className="font-inter font-medium text-[#F4F5F5] text-sm tabular-nums">
              {item.total > 0 ? item.total : ''}
            </span>

            <div
              className={cn(
                'w-full rounded-t-md transition-all',
                item.total > 0
                  ? 'bg-white/70 group-hover:bg-white'
                  : 'bg-white/8',
              )}
              style={{
                height:
                  item.total > 0 ? `${(item.total / maior) * 100}%` : '2px',
              }}
            />

            <span className="font-inter text-[#8A8A8F] text-sm capitalize">
              {item.rotulo}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* Gráfico de barras deitadas, para categorias com nome. */
export function GraficoBarras({
  dados,
  vazio,
}: {
  dados: { rotulo: string; total: number; avatar?: AvatarId | null }[]
  vazio: string
}) {
  const maior = Math.max(...dados.map((item) => item.total), 1)

  if (dados.length === 0) {
    return <p className="pt-4 font-inter text-[#6F6F76] text-xs">{vazio}</p>
  }

  return (
    <ul className="flex flex-col gap-3.5 pt-5">
      {dados.map((item) => (
        <li key={item.rotulo} className="flex items-center gap-3">
          <span className="flex w-36 shrink-0 items-center gap-2 font-inter text-[#ABABAB] text-sm">
            {item.avatar && (
              <Avatar
                avatar={item.avatar}
                rotulo={item.rotulo}
                className="size-4 rounded-[4px]"
              />
            )}
            <span className="truncate">{item.rotulo}</span>
          </span>

          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-white/70"
              style={{ width: `${(item.total / maior) * 100}%` }}
            />
          </div>

          <span className="w-7 shrink-0 text-right font-inter font-medium text-[#F4F5F5] text-sm tabular-nums">
            {item.total}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* Moldura comum dos blocos do dashboard. */
export function Bloco({
  titulo,
  apoio,
  children,
}: {
  titulo: string
  apoio?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-5">
      <h3 className="font-inter font-medium text-base text-white">{titulo}</h3>
      {apoio && (
        <p className="pt-0.5 font-inter text-[#6F6F76] text-xs">{apoio}</p>
      )}
      {children}
    </div>
  )
}

/* Anel de progresso da etapa. O arco azul cobre a fração da esteira já
 * percorrida; passar o mouse mostra o nome da etapa. */
/* Anel de "quanto do combinado já saiu": concluídas sobre contratadas. */
export function AnelProgresso({
  feito,
  total,
  compacto = false,
  className,
}: {
  feito: number
  total: number
  /* No cartão ele divide a linha com os selos, então acompanha o tamanho
     deles; na ficha, onde há espaço, fica maior. */
  compacto?: boolean
  className?: string
}) {
  const raio = 8
  const circunferencia = 2 * Math.PI * raio
  const fracao = total > 0 ? Math.min(feito / total, 1) : 0
  const completo = total > 0 && feito >= total

  return (
    <span
      className={cn(
        'flex items-center',
        compacto ? 'gap-1.5' : 'gap-2',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn('-rotate-90 shrink-0', compacto ? 'size-4' : 'size-5')}
        role="img"
        aria-label={`${feito} de ${total} entregas concluídas`}
      >
        <circle
          cx="12"
          cy="12"
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth={compacto ? 3.5 : 3}
          className="text-white/10"
        />
        <circle
          cx="12"
          cy="12"
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth={compacto ? 3.5 : 3}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - fracao)}
          className={cn(
            'transition-[stroke-dashoffset] duration-300',
            completo ? 'text-emerald-400' : 'text-sky-400',
          )}
        />
      </svg>

      <span
        className={cn(
          'font-inter tabular-nums',
          compacto ? 'text-[10px]' : 'text-sm',
        )}
      >
        {feito} de {total}
      </span>
    </span>
  )
}

export function DonutEtapa({
  progresso,
  rotulo,
  posicao,
  total,
  concluido = false,
}: {
  /* De 0 a 100. */
  progresso: number
  /* Nome da etapa, mostrado no hover. */
  rotulo: string
  /* Posição da etapa na esteira, começando em 1. */
  posicao: number
  total: number
  /* Funil concluído: o anel fecha em verde, independente da etapa. */
  concluido?: boolean
}) {
  const raio = 10
  const circunferencia = 2 * Math.PI * raio

  return (
    <div
      className="group relative inline-flex"
      role="img"
      aria-label={
        concluido
          ? 'Concluído: 100%'
          : `${rotulo}: etapa ${posicao} de ${total}, ${progresso}%`
      }
    >
      <svg
        viewBox="0 0 28 28"
        className="-rotate-90 size-7"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="14"
          cy="14"
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-white/10"
        />
        <circle
          cx="14"
          cy="14"
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - progresso / 100)}
          className={cn(
            'transition-[stroke-dashoffset] duration-300',
            concluido ? 'text-emerald-400' : 'text-sky-400',
          )}
        />
      </svg>

      <span className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max rounded-lg border border-white/10 bg-[#17171A] px-2.5 py-1.5 shadow-lg group-hover:block">
        <span className="block font-inter font-medium text-[#F4F5F5] text-xs">
          {concluido ? 'Concluído' : rotulo}
        </span>
        <span className="block font-inter text-[#6F6F76] text-xs">
          {concluido ? '100%' : `Etapa ${posicao} de ${total} · ${progresso}%`}
        </span>
      </span>
    </div>
  )
}
