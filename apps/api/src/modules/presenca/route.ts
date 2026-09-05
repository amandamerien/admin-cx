import websocket, { type WebSocket } from '@fastify/websocket'
import { toHeaders } from '@/utils/auth.js'
import { tp } from '@/utils/fastify.js'

/* Quem está no painel agora, e onde.
 *
 * Vive só na memória do servidor de propósito: cursor é dado do instante, não
 * tem por que ir ao banco. Se o processo reiniciar, todo mundo reconecta e a
 * lista se refaz sozinha. */
interface Presente {
  socket: WebSocket
  id: string
  nome: string
  avatar: string
  /** Seção em que a pessoa está; o cursor só aparece para quem está na mesma. */
  secao: string
  x: number
  y: number
}

const presentes = new Map<string, Presente>()

/* De quanto em quanto tempo o servidor reenvia a lista inteira.
 *
 * As mensagens de entrada e saída bastam quando tudo dá certo, mas um "saiu"
 * perdido — rede oscilando, aba morta sem fechar o socket — deixaria um cursor
 * fantasma parado na tela para sempre. Reenviar a lista conserta sozinho. */
const SINCRONIA_MS = 10_000

function transmitir(exceto: string, mensagem: unknown) {
  const texto = JSON.stringify(mensagem)

  for (const [chave, presente] of presentes) {
    if (chave === exceto) continue
    /* readyState 1 = aberto. Socket meio fechado é ignorado; o close cuida
       de removê-lo da lista. */
    if (presente.socket.readyState === 1) presente.socket.send(texto)
  }
}

function paraFora(presente: Presente) {
  return {
    id: presente.id,
    nome: presente.nome,
    avatar: presente.avatar,
    secao: presente.secao,
    x: presente.x,
    y: presente.y,
  }
}

/**
 * WebSocket de presença. Cada aba abre uma conexão, manda a própria posição e
 * recebe a dos outros.
 */
export const presencaRoute = tp(async (scope) => {
  await scope.register(websocket)

  scope.get(
    '/presenca',
    { websocket: true, schema: { hide: true } },
    async (socket, request) => {
      const sessao = await scope.services.auth.auth.api.getSession({
        headers: toHeaders(request),
      })

      if (!sessao?.user) {
        socket.close(4001, 'Não autenticado')
        return
      }

      const ficha = await scope.services.painel.fichaDoUsuario(sessao.user.id)
      if (!ficha?.ativo) {
        socket.close(4003, 'Sem acesso')
        return
      }

      /* A chave é por conexão, não por pessoa: a mesma pessoa pode estar em
       duas abas, e cada uma tem o seu cursor. */
      const chave = `${ficha.id}:${Math.random().toString(36).slice(2)}`
      const presente: Presente = {
        socket,
        id: chave,
        nome: ficha.nome,
        avatar: ficha.avatar,
        secao: '',
        x: 0,
        y: 0,
      }
      presentes.set(chave, presente)

      /* Quem chega recebe de uma vez quem já está online. */
      socket.send(
        JSON.stringify({
          tipo: 'inicio',
          eu: chave,
          pessoas: [...presentes.values()]
            .filter((p) => p.id !== chave)
            .map(paraFora),
        }),
      )

      socket.on('message', (bruto: Buffer) => {
        try {
          const dados = JSON.parse(bruto.toString()) as {
            x?: number
            y?: number
            secao?: string
          }

          if (typeof dados.x === 'number') presente.x = dados.x
          if (typeof dados.y === 'number') presente.y = dados.y
          if (typeof dados.secao === 'string') presente.secao = dados.secao

          transmitir(chave, { tipo: 'move', pessoa: paraFora(presente) })
        } catch {
          /* Mensagem malformada não derruba a conexão. */
        }
      })

      function encerrar() {
        clearInterval(sincronia)
        if (!presentes.has(chave)) return

        presentes.delete(chave)
        transmitir(chave, { tipo: 'saiu', id: chave })
      }

      /* Além de curar fantasmas, o envio periódico serve de sinal de vida: se
         o socket já morreu sem avisar, o readyState denuncia e a conexão sai
         da lista. */
      const sincronia = setInterval(() => {
        if (socket.readyState !== 1) {
          encerrar()
          return
        }

        socket.send(
          JSON.stringify({
            tipo: 'sincronia',
            pessoas: [...presentes.values()]
              .filter((p) => p.id !== chave)
              .map(paraFora),
          }),
        )
      }, SINCRONIA_MS)

      socket.on('close', encerrar)
      socket.on('error', encerrar)
    },
  )
})
