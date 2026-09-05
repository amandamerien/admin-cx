import { useGetAtividades } from '@repo/api-client/hooks'
import { cn } from '@repo/ui'
import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NomeComAvatar } from './avatares'
import type { Administrador } from './dados'

/* A frase de cada tipo de ação. O servidor guarda só `acao` e `alvo`; o texto
 * mora aqui, para mudar a redação sem reescrever o histórico. */
const FRASES: Record<string, (alvo: string, detalhe: string | null) => string> =
  {
    cliente_criado: (alvo) => `adicionou o cliente ${alvo}`,
    entrega_criada: (alvo) => `criou a entrega ${alvo}`,
    entrega_movida: (alvo, detalhe) =>
      `moveu ${alvo} para ${ROTULO_STATUS[detalhe ?? ''] ?? detalhe}`,
    arquivo_adicionado: (alvo) => `anexou ${alvo}`,
    nota_escrita: (alvo) => `escreveu uma nota em ${alvo}`,
    invoice_criado: (alvo) => `emitiu um invoice para ${alvo}`,
    pessoa_adicionada: (alvo) => `adicionou ${alvo} à equipe`,
  }

const ROTULO_STATUS: Record<string, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  aguardando_cliente: 'Aguardando cliente',
  em_revisao: 'Em revisão',
  bloqueado: 'Bloqueado',
  concluido: 'Concluído',
}

/* "há 5 min", "há 2 h", "ontem" — o relógio exato não importa num feed. */
function quandoFoi(iso: string) {
  const agora = Date.now()
  const entao = new Date(iso).getTime()
  const minutos = Math.round((agora - entao) / 60000)

  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`

  const horas = Math.round(minutos / 60)
  if (horas < 24) return `há ${horas} h`

  const dias = Math.round(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}

/* Última vez que esta pessoa abriu o sino, para saber o que é novidade.
 * Fica no navegador: é preferência de leitura, não dado da operação. */
const CHAVE_VISTO = 'cx:atividades-vistas-em'

function lerUltimaVisita() {
  try {
    return localStorage.getItem(CHAVE_VISTO) ?? ''
  } catch {
    return ''
  }
}

/* Sino de atividades no canto inferior direito. */
export function SinoAtividades({
  administradores,
}: {
  administradores: Administrador[]
}) {
  const [aberto, setAberto] = useState(false)
  const [vistoEm, setVistoEm] = useState(lerUltimaVisita)

  /* Recarrega sozinho: o feed é sobre o que os outros fizeram, então esperar
     a próxima navegação da pessoa deixaria a informação velha. */
  const { data } = useGetAtividades({
    query: { refetchInterval: 30_000 },
  })
  const atividades = data?.data.atividades ?? []

  const novas = atividades.filter((a) => a.criadoEm > vistoEm).length

  useEffect(() => {
    if (!aberto) return

    const agora = new Date().toISOString()
    setVistoEm(agora)
    try {
      localStorage.setItem(CHAVE_VISTO, agora)
    } catch {
      /* Navegador sem armazenamento: o sino só deixa de lembrar o que já foi
         lido, o resto continua funcionando. */
    }
  }, [aberto])

  return (
    <div className="fixed right-5 bottom-5 z-50 print:hidden">
      {aberto && (
        <div className="absolute right-0 bottom-14 flex max-h-[70vh] w-80 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#17171A] shadow-2xl">
          <div className="flex items-center justify-between border-white/8 border-b px-4 py-3">
            <span className="font-inter font-medium text-sm text-white">
              Atividades
            </span>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar atividades"
              className="flex size-6 items-center justify-center rounded-md text-[#8A8A8F] transition-colors hover:bg-white/6 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {atividades.length === 0 ? (
            <p className="px-4 py-8 text-center font-inter text-[#6F6F76] text-xs">
              Nada aconteceu por aqui ainda.
            </p>
          ) : (
            <ul className="flex flex-col overflow-y-auto">
              {atividades.map((atividade) => {
                const frase = FRASES[atividade.acao]

                return (
                  <li
                    key={atividade.id}
                    className="border-white/6 border-b px-4 py-3 last:border-b-0"
                  >
                    <p className="font-inter text-[#F4F5F5] text-xs leading-relaxed">
                      <NomeComAvatar
                        administradores={administradores}
                        nome={atividade.autor}
                        className="inline-flex align-middle font-medium"
                      />{' '}
                      {frase
                        ? frase(atividade.alvo, atividade.detalhe)
                        : `${atividade.acao} ${atividade.alvo}`}
                    </p>
                    <p className="pt-0.5 font-inter text-[#6F6F76] text-[10px]">
                      {quandoFoi(atividade.criadoEm)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-label={novas > 0 ? `Atividades, ${novas} novas` : 'Atividades'}
        className={cn(
          'relative flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#17171A] text-[#ABABAB] shadow-lg transition-colors hover:text-white',
          aberto && 'text-white',
        )}
      >
        <Bell className="size-4" />

        {novas > 0 && (
          <span className="-top-1 -right-1 absolute flex min-w-4 items-center justify-center rounded-full bg-sky-400 px-1 font-inter font-semibold text-[10px] text-[#131316] tabular-nums">
            {novas > 9 ? '9+' : novas}
          </span>
        )}
      </button>
    </div>
  )
}
