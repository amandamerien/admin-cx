import { useEffect, useRef } from 'react'

/* Uma estrela: bloco de 1 a 3 pixels que pisca no próprio ritmo. */
interface Estrela {
  x: number
  y: number
  lado: number
  fase: number
  velocidade: number
  brilhoBase: number
}

/* Estrela cadente: percorre a tela na diagonal deixando um rastro pixelado. */
interface Cadente {
  x: number
  y: number
  passoX: number
  passoY: number
  vida: number
}

const CORES = ['#FFFFFF', '#BAE6FD', '#7DD3FC'] as const

/* Fundo de estrelas pixeladas, desenhado em canvas.
 *
 * O visual é o do "Background Pixel Stars" (uicapsule, MIT) — estrelas retrô
 * piscando com estrelas cadentes de tempos em tempos —, mas a implementação é
 * própria. Respeita `prefers-reduced-motion`: sem animação, desenha o céu
 * parado uma vez só. */
export function FundoEstrelas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const contexto = canvas.getContext('2d')
    if (!contexto) return

    const semAnimacao = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let estrelas: Estrela[] = []
    let cadentes: Cadente[] = []
    let quadro = 0
    let proximaCadente = 120

    function dimensionar() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      /* Densidade proporcional à área, para telas grandes não ficarem vazias. */
      const quantidade = Math.round((canvas.width * canvas.height) / 6000)

      estrelas = Array.from({ length: quantidade }, () => ({
        x: Math.floor(Math.random() * canvas.width),
        y: Math.floor(Math.random() * canvas.height),
        lado: Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 2 : 1,
        fase: Math.random() * Math.PI * 2,
        velocidade: 0.01 + Math.random() * 0.03,
        brilhoBase: 0.25 + Math.random() * 0.45,
      }))
    }

    function criarCadente(): Cadente {
      if (!canvas) return { x: 0, y: 0, passoX: 0, passoY: 0, vida: 0 }
      return {
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.4,
        passoX: 4 + Math.random() * 3,
        passoY: 2 + Math.random() * 2,
        vida: 40 + Math.random() * 25,
      }
    }

    function desenhar() {
      if (!canvas || !contexto) return
      contexto.clearRect(0, 0, canvas.width, canvas.height)

      for (const [indice, estrela] of estrelas.entries()) {
        const oscilacao = semAnimacao
          ? 1
          : (Math.sin(quadro * estrela.velocidade + estrela.fase) + 1) / 2
        const brilho = estrela.brilhoBase * (0.4 + oscilacao * 0.6)

        contexto.globalAlpha = brilho
        contexto.fillStyle = CORES[indice % CORES.length] ?? CORES[0]
        contexto.fillRect(estrela.x, estrela.y, estrela.lado, estrela.lado)
      }

      /* Rastro da cadente: blocos que vão sumindo para trás. */
      for (const cadente of cadentes) {
        for (let passo = 0; passo < 8; passo += 1) {
          contexto.globalAlpha = (1 - passo / 8) * 0.9
          contexto.fillStyle = '#E0F2FE'
          contexto.fillRect(
            cadente.x - cadente.passoX * passo,
            cadente.y - cadente.passoY * passo,
            2,
            2,
          )
        }
      }

      contexto.globalAlpha = 1
    }

    let animacao = 0

    function passo() {
      quadro += 1

      for (const cadente of cadentes) {
        cadente.x += cadente.passoX
        cadente.y += cadente.passoY
        cadente.vida -= 1
      }
      cadentes = cadentes.filter((cadente) => cadente.vida > 0)

      proximaCadente -= 1
      if (proximaCadente <= 0) {
        cadentes.push(criarCadente())
        proximaCadente = 260 + Math.random() * 340
      }

      desenhar()
      animacao = requestAnimationFrame(passo)
    }

    dimensionar()

    if (semAnimacao) {
      desenhar()
    } else {
      animacao = requestAnimationFrame(passo)
    }

    const aoRedimensionar = () => {
      dimensionar()
      if (semAnimacao) desenhar()
    }

    window.addEventListener('resize', aoRedimensionar)

    return () => {
      cancelAnimationFrame(animacao)
      window.removeEventListener('resize', aoRedimensionar)
    }
  }, [])

  /* O `aria-hidden` vai no invólucro: em <canvas> o lint reclama, porque um
     canvas pode receber foco. O fundo é decorativo e não deve ser lido. */
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
