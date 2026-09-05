import { cn } from '@repo/ui'

/* Caixa aberta com um facho de luz saindo — a ilustração dos estados vazios.
 *
 * É SVG inline, não imagem: acompanha o tamanho do texto, não pesa no bundle e
 * usa a mesma paleta do painel (cinzas frios sobre #131316), então funciona em
 * qualquer bloco sem parecer colada de outro lugar.
 *
 * Os ids dos gradientes levam sufixo próprio porque a ilustração aparece mais
 * de uma vez na mesma tela — ids repetidos fazem um gradiente sobrescrever o
 * outro. */
function CaixaVazia({ id }: { id: string }) {
  const facho = `facho-${id}`
  const halo = `halo-${id}`

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className="size-28 shrink-0"
      role="presentation"
    >
      <defs>
        <radialGradient id={halo}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        {/* O facho nasce forte na boca da caixa e some antes do topo. */}
        <linearGradient id={facho} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="62" r="46" fill={`url(#${halo})`} />
      <circle cx="60" cy="62" r="34" fill="#FFFFFF" fillOpacity="0.03" />

      <path d="M42 66 L30 22 L90 22 L78 66 Z" fill={`url(#${facho})`} />

      {/* Fagulhas subindo com o facho. */}
      <g fill="#FFFFFF">
        <circle cx="50" cy="44" r="1.4" fillOpacity="0.55" />
        <circle cx="70" cy="38" r="1.1" fillOpacity="0.45" />
        <circle cx="60" cy="30" r="1.6" fillOpacity="0.6" />
        <circle cx="64" cy="50" r="1" fillOpacity="0.35" />
        <circle cx="46" cy="33" r="0.9" fillOpacity="0.3" />
        <circle cx="76" cy="52" r="0.9" fillOpacity="0.25" />
      </g>

      {/* Abas laterais da caixa, abertas para fora. */}
      <path d="M34 68 L26 78 L38 82 Z" fill="#2E2E34" />
      <path d="M86 68 L94 78 L82 82 Z" fill="#2E2E34" />

      {/* Corpo, ligeiramente cônico, e a boca aberta por cima. */}
      <path d="M38 70 L82 70 L78 92 L42 92 Z" fill="#35353C" />
      <rect x="34" y="64" width="52" height="8" rx="2" fill="#45454E" />
      <rect x="42" y="66" width="36" height="4" rx="1.5" fill="#17171A" />
    </svg>
  )
}

/* Cadeado de segredo, para o bloco de acessos: mesma paleta e mesmo halo da
 * caixa, para as duas ilustrações lerem como um par. */
function CadeadoVazio({ id }: { id: string }) {
  const halo = `halo-${id}`

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className="size-28 shrink-0"
      role="presentation"
    >
      <defs>
        <radialGradient id={halo}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="62" r="46" fill={`url(#${halo})`} />
      <circle cx="60" cy="62" r="34" fill="#FFFFFF" fillOpacity="0.03" />

      {/* Haste presa por trás do corpo. */}
      <path
        d="M46 60 V46 a14 14 0 0 1 28 0 V60"
        fill="none"
        stroke="#45454E"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <rect
        x="34"
        y="58"
        width="52"
        height="42"
        rx="10"
        fill="#35353C"
        stroke="#45454E"
        strokeWidth="2"
      />

      {/* Os três discos do segredo, como no cadeado de combinação. */}
      <g>
        <circle cx="47" cy="79" r="7" fill="#17171A" />
        <circle cx="60" cy="79" r="7" fill="#17171A" />
        <circle cx="73" cy="79" r="7" fill="#17171A" />
        <circle
          cx="47"
          cy="79"
          r="7"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
        />
        <circle
          cx="60"
          cy="79"
          r="7"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.18"
        />
        <circle
          cx="73"
          cy="79"
          r="7"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
        />
        <rect
          x="46"
          y="76"
          width="2"
          height="6"
          rx="1"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
        <rect
          x="59"
          y="76"
          width="2"
          height="6"
          rx="1"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />
        <rect
          x="72"
          y="76"
          width="2"
          height="6"
          rx="1"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
      </g>
    </svg>
  )
}

/* Folha com uma caneta escrevendo, para o bloco de anotações. As linhas
 * "escritas" vão diminuindo até a ponta da caneta — a última fica pela metade,
 * como se o traço estivesse acontecendo agora. */
function AnotacaoVazia({ id }: { id: string }) {
  const halo = `halo-${id}`

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className="size-28 shrink-0"
      role="presentation"
    >
      <defs>
        <radialGradient id={halo}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="62" r="46" fill={`url(#${halo})`} />
      <circle cx="60" cy="62" r="34" fill="#FFFFFF" fillOpacity="0.03" />

      <rect
        x="32"
        y="36"
        width="48"
        height="58"
        rx="6"
        fill="#35353C"
        stroke="#45454E"
        strokeWidth="2"
      />

      {/* O que já está escrito na folha. */}
      <g fill="#FFFFFF" fillOpacity="0.16">
        <rect x="41" y="49" width="30" height="3.5" rx="1.75" />
        <rect x="41" y="59" width="24" height="3.5" rx="1.75" />
        <rect x="41" y="69" width="27" height="3.5" rx="1.75" />
      </g>

      {/* A linha em andamento, saindo debaixo da ponta. */}
      <rect
        x="41"
        y="79"
        width="13"
        height="3.5"
        rx="1.75"
        fill="#FFFFFF"
        fillOpacity="0.38"
      />

      {/* Caneta inclinada, com a ponta encostando onde o traço termina. */}
      <g transform="rotate(38 62 74)">
        <rect x="57" y="34" width="11" height="34" rx="3" fill="#4A4A54" />
        <rect x="57" y="62" width="11" height="6" fill="#5B5B67" />
        <path d="M57 68 L68 68 L62.5 80 Z" fill="#6E6E7B" />
        <path d="M60.5 75.5 L64.5 75.5 L62.5 80 Z" fill="#17171A" />
      </g>
    </svg>
  )
}

/* Bloco de "ainda não tem nada aqui": ilustração, o que falta e o que fazer. */
export function EstadoVazio({
  id,
  desenho = 'caixa',
  titulo,
  descricao,
  className,
}: {
  /** Sufixo dos ids do SVG — único por bloco na mesma tela. */
  id: string
  desenho?: 'caixa' | 'cadeado' | 'anotacao'
  titulo: string
  descricao?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl border border-white/8 border-dashed px-6 py-8',
        className,
      )}
    >
      {desenho === 'cadeado' && <CadeadoVazio id={id} />}
      {desenho === 'anotacao' && <AnotacaoVazia id={id} />}
      {desenho === 'caixa' && <CaixaVazia id={id} />}

      <p className="font-inter font-medium text-[#ABABAB] text-sm">{titulo}</p>

      {descricao && (
        <p className="max-w-[40ch] text-center font-inter text-[#6F6F76] text-xs leading-relaxed">
          {descricao}
        </p>
      )}
    </div>
  )
}
