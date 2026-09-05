import { cn } from '@repo/ui'
import { Lock } from 'lucide-react'

export const ABAS_CONFIGURACOES = [
  { id: 'administradores', titulo: 'Administradores' },
  { id: 'acessos', titulo: 'Acessos' },
] as const

export type AbaConfiguracoes = (typeof ABAS_CONFIGURACOES)[number]['id']

/* Barra de abas de Configurações. O conteúdo de cada aba é renderizado pela
 * página, para o botão do cabeçalho poder reagir à aba escolhida. */
export function AbasConfiguracoes({
  ativa,
  podeVerAcessos,
  onSelecionar,
}: {
  ativa: AbaConfiguracoes
  /* Quem entra e de onde é informação da equipe: só administrador vê. A aba
     continua visível, com cadeado, para a pessoa saber que ela existe. */
  podeVerAcessos: boolean
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
        const bloqueada = aba.id === 'acessos' && !podeVerAcessos

        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            disabled={bloqueada}
            title={bloqueada ? 'Só administradores veem os acessos' : undefined}
            onClick={() => onSelecionar(aba.id)}
            className={cn(
              '-mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 font-inter font-medium text-sm transition-colors',
              bloqueada
                ? 'cursor-not-allowed border-transparent text-[#5A5A61]'
                : selecionada
                  ? 'border-white text-white'
                  : 'border-transparent text-[#8A8A8F] hover:text-white',
            )}
          >
            {aba.titulo}
            {bloqueada && <Lock className="size-3 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}
