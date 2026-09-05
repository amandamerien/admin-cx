import { cn } from '@repo/ui'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* Copia o valor e confirma trocando o ícone por alguns segundos. */
export function BotaoCopiar({
  valor,
  rotulo,
}: {
  valor: string
  rotulo: string
}) {
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
