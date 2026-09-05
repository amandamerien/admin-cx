import { useEffect, useRef, useState } from 'react'
import { Avatar, COR_AVATAR } from './avatares'
import type { AvatarId } from './dados'

interface Pessoa {
  id: string
  nome: string
  avatar: AvatarId
  secao: string
  /** Posição em porcentagem da janela, para acompanhar telas de tamanhos diferentes. */
  x: number
  y: number
}

/* Uma posição a cada 60ms basta para o cursor parecer contínuo e evita
 * inundar o servidor a cada pixel movido. */
const INTERVALO_MS = 60

/* Presença em tempo real: manda a própria posição e devolve a dos outros.
 *
 * A conexão cai quando o servidor reinicia ou a rede oscila, então ela se
 * refaz sozinha depois de um intervalo. */
export function usePresenca(secao: string) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const socketRef = useRef<WebSocket | null>(null)
  const secaoRef = useRef(secao)
  secaoRef.current = secao

  useEffect(() => {
    let vivo = true
    let reconectar: ReturnType<typeof setTimeout> | null = null

    function conectar() {
      if (!vivo) return

      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
      const url = `${base.replace(/^http/, 'ws')}/presenca`
      const socket = new WebSocket(url)
      socketRef.current = socket

      socket.onmessage = (evento) => {
        const dados = JSON.parse(evento.data) as
          | { tipo: 'inicio'; pessoas: Pessoa[] }
          | { tipo: 'sincronia'; pessoas: Pessoa[] }
          | { tipo: 'move'; pessoa: Pessoa }
          | { tipo: 'saiu'; id: string }

        /* A sincronia troca a lista inteira: é ela que apaga quem saiu sem
           que o aviso tenha chegado. */
        if (dados.tipo === 'inicio' || dados.tipo === 'sincronia') {
          setPessoas(dados.pessoas)
        }

        if (dados.tipo === 'move') {
          setPessoas((atual) => {
            const outras = atual.filter((p) => p.id !== dados.pessoa.id)
            return [...outras, dados.pessoa]
          })
        }

        if (dados.tipo === 'saiu') {
          setPessoas((atual) => atual.filter((p) => p.id !== dados.id))
        }
      }

      socket.onclose = () => {
        /* Só solta a referência se ela ainda for deste socket. O StrictMode
           monta o efeito duas vezes: o fechamento do primeiro chega depois de
           o segundo já ter assumido, e zerar aqui deixaria a página conectada
           mas sem conseguir enviar nada. */
        if (socketRef.current === socket) socketRef.current = null

        setPessoas([])
        if (vivo) reconectar = setTimeout(conectar, 3000)
      }
    }

    conectar()

    return () => {
      vivo = false
      if (reconectar) clearTimeout(reconectar)
      socketRef.current?.close()
    }
  }, [])

  /* Envia a posição do mouse, no máximo uma vez por intervalo. */
  useEffect(() => {
    let ultimo = 0

    function aoMover(evento: MouseEvent) {
      const agora = Date.now()
      if (agora - ultimo < INTERVALO_MS) return
      ultimo = agora

      const socket = socketRef.current
      if (socket?.readyState !== WebSocket.OPEN) return

      /* Janela sem medida (aba em segundo plano, painel escondido) daria
         divisão por zero e mandaria infinito para os outros. */
      const largura = window.innerWidth
      const altura = window.innerHeight
      if (largura === 0 || altura === 0) return

      socket.send(
        JSON.stringify({
          x: (evento.clientX / largura) * 100,
          y: (evento.clientY / altura) * 100,
          secao: secaoRef.current,
        }),
      )
    }

    window.addEventListener('mousemove', aoMover)
    return () => window.removeEventListener('mousemove', aoMover)
  }, [])

  /* Só quem está na mesma tela: cursor de outra seção seria um ponto vagando
     sobre um conteúdo que a pessoa nem está vendo. */
  return pessoas.filter((pessoa) => pessoa.secao === secao)
}

/* Os cursores de quem mais está na mesma tela.
 *
 * Ficam por cima de tudo e não recebem clique — são um reflexo do que os
 * outros estão fazendo, não um controle. */
export function CursoresPresentes({ secao }: { secao: string }) {
  const pessoas = usePresenca(secao)

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden print:hidden">
      {pessoas.map((pessoa) => {
        const cor = COR_AVATAR[pessoa.avatar] ?? '#8A8A8F'

        return (
          <div
            key={pessoa.id}
            className="absolute transition-transform duration-100 ease-linear"
            style={{
              left: `${pessoa.x}%`,
              top: `${pessoa.y}%`,
            }}
          >
            {/* Sem seta desenhada: a do sistema já marca onde o ponteiro
                está. Aqui vai só quem é, ao lado dela. */}
            <span
              className="flex w-max translate-x-3 translate-y-1 items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 shadow-sm"
              style={{ backgroundColor: cor }}
            >
              <Avatar
                avatar={pessoa.avatar}
                rotulo={pessoa.nome}
                className="size-4 rounded-[4px]"
              />
              <span className="font-inter font-medium text-white text-xs drop-shadow-sm">
                {pessoa.nome}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
