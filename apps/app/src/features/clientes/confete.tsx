import { useEffect, useRef } from 'react'

interface Particula {
  x: number
  y: number
  vx: number
  vy: number
  giro: number
  velocidadeGiro: number
  largura: number
  altura: number
  cor: string
  vida: number
}

const CORES = [
  '#38BDF8',
  '#34D399',
  '#FBBF24',
  '#F472B6',
  '#A78BFA',
  '#FFFFFF',
] as const

const GRAVIDADE = 0.16
const ATRITO = 0.99
const DURACAO = 160

/* Estouro de confete, disparado a cada mudança de `disparo`.
 *
 * Canvas próprio, sem biblioteca: as partículas saem do centro da tela, sobem
 * e caem com gravidade, girando enquanto somem. Quem tem "reduzir movimento"
 * ligado não vê nada. */
export function Confete({ disparo }: { disparo: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  /* Guarda o último disparo já comemorado. Começa com o valor atual para o
     efeito não estourar na montagem: sair e entrar de novo remonta este
     componente, e sem isto o confete voltaria a cada login. */
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

    const origemX = canvas.width / 2
    const origemY = canvas.height * 0.42

    const particulas: Particula[] = Array.from({ length: 140 }, () => {
      const angulo = Math.random() * Math.PI * 2
      const forca = 6 + Math.random() * 9

      return {
        x: origemX,
        y: origemY,
        vx: Math.cos(angulo) * forca,
        /* Viés para cima: o estouro sobe antes de cair. */
        vy: Math.sin(angulo) * forca - 4,
        giro: Math.random() * Math.PI,
        velocidadeGiro: (Math.random() - 0.5) * 0.3,
        largura: 5 + Math.random() * 5,
        altura: 8 + Math.random() * 6,
        cor: CORES[Math.floor(Math.random() * CORES.length)] ?? CORES[0],
        vida: DURACAO,
      }
    })

    let animacao = 0

    function passo() {
      if (!canvas || !contexto) return
      contexto.clearRect(0, 0, canvas.width, canvas.height)

      let vivas = 0

      for (const particula of particulas) {
        if (particula.vida <= 0) continue
        vivas += 1

        particula.vx *= ATRITO
        particula.vy = particula.vy * ATRITO + GRAVIDADE
        particula.x += particula.vx
        particula.y += particula.vy
        particula.giro += particula.velocidadeGiro
        particula.vida -= 1

        contexto.save()
        contexto.translate(particula.x, particula.y)
        contexto.rotate(particula.giro)
        contexto.globalAlpha = Math.min(particula.vida / 45, 1)
        contexto.fillStyle = particula.cor
        contexto.fillRect(
          -particula.largura / 2,
          -particula.altura / 2,
          particula.largura,
          particula.altura,
        )
        contexto.restore()
      }

      if (vivas === 0) {
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
