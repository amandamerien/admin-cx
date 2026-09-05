import { GitBranch, KeyRound, Paperclip, StickyNote } from 'lucide-react'

/* As quatro frentes de um cliente, com o ícone de cada uma.
 *
 * Uma lista só, usada nas abas da ficha e nos selos do cartão — assim o ícone
 * que marca "este cliente tem arquivos" é o mesmo da aba de Arquivos, e não
 * duas coisas parecidas que se descolam com o tempo. */
export const FRENTES = [
  { id: 'entregas', titulo: 'Entregas', icone: GitBranch },
  { id: 'anotacoes', titulo: 'Anotações', icone: StickyNote },
  { id: 'arquivos', titulo: 'Arquivos', icone: Paperclip },
  { id: 'acessos', titulo: 'Acessos', icone: KeyRound },
] as const

export type FrenteId = (typeof FRENTES)[number]['id']

/** Quantos itens o cliente tem em cada frente. */
export type ContagemPorFrente = Record<FrenteId, number>

/* Selos do que o cliente já tem. Frente vazia não aparece: o cartão mostra o
 * que existe, não o que falta. */
export function SelosDoCliente({
  contagem,
  className,
}: {
  contagem: ContagemPorFrente
  className?: string
}) {
  const comConteudo = FRENTES.filter((frente) => contagem[frente.id] > 0)
  if (comConteudo.length === 0) return null

  return (
    <ul className={className}>
      {comConteudo.map((frente) => {
        const Icone = frente.icone
        const total = contagem[frente.id]

        return (
          <li
            key={frente.id}
            title={`${total} ${total === 1 ? frente.titulo.replace(/s$/, '') : frente.titulo}`}
            className="flex items-center gap-1 rounded-md bg-white/6 px-1.5 py-0.5 font-inter text-[#ABABAB] text-[10px] tabular-nums"
          >
            <Icone className="size-3 shrink-0" />
            {total}
          </li>
        )
      })}
    </ul>
  )
}
