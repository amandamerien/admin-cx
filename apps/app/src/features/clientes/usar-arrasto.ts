import { useRef, useState } from 'react'

/* Arrastar um item do mural.
 *
 * A posição é guardada em porcentagem do quadro, para acompanhar o
 * redimensionamento; aqui a conta vai e volta entre pixel e porcentagem.
 *
 * O item nunca escapa: a posição é limitada pelo próprio tamanho dele, então
 * ele para encostado na borda em vez de sumir metade para fora. */
export function useArrasto({
  centrado,
  onMover,
}: {
  /** O item é ancorado pelo centro (emoji, comentário) ou pelo canto (post-it). */
  centrado: boolean
  onMover: (x: number, y: number) => void
}) {
  const [arrastando, setArrastando] = useState(false)
  /* Onde dentro do item o dedo pegou — sem isso o item pula, encostando o
     canto no ponteiro no primeiro movimento. */
  const pegada = useRef({ x: 0, y: 0 })

  function aoPressionar(evento: React.PointerEvent<HTMLElement>) {
    /* Campo de texto e botões continuam funcionando: só o resto do item é
       alça de arrasto. */
    const alvo = evento.target as HTMLElement
    if (alvo.closest('textarea, input, button, a')) return

    const item = evento.currentTarget
    const quadro = item.offsetParent as HTMLElement | null
    if (!quadro) return

    const caixa = item.getBoundingClientRect()
    pegada.current = {
      x: evento.clientX - caixa.left,
      y: evento.clientY - caixa.top,
    }

    evento.preventDefault()
    item.setPointerCapture(evento.pointerId)
    setArrastando(true)

    function aoMover(movimento: PointerEvent) {
      const areaQuadro = quadro?.getBoundingClientRect()
      if (!areaQuadro) return

      const caixaItem = item.getBoundingClientRect()

      /* Canto superior esquerdo do item, em pixels do quadro, limitado para
         a caixa inteira caber dentro dele. */
      const limite = (valor: number, maximo: number) =>
        Math.min(Math.max(valor, 0), Math.max(maximo, 0))

      const esquerda = limite(
        movimento.clientX - areaQuadro.left - pegada.current.x,
        areaQuadro.width - caixaItem.width,
      )
      const topo = limite(
        movimento.clientY - areaQuadro.top - pegada.current.y,
        areaQuadro.height - caixaItem.height,
      )

      const ancoraX = centrado ? esquerda + caixaItem.width / 2 : esquerda
      const ancoraY = centrado ? topo + caixaItem.height / 2 : topo

      onMover(
        (ancoraX / areaQuadro.width) * 100,
        (ancoraY / areaQuadro.height) * 100,
      )
    }

    function aoSoltar() {
      setArrastando(false)
      item.releasePointerCapture(evento.pointerId)
      item.removeEventListener('pointermove', aoMover)
      item.removeEventListener('pointerup', aoSoltar)
      item.removeEventListener('pointercancel', aoSoltar)
    }

    item.addEventListener('pointermove', aoMover)
    item.addEventListener('pointerup', aoSoltar)
    item.addEventListener('pointercancel', aoSoltar)
  }

  return { arrastando, aoPressionar }
}
