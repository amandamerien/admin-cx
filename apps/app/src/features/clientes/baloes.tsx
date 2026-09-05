import { useEffect, useRef } from 'react'

interface Balao {
  x: number
  y: number
  subida: number
  raio: number
  cor: string
  fase: number
  balanco: number
}

const CORES = [
  '#38BDF8',
  '#34D399',
  '#FBBF24',
  '#F472B6',
  '#A78BFA',
  '#FB7185',
] as const

/* Balões subindo pela tela, disparados a cada mudança de `disparo`.
 *
 * Canvas próprio, sem biblioteca: cada balão sobe em velocidade própria,
 * balançando de leve, com o barbante desenhado atrás. Quem tem "reduzir
 * movimento" ligado não vê nada. */
export function Baloes({ disparo }: { disparo: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  /* Igual ao confete: sem isto, remontar o componente (sair e entrar) faria os
     balões subirem de novo sozinhos. */
  const ultimoDisparo = useRef(disparo)

  useEffect(() => {
    if (disparo === ultimoDisparo.current) return
    ultimoDisparo.current = disparo

    const canvas = canvasRef.current
    if (!canvas) return

    const contexto = canvas.getContext('2d')
    if (!contexto) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const baloes: Balao[] = Array.from({ length: 18 }, () => {
      const raio = 16 + Math.random() * 14

      return {
        x: Math.random() * canvas.width,
        /* Logo abaixo da borda, com um escalonamento curto: começam a aparecer
           quase de imediato, sem subirem todos em bloco. */
        y: canvas.height + raio * 2 + Math.random() * canvas.height * 0.25,
        subida: 4 + Math.random() * 3,
        raio,
        cor: CORES[Math.floor(Math.random() * CORES.length)] ?? CORES[0],
        fase: Math.random() * Math.PI * 2,
        balanco: 12 + Math.random() * 18,
      }
    })

    let animacao = 0
    let quadro = 0

    function desenharBalao(balao: Balao, deslocamento: number) {
      if (!contexto) return
      const x = balao.x + deslocamento
      const alturaCorpo = balao.raio * 1.25

      /* Barbante: uma curva simples saindo da base. */
      contexto.strokeStyle = 'rgba(255,255,255,0.25)'
      contexto.lineWidth = 1
      contexto.beginPath()
      contexto.moveTo(x, balao.y + alturaCorpo)
      contexto.quadraticCurveTo(
        x + Math.sin(balao.fase) * 8,
        balao.y + alturaCorpo + balao.raio,
        x,
        balao.y + alturaCorpo + balao.raio * 2,
      )
      contexto.stroke()

      contexto.fillStyle = balao.cor
      contexto.beginPath()
      contexto.ellipse(x, balao.y, balao.raio, alturaCorpo, 0, 0, Math.PI * 2)
      contexto.fill()

      /* Bico na base. */
      contexto.beginPath()
      contexto.moveTo(x - 4, balao.y + alturaCorpo)
      contexto.lineTo(x + 4, balao.y + alturaCorpo)
      contexto.lineTo(x, balao.y + alturaCorpo + 6)
      contexto.closePath()
      contexto.fill()

      /* Brilho, para não ficar chapado. */
      contexto.fillStyle = 'rgba(255,255,255,0.28)'
      contexto.beginPath()
      contexto.ellipse(
        x - balao.raio * 0.35,
        balao.y - alturaCorpo * 0.35,
        balao.raio * 0.22,
        alturaCorpo * 0.16,
        -0.5,
        0,
        Math.PI * 2,
      )
      contexto.fill()
    }

    function passo() {
      if (!canvas || !contexto) return
      contexto.clearRect(0, 0, canvas.width, canvas.height)
      quadro += 1

      let visiveis = 0

      for (const balao of baloes) {
        balao.y -= balao.subida
        if (balao.y + balao.raio * 3 < 0) continue

        visiveis += 1
        desenharBalao(
          balao,
          Math.sin(quadro * 0.02 + balao.fase) * balao.balanco,
        )
      }

      if (visiveis === 0) {
        contexto.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      animacao = requestAnimationFrame(passo)
    }

    animacao = requestAnimationFrame(passo)

    return () => cancelAnimationFrame(animacao)
  }, [disparo])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
