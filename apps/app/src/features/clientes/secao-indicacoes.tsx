import { Gift } from 'lucide-react'
import { useState } from 'react'
import { emReais } from './invoice-dados'

/* Regras do programa de indicação.
 *
 * Deduzidas da calculadora do próprio Clickmax e conferidas contra três
 * cenários dela — 1 e 9 indicações com 2 mensagens, e 9 com 4 — que batem ao
 * centavo. Se o preço do crédito ou a comissão mudarem, é aqui que se mexe. */
const REGRAS = {
  /** Comissão sobre a assinatura de quem for indicado. */
  comissaoAssinatura: 0.25,
  /** Comissão sobre os créditos que o indicado comprar. */
  comissaoCreditos: 0.5,
  /** Mensalidade do plano de entrada, a base do cálculo das assinaturas. */
  mensalidadePlanoEntrada: 0,
  creditosPorEnvio: 60,
  creditosPorPacote: 30_000,
  /** O que entra no seu bolso a cada pacote comprado pelo indicado. */
  comissaoPorPacote: 184.96,
} as const

interface Controle {
  id: string
  rotulo: string
  min: number
  max: number
  passo: number
  /** Como o valor aparece na bolha: "9 Indicações", "5.000 leads". */
  formatar: (valor: number) => string
}

const CONTROLES: Controle[] = [
  {
    id: 'indicacoes',
    rotulo: 'Indicações',
    min: 1,
    max: 50,
    passo: 1,
    formatar: (v) => `${v} ${v === 1 ? 'Indicação' : 'Indicações'}`,
  },
  {
    id: 'leads',
    rotulo: 'Leads na base de cada indicado',
    min: 500,
    max: 20_000,
    passo: 500,
    formatar: (v) => `${v.toLocaleString('pt-BR')} leads`,
  },
  {
    id: 'mensagens',
    rotulo: 'Mensagens de marketing por lead',
    min: 1,
    max: 12,
    passo: 1,
    formatar: (v) => `${v} ${v === 1 ? 'mensagem' : 'mensagens'} por lead`,
  },
]

/* Barra com a bolha do valor acompanhando o polegar.
 *
 * O recuo da bolha é proporcional ao quanto ela já andou: no começo ela fica
 * alinhada à esquerda, no fim à direita, e no meio centrada. Recuar sempre
 * metade da largura — o jeito óbvio — faz metade dela sair do quadro nas
 * pontas. */
function Barra({
  controle,
  valor,
  onMudar,
}: {
  controle: Controle
  valor: number
  onMudar: (valor: number) => void
}) {
  const percorrido =
    ((valor - controle.min) / (controle.max - controle.min)) * 100

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={controle.id}
        className="font-inter text-[#ABABAB] text-xs"
      >
        {controle.rotulo}
      </label>

      <div className="relative pt-8">
        <span
          aria-hidden
          style={{
            left: `${percorrido}%`,
            transform: `translateX(-${percorrido}%)`,
          }}
          className="absolute top-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#1B1B1F] px-3 py-1.5 font-inter font-medium text-[#F4F5F5] text-xs"
        >
          {controle.formatar(valor)}
        </span>

        <input
          id={controle.id}
          type="range"
          min={controle.min}
          max={controle.max}
          step={controle.passo}
          value={valor}
          onChange={(evento) => onMudar(Number(evento.target.value))}
          aria-label={controle.rotulo}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/8 accent-sky-400"
          style={{
            background: `linear-gradient(to right, #38BDF8 ${percorrido}%, rgba(255,255,255,0.08) ${percorrido}%)`,
          }}
        />
      </div>
    </div>
  )
}

/* Indique e ganhe — a explicação do programa e a simulação do ganho.
 *
 * É tela de apresentação: o time abre na frente do cliente durante a conversa
 * e mexe nas barras com ele junto. */
export function SecaoIndicacoes() {
  const [indicacoes, setIndicacoes] = useState(7)
  const [leads, setLeads] = useState(5_000)
  const [mensagens, setMensagens] = useState(3)

  const envios = indicacoes * leads * mensagens
  const creditos = envios * REGRAS.creditosPorEnvio
  const pacotes = Math.ceil(creditos / REGRAS.creditosPorPacote)

  const porCreditos = pacotes * REGRAS.comissaoPorPacote
  const porAssinaturas =
    indicacoes * REGRAS.mensalidadePlanoEntrada * REGRAS.comissaoAssinatura
  const total = porCreditos + porAssinaturas

  const valores: Record<string, [number, (v: number) => void]> = {
    indicacoes: [indicacoes, setIndicacoes],
    leads: [leads, setLeads],
    mensagens: [mensagens, setMensagens],
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── O programa ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-xl border border-white/8 bg-white/2 p-6">
        <span className="flex size-10 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20 ring-inset">
          <Gift className="size-5" />
        </span>

        <h2 className="font-inter font-medium text-white text-xl leading-snug">
          Ganhe recompensas ao indicar novos usuários para o Clickmax!
        </h2>

        <p className="font-inter text-[#ABABAB] text-sm leading-relaxed">
          O Clickmax oferece um sistema de indicações que permite que você ganhe{' '}
          <strong className="font-medium text-sky-300">25% de comissão</strong>{' '}
          sobre todo mundo que assinar o Clickmax utilizando seu link.
        </p>

        <div className="mt-auto rounded-lg border border-white/8 bg-white/2 p-4">
          <p className="font-inter text-[#8A8A8F] text-xs leading-relaxed">
            A comissão sobre os créditos que o indicado comprar usa o percentual
            do seu programa — hoje{' '}
            <strong className="font-medium text-[#F4F5F5]">50%</strong> do valor
            da oferta.
          </p>
        </div>
      </section>

      {/* ── Simulação ──────────────────────────────────────── */}
      <section className="flex flex-col gap-5 rounded-xl border border-white/8 bg-white/2 p-6">
        <p className="font-inter text-[#8A8A8F] text-sm">
          Arraste para simular quanto você pode ganhar
        </p>

        <div className="flex flex-col gap-4">
          {CONTROLES.map((controle) => {
            const [valor, definir] = valores[controle.id] ?? [0, () => {}]

            return (
              <Barra
                key={controle.id}
                controle={controle}
                valor={valor}
                onMudar={definir}
              />
            )
          })}
        </div>

        <p className="font-inter font-semibold text-4xl text-white tracking-tight">
          {emReais(total)}
          <span className="font-normal text-[#8A8A8F] text-xl">/mês</span>
        </p>

        <dl className="flex flex-col gap-3 border-white/8 border-t pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <dt>
              <span className="block font-inter text-[#F4F5F5] text-sm">
                Assinaturas dos indicados
              </span>
              <span className="block font-inter text-[#6F6F76] text-xs">
                {indicacoes} {indicacoes === 1 ? 'Indicação' : 'Indicações'}
              </span>
            </dt>
            <dd className="font-inter text-[#F4F5F5] text-sm tabular-nums">
              {emReais(porAssinaturas)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <dt>
              <span className="block font-inter text-[#F4F5F5] text-sm">
                Créditos comprados pelos indicados
              </span>
              <span className="block font-inter text-[#6F6F76] text-xs">
                {pacotes}× {REGRAS.creditosPorPacote.toLocaleString('pt-BR')}{' '}
                créditos · {envios.toLocaleString('pt-BR')} envios
              </span>
            </dt>
            <dd className="font-inter text-[#F4F5F5] text-sm tabular-nums">
              {emReais(porCreditos)}
            </dd>
          </div>
        </dl>

        <p className="font-inter text-[#6F6F76] text-xs leading-relaxed">
          Baseado em indicações para o plano de entrada. Valores estimados: a
          comissão de créditos usa o percentual do seu programa.
        </p>
      </section>
    </div>
  )
}
