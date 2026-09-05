import { cn } from '@repo/ui'

export const ABAS_CONFIGURACOES = [
  { id: 'administradores', titulo: 'Administradores' },
  { id: 'checklist', titulo: 'Checklist de onboarding' },
] as const

export type AbaConfiguracoes = (typeof ABAS_CONFIGURACOES)[number]['id']

/* Barra de abas de Configurações. O conteúdo de cada aba é renderizado pela
 * página, para o botão do cabeçalho poder reagir à aba escolhida. */
export function AbasConfiguracoes({
  ativa,
  onSelecionar,
}: {
  ativa: AbaConfiguracoes
  onSelecionar: (aba: AbaConfiguracoes) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Seções de configurações"
      className="flex gap-1 border-white/8 border-b"
    >
      {ABAS_CONFIGURACOES.map((aba) => {
        const selecionada = aba.id === ativa

        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onSelecionar(aba.id)}
            className={cn(
              '-mb-px border-b-2 px-3 pb-2.5 font-inter font-medium text-sm transition-colors',
              selecionada
                ? 'border-white text-white'
                : 'border-transparent text-[#8A8A8F] hover:text-white',
            )}
          >
            {aba.titulo}
          </button>
        )
      })}
    </div>
  )
}
